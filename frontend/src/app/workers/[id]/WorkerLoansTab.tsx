"use client";

import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import Dialog from '../../../components/ui/Dialog';
import Dropdown from '../../../components/ui/Dropdown';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';
import { ProgressBar } from 'primereact/progressbar';

const loanSchema = yup.object({
  totalAmount: yup.number().positive('Monto inválido').required('Requerido'),
  installmentAmount: yup.number().positive('Cuota inválida').required('Requerido'),
  currency: yup.string().required('Moneda requerida'),
  applyToRegular: yup.boolean().default(true),
  applyToVacation: yup.boolean().default(false),
  applyToBonus: yup.boolean().default(false),
  applyToSpecial: yup.boolean().default(false),
  applyToLiquidation: yup.boolean().default(true)
}).required();

export default function WorkerLoansTab({ workerId, hasActiveContract }: { workerId: string, hasActiveContract: boolean }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(loanSchema) as any,
    defaultValues: {
      totalAmount: 0,
      installmentAmount: 0,
      currency: 'VES',
      applyToRegular: true,
      applyToVacation: false,
      applyToBonus: false,
      applyToSpecial: false,
      applyToLiquidation: true
    }
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/worker-loans?workerId=${workerId}`);
      setLoans(res.data);
      if (showDetails) setExpandedRows(res.data);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [workerId]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await api.post('/worker-loans', { ...data, workerId });
      setShowDialog(false);
      reset();
      fetchLoans();
    } catch (e) {
      console.error(e);
      alert('Error guardando préstamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLoan = async (id: string) => {
    if (confirm('¿Eliminar o invalidar este préstamo?')) {
      try {
        await api.delete(`/worker-loans/${id}`);
        fetchLoans();
      } catch(e) { console.error(e); }
    }
  };

  const cancelLoanParams = async (id: string) => {
    if (confirm('¿Marcar como pagado forzosamente?')) {
      try {
        await api.patch(`/worker-loans/${id}`, { status: 'PAID', outstandingBalance: 0 });
        fetchLoans();
      } catch(e) { console.error(e); }
    }
  };

  const header = (
    <div className="flex justify-between items-center bg-gray-50 border-b border-gray-100 p-4">
      <div className="flex items-center gap-6">
        <h3 className="font-semibold text-gray-800 m-0">Historial y Control de Préstamos</h3>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200">
           <InputSwitch checked={showDetails} onChange={(e) => {
               setShowDetails(e.value);
               if (e.value) setExpandedRows(loans);
               else setExpandedRows([]);
           }} />
           <span className="text-xs font-semibold text-gray-600">Mostrar Detalles</span>
        </div>
      </div>
      {hasActiveContract ? (
          <Button label="Otorgar Préstamo" icon="pi pi-money-bill" size="small" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowDialog(true)} />
      ) : (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-200">
             <i className="pi pi-exclamation-triangle"></i>
             <span className="text-xs font-bold uppercase tracking-wider">No se pueden otorgar préstamos sin contrato activo</span>
          </div>
      )}
    </div>
  );

  const statusTemplate = (r: any) => {
     if (r.status === 'PAID') return <span className="px-2 py-1 text-[10px] uppercase font-bold bg-green-100 text-green-700 rounded border border-green-200">Cancelado</span>;
     return <span className="px-2 py-1 text-[10px] uppercase font-bold bg-amber-100 text-amber-700 rounded border border-amber-200">Activo / Deudor</span>;
  };

  const progressTemplate = (r: any) => {
     const total = Number(r.totalAmount);

     let paid = 0;
     if (r.amortizations) {
        r.amortizations.forEach((a: any) => {
           let amortAmount = Number(a.amount);
           const pRate = Number(a.periodExchangeRate) || 1;
           if (a.periodCurrency === 'VES' && r.currency === 'USD') {
              amortAmount /= pRate;
           } else if (a.periodCurrency === 'USD' && r.currency === 'VES') {
              amortAmount *= pRate;
           }
           paid += amortAmount;
        });
     }

     let balance = total - paid;
     if (balance < 0) balance = 0;
     
     // Si el status forzado es PAID por un administrador y la matemática da que aún debe, forzamos balance a 0 y asimilamos paid a total
     if (r.status === 'PAID') {
         balance = 0;
         paid = total;
     }

     const percentage = total > 0 ? (paid / total) * 100 : 100;
     
     return (
        <div className="w-full">
           <div className="flex justify-between text-[11px] font-mono mb-1 text-gray-500">
             <span>Pagado: {paid.toFixed(2)} {r.currency}</span>
             <span className="font-bold text-gray-700">Deuda: {balance.toFixed(2)} {r.currency}</span>
           </div>
           <ProgressBar value={percentage} showValue={false} className="h-2 bg-gray-100" color={percentage >= 100 ? '#22c55e' : '#6366f1'} />
        </div>
     )
  };

  const rulesTemplate = (r: any) => {
    return (
       <div className="flex flex-col gap-1 text-[10px] text-gray-500">
         {r.applyToRegular && <span>✅ Nómina Regular</span>}
         {r.applyToVacation && <span>✅ Nómina Vacaciones</span>}
         {r.applyToBonus && <span>✅ Nómina Utilidades</span>}
         {r.applyToSpecial && <span>✅ Nómina Especial</span>}
         {r.applyToLiquidation && <span>✅ Liquidaciones</span>}
       </div>
    );
  }

  const amortizationsTemplate = (loan: any) => {
    if (!loan.amortizations || loan.amortizations.length === 0) {
       return <div className="p-3 text-center text-gray-500 text-sm">Aún no posee cuotas descontadas asociadas a este préstamo.</div>;
    }

    return (
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg ml-12">
        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Historial de Cuotas Descontadas</h5>
        <DataTable value={loan.amortizations} size="small" className="text-sm">
          <Column field="periodName" header="Concepto / Nómina" className="font-semibold text-slate-800"></Column>
          <Column field="periodDate" header="Fecha de Cierre" body={(r) => new Date(r.periodDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}></Column>
          <Column field="amount" header="Monto Cobrado" body={(r) => {
             let amountUSD = 0;
             let amountVES = 0;
             const rate = Number(r.periodExchangeRate) || 1;
             
             if (r.periodCurrency === 'VES') {
                amountVES = Number(r.amount);
                amountUSD = amountVES / rate;
             } else {
                amountUSD = Number(r.amount);
                amountVES = amountUSD * rate;
             }
             
             return (
               <div className="flex flex-col">
                 <span className="font-bold text-emerald-600">+{amountVES.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VES</span>
                 <span className="text-[10px] text-gray-500 font-semibold">{amountUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</span>
               </div>
             );
          }}></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <DataTable 
        value={loans} 
        header={header} 
        loading={loading} 
        dataKey="id"
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data as any[])}
        rowExpansionTemplate={amortizationsTemplate}
        emptyMessage="El trabajador no registra historial de préstamos o créditos." 
        stripedRows 
        className="p-datatable-sm"
      >
        <Column expander style={{ width: '3rem' }} />
        <Column header="Monto Otorgado" body={(r) => <span className="font-bold text-gray-900">${Number(r.totalAmount).toLocaleString('en-US')} {r.currency}</span>} />
        <Column header="Cuota Base" body={(r) => <span className="text-gray-600">${Number(r.installmentAmount).toLocaleString('en-US')} {r.currency} / Nóm.</span>} />
        <Column header="Amortización" body={progressTemplate} style={{ minWidth: '250px' }} />
        <Column header="Condiciones de Cobro" body={rulesTemplate} />
        <Column header="Estatus" body={statusTemplate} />
        <Column header="" body={(r) => (
           <div className="flex gap-2">
             {r.status === 'ACTIVE' && <Button icon="pi pi-check-circle" rounded outlined severity="success" title="Condonar/Pagar Fozosamente" onClick={() => cancelLoanParams(r.id)} />}
             <Button icon="pi pi-trash" rounded outlined severity="danger" title="Eliminar del histórico" onClick={() => deleteLoan(r.id)} />
           </div>
        )} />
      </DataTable>

      <Dialog visible={showDialog} header="Otorgar Préstamo" style={{ width: '45vw' }} onHide={() => setShowDialog(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start gap-3">
             <i className="pi pi-info-circle text-indigo-500 mt-1"></i>
             <p className="text-sm text-indigo-900 m-0">El sistema retendrá la cuota indicada automáticamente en las nóminas futuras según las reglas marcadas debajo, hasta extinguir la deuda total registrada.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total Otorgado</label>
              <Controller name="totalAmount" control={control} render={({field}) => (
                <InputText type="number" step="0.01" name={field.name} onBlur={field.onBlur} value={field.value?.toString() || ''} className="w-full" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              )} />
            </div>

            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuota por Nómina</label>
              <Controller name="installmentAmount" control={control} render={({field}) => (
                <InputText type="number" step="0.01" name={field.name} onBlur={field.onBlur} value={field.value?.toString() || ''} className="w-full" onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              )} />
            </div>

            <div className="field col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Moneda del Préstamo</label>
               <Controller name="currency" control={control} render={({field}) => (
                 <Dropdown value={field.value} onChange={e => field.onChange(e.value)} options={[{label: 'Bolívares (VES)', value: 'VES'}, {label: 'Dólares (USD)', value: 'USD'}]} className="w-full" />
               )} />
            </div>
          </div>

          <h4 className="border-b pb-2 text-sm font-bold text-gray-600 mt-6 mb-2">Matriz de Cobro Dinámico</h4>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
             <div className="flex items-center gap-2">
                <Controller name="applyToRegular" control={control} render={({field}) => (
                   <Checkbox inputId="cb1" checked={field.value} onChange={e => field.onChange(e.checked)} />
                )} />
                <label htmlFor="cb1" className="text-sm text-gray-700">Cobrar en Regulares</label>
             </div>
             <div className="flex items-center gap-2">
                <Controller name="applyToVacation" control={control} render={({field}) => (
                   <Checkbox inputId="cb2" checked={field.value} onChange={e => field.onChange(e.checked)} />
                )} />
                <label htmlFor="cb2" className="text-sm text-gray-700">Cobrar en Vacaciones</label>
             </div>
             <div className="flex items-center gap-2">
                <Controller name="applyToBonus" control={control} render={({field}) => (
                   <Checkbox inputId="cb3" checked={field.value} onChange={e => field.onChange(e.checked)} />
                )} />
                <label htmlFor="cb3" className="text-sm text-gray-700">Cobrar en Utilidades</label>
             </div>
             <div className="flex items-center gap-2">
                <Controller name="applyToSpecial" control={control} render={({field}) => (
                   <Checkbox inputId="cb5" checked={field.value} onChange={e => field.onChange(e.checked)} />
                )} />
                <label htmlFor="cb5" className="text-sm text-gray-700">Cobrar en Nóms Especiales</label>
             </div>
             <div className="flex items-center gap-2 col-span-2 mt-2 pt-2 border-t border-gray-200">
                <Controller name="applyToLiquidation" control={control} render={({field}) => (
                   <Checkbox inputId="cb4" checked={field.value} onChange={e => field.onChange(e.checked)} />
                )} />
                <label htmlFor="cb4" className="text-sm font-bold text-red-600">Cobrar deuda total en Liquidación</label>
             </div>
          </div>

          <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 gap-2">
             <Button type="button" label="Cancelar" className="p-button-text" onClick={() => setShowDialog(false)} />
             <Button type="submit" label="Registrar Préstamo" loading={isSubmitting} className="bg-indigo-600 border-none px-6" />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
