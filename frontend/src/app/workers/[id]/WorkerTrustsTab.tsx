import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import Dropdown from '@/components/ui/Dropdown';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';

const transactionSchema = yup.object().shape({
  type: yup.string().required('Requerido'),
  amount: yup.number().positive('Monto inválido').required('Requerido'),
  referenceDate: yup.date().required('Requerido'),
  notes: yup.string().nullable(),
});

export default function WorkerTrustsTab({ contracts }: { contracts: any[] }) {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [trust, setTrust] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: { type: 'ADVANCE', amount: 0, referenceDate: new Date() as any, notes: '' }
  });

  useEffect(() => {
    // Auto-select active contract
    const active = contracts.find(c => c.isActive);
    if (active) setSelectedContractId(active.id);
    else if (contracts.length > 0) setSelectedContractId(contracts[0].id);
  }, [contracts]);

  useEffect(() => {
    if (selectedContractId) {
      fetchTrust(selectedContractId);
    }
  }, [selectedContractId]);

  const fetchTrust = async (contractId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/contract-trusts/by-employment/${contractId}`);
      setTrust(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setTrust(null); // Not initialized
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el Fideicomiso' });
      }
    } finally {
      setLoading(false);
    }
  };

  const openNewTransaction = () => {
    if (!trust) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'El fideicomiso debe tener fondos primero (mediante nómina de prestaciones).' });
      return;
    }
    reset({ type: 'ADVANCE', amount: 0, referenceDate: new Date() as any, notes: '' });
    setShowDialog(true);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (!selectedContractId) return;
      const formattedData = {
        ...data,
        referenceDate: data.referenceDate.toISOString().split('T')[0]
      };
      await api.post(`/contract-trusts/by-employment/${selectedContractId}/transactions`, formattedData);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Operación Registrada' });
      setShowDialog(false);
      fetchTrust(selectedContractId);
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Fondos Insuficientes / Error', 
        detail: error.response?.data?.message || 'Hubo un error operando sobre el fideicomiso' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(val || 0);
  };

  const contractOptions = contracts.map(c => ({
    label: `${c.position} - ${c.isActive ? 'Activo' : 'Liquidado'} (${c.startDate.split('T')[0]})`,
    value: c.id
  }));

  if (contracts.length === 0) {
    return <div className="p-8 text-center text-gray-500">Este trabajador no tiene contratos.</div>;
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-semibold text-gray-600 block mb-2">Ver Fideicomiso del Contrato:</label>
          <Dropdown 
             value={selectedContractId} 
             options={contractOptions} 
             onChange={(e) => setSelectedContractId(e.value)} 
             className="w-full"
          />
        </div>
        <div>
          <Button label="Registrar Retiro / Adelanto" icon="pi pi-money-bill" severity="warning" onClick={openNewTransaction} disabled={!trust || Number(trust.availableBalance) <= 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <i className="pi pi-wallet" style={{ fontSize: '6rem' }}></i>
          </div>
          <span className="text-emerald-700 font-bold text-sm uppercase mb-1">Total Acumulado</span>
          <span className="text-emerald-600 font-black text-3xl">{formatCurrency(trust ? Number(trust.totalAccumulated) : 0)}</span>
          <span className="text-emerald-600 text-xs mt-1">Suma de aportes de Nóminas PRESTACIONES</span>
        </div>
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <i className="pi pi-arrow-circle-down" style={{ fontSize: '6rem' }}></i>
          </div>
          <span className="text-amber-700 font-bold text-sm uppercase mb-1">Total Retiros y Adelantos</span>
          <span className="text-amber-600 font-black text-3xl">{formatCurrency(trust ? Number(trust.totalAdvances) : 0)}</span>
          <span className="text-amber-600 text-xs mt-1">Dinero ya otorgado al trabajador</span>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col justify-center shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-10">
            <i className="pi pi-lock-open" style={{ fontSize: '6rem' }}></i>
          </div>
          <span className="text-blue-700 font-bold text-sm uppercase mb-1">Saldo Disponible</span>
          <span className="text-blue-600 font-black text-3xl">{formatCurrency(trust ? Number(trust.availableBalance) : 0)}</span>
          <span className="text-blue-600 text-xs mt-1">Saldo líquido para retiros de Fideicomiso</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <DataTable value={trust?.transactions || []} loading={loading} paginator rows={10} emptyMessage="No hay historial de movimientos">
          <Column field="referenceDate" header="Fecha Trans." body={(r) => r.referenceDate.split('T')[0]} />
          <Column field="type" header="Concepto" body={(r) => (
             <span className={`px-2 py-1 rounded-md text-xs font-bold ${
               r.type === 'DEPOSIT' || r.type === 'INTEREST' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
             }`}>
               {r.type === 'DEPOSIT' ? 'ABONO NÓMINA' : r.type === 'ADVANCE' ? 'ADELANTO' : r.type === 'WITHDRAWAL' ? 'RETIRO' : 'INTERÉS'}
             </span>
          )} />
          <Column field="amount" header="Monto" body={(r) => formatCurrency(Number(r.amount))} />
          <Column field="notes" header="Observaciones" />
        </DataTable>
      </div>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header="Registrar Movimiento (Retiro/Adelanto)"
        className="w-full max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Operación <span className="text-red-500">*</span></label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Dropdown {...field} options={[
                  { label: 'Adelanto de Fideicomiso (-)', value: 'ADVANCE' },
                  { label: 'Retiro Definitivo (-)', value: 'WITHDRAWAL' },
                  { label: 'Intereses / Otros Abonos (+)', value: 'INTEREST' }
                ]} className="w-full" />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Monto <span className="text-red-500">*</span></label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <InputText 
                  {...field} 
                  type="number" step="0.01" 
                  value={field.value?.toString() || ''}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                  className={`w-full font-bold ${errors.amount ? 'p-invalid' : ''}`} 
                  placeholder="0.00"
                />
              )}
            />
            {errors.amount && <small className="text-red-500">{errors.amount.message as string}</small>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <InputText {...field} className="w-full" placeholder="Adelanto para escolaridad..." />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Registrar Movimiento" loading={isSubmitting} unstyled className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 font-semibold border border-amber-500 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
