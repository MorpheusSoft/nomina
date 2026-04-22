"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function PortalLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controles
  const [viewCurrency, setViewCurrency] = useState('USD');
  const [expandedRows, setExpandedRows] = useState<any[]>([]);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const workerId = localStorage.getItem('portal_worker_id');
    if (!workerId) {
      router.push('/portal/login');
      return;
    }
    fetchLoans(workerId);
  }, [viewCurrency]);

  const fetchLoans = async (workerId: string) => {
    setLoading(true);
    try {
      // Usamos el endpoint específico para el portal del trabajador, que ya le aplica lógica estricta.
      // Se omite la tasa de cambio manual para los trabajadores, asumiendo Tasa 1 por defecto (VES bruto)
      // pero el backend lo resolverá. Si el backend nos pide Tasa Act para USD, pasaremos 1 si no está configurada,
      // o usaremos el endpoint con la configuración global que tenga el servidor.
      const res = await axios.get(`${BASE_URL}/portal/loans/${workerId}`, {
        params: {
          currencyView: viewCurrency
          // El trabajador no puede manipular la tasa Global, por lo que hereda la tasa por defecto u omitida
        }
      });
      setLoans(res.data);
      setExpandedRows(res.data); // Autoexpandir para facilitar la vista
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar su historial crediticio' });
    } finally {
      setLoading(false);
    }
  };

  const formatDynCurrency = (val: number) => {
    return new Intl.NumberFormat(viewCurrency === 'VES' ? 'es-VE' : 'en-US', { 
      style: 'currency', 
      currency: viewCurrency 
    }).format(val);
  };

  const totalPrestado = loans.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const saldoGlobal = loans.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const porcentajeCobrado = totalPrestado > 0 ? ((totalPrestado - saldoGlobal) / totalPrestado) * 100 : 0;

  // Expansion Row (Histórico de Amortizaciones)
  const amortizationsTemplate = (loan: any) => {
    if (!loan.amortizations || loan.amortizations.length === 0) {
       return <div className="p-3 text-center text-gray-500 text-sm">Aún no posee cuotas descontadas en nóminas asociadas a este préstamo.</div>;
    }

    return (
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg ml-12">
        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Historial de Cuotas Descontadas</h5>
        <DataTable value={loan.amortizations} size="small" className="text-sm">
          <Column field="periodName" header="Concepto / Nómina" className="font-semibold text-slate-800"></Column>
          <Column field="periodDate" header="Fecha de Cierre" body={(r) => new Date(r.periodDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}></Column>
          <Column field="amount" header={`Monto Cobrado (${viewCurrency})`} body={(r) => <span className="font-bold text-emerald-600">+{formatDynCurrency(r.amount)}</span>}></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      <div className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity w-fit" onClick={() => router.push('/portal/dashboard')}>
         <i className="pi pi-arrow-left text-xl text-indigo-600"></i>
         <h1 className="text-xl font-bold text-slate-800 tracking-tight">Volver al Panel Central</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <i className="pi pi-credit-card text-2xl"></i>
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-800">Estado de Cuenta de Préstamos</h2>
             <p className="text-sm text-slate-500 font-medium">Histórico de financiamientos y retornos de capital.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Solicitado</h3>
          <p className="text-2xl font-black text-indigo-600">{formatDynCurrency(totalPrestado)}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Saldo en Deuda</h3>
          <p className="text-2xl font-black text-rose-500">{formatDynCurrency(saldoGlobal)}</p>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-2">Progreso de Pago</h3>
          <div className="flex items-center gap-3">
             <ProgressBar value={Math.min(porcentajeCobrado, 100)} showValue={false} color="#10b981" style={{ height: '8px' }} className="flex-1" />
             <span className="font-bold text-emerald-700 text-sm">{porcentajeCobrado.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Detalle de Financiamientos</h3>
        <DataTable 
           value={loans} 
           paginator 
           rows={10} 
           dataKey="loanId"
           loading={loading}
           expandedRows={expandedRows} 
           onRowToggle={(e) => setExpandedRows(e.data as any[])} 
           rowExpansionTemplate={amortizationsTemplate} 
           emptyMessage="Usted no posee préstamos o anticipos registrados en el sistema."
           className="p-datatable-sm text-sm"
        >
          <Column expander style={{ width: '3rem' }} />
          <Column field="issueDate" header="Fecha de Emisión" body={(r) => <span className="font-medium text-slate-800">{new Date(r.issueDate).toLocaleDateString('es-ES')}</span>}></Column>
          <Column field="status" header="Estado" body={(r) => <Tag severity={r.status === 'ACTIVE' ? 'success' : (r.status === 'PAID' ? 'info' : 'warning')} value={r.status === 'PAID' ? 'PAGADO' : (r.status === 'ACTIVE' ? 'ACTIVO' : r.status)} />}></Column>
          <Column field="totalAmount" header={`Monto Original`} body={(r) => <span className="font-mono text-slate-700 font-semibold">{formatDynCurrency(r.totalAmount)}</span>} className="text-right"></Column>
          <Column field="balance" header={`Saldo Restante`} body={(r) => <span className="font-bold font-mono text-rose-600">{formatDynCurrency(r.balance)}</span>} className="text-right"></Column>
        </DataTable>
      </div>
    </div>
  );
}
