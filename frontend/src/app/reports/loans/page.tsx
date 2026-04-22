"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import api from '@/lib/api';

export default function LoansAccountPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controles del reporte
  const [viewCurrency, setViewCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(500);
  const [isDetailed, setIsDetailed] = useState(false);
  const [expandedRows, setExpandedRows] = useState<any[]>([]);

  useEffect(() => {
    fetchLoans();
  }, [viewCurrency, isDetailed]); // NO recalculamos automáticamente si escribe la tasa, lo hace manual con botón

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/loans-account', {
        params: {
          viewType: isDetailed ? 'DETAILED' : 'SUMMARIZED',
          currencyView: viewCurrency,
          exchangeRate: exchangeRate
        }
      });
      setLoans(res.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchClick = () => {
     fetchLoans();
  };

  const formatDynCurrency = (val: number) => {
    return new Intl.NumberFormat(viewCurrency === 'VES' ? 'es-VE' : 'en-US', { 
      style: 'currency', 
      currency: viewCurrency 
    }).format(val);
  };

  // Efecto para auto-expandir cuando cambia a detallado
  useEffect(() => {
    if (isDetailed) {
      setExpandedRows(loans);
    } else {
      setExpandedRows([]);
    }
  }, [isDetailed, loans]);

  const totalPrestado = loans.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
  const saldoGlobal = loans.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const porcentajeCobrado = totalPrestado > 0 ? ((totalPrestado - saldoGlobal) / totalPrestado) * 100 : 0;

  // Expansion Row (Histórico de Amortizaciones)
  const amortizationsTemplate = (loan: any) => {
    if (!isDetailed) return <div className="p-3 text-center text-gray-500 text-sm">Cambie a vista "Detallada" para cargar el historial de cobros.</div>;
    
    if (!loan.amortizations || loan.amortizations.length === 0) {
       return <div className="p-3 text-center text-gray-500 text-sm">No hay histórico de amortizaciones en nóminas cerradas para este préstamo.</div>;
    }

    return (
      <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-lg ml-12 shadow-inner">
        <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3">Histórico de Amortizaciones Descontadas</h5>
        <DataTable value={loan.amortizations} size="small" className="text-sm">
          <Column field="periodName" header="Nómina de Descuento" className="font-semibold text-gray-800"></Column>
          <Column field="periodDate" header="Fecha Cierre" body={(r) => new Date(r.periodDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}></Column>
          <Column field="historicalRate" header="Tasa Histórica" body={(r) => `Bs. ${Number(r.historicalRate).toFixed(2)}`} className="text-gray-500 font-mono"></Column>
          <Column field="amount" header={`Monto Cobrado (${viewCurrency})`} body={(r) => <span className="font-bold text-emerald-600">+{formatDynCurrency(r.amount)}</span>}></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Estado de Cuenta de Préstamos</h1>
            <p className="text-gray-600">Monitor consolidado de financiamientos laborales y deducciones históricas en nómina.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-200 p-2 pl-4 pr-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tasa Global<br/>(Para Saldos)</span>
               <input 
                  type="number" 
                  value={exchangeRate} 
                  onChange={(e) => setExchangeRate(Number(e.target.value) || 1)} 
                  className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono outline-indigo-500"
               />
               <Button icon="pi pi-refresh" severity="secondary" rounded text aria-label="Refrescar" onClick={handleFetchClick} />
            </div>

            <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-1">
              <button onClick={() => setViewCurrency('VES')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewCurrency === 'VES' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>VES</button>
              <button onClick={() => setViewCurrency('USD')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewCurrency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>USD</button>
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
               <span className="text-xs font-bold text-indigo-700">Modo Detallado</span>
               <InputSwitch checked={isDetailed} onChange={(e) => setIsDetailed(e.value || false)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Casos Abiertos</h3>
            <p className="text-3xl font-black text-slate-800">{loans.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Prestado</h3>
            <p className="text-2xl font-black text-indigo-600">{formatDynCurrency(totalPrestado)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Saldo Global en Deuda</h3>
            <p className="text-2xl font-black text-rose-500">{formatDynCurrency(saldoGlobal)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-1">Retorno de Capital</h3>
            <div className="flex items-end gap-2">
               <p className="text-3xl font-black text-emerald-600">{porcentajeCobrado.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <DataTable 
             value={loans} 
             paginator 
             rows={15} 
             dataKey="loanId"
             loading={loading}
             expandedRows={expandedRows} 
             onRowToggle={(e) => setExpandedRows(e.data as any[])} 
             rowExpansionTemplate={amortizationsTemplate} 
             emptyMessage="No hay préstamos registrados."
             className="p-datatable-sm text-sm"
          >
            {isDetailed && <Column expander style={{ width: '3rem' }} />}
            <Column field="workerName" header="Trabajador" body={(r) => <span className="font-bold text-indigo-900">{r.workerName} <br/><span className="text-xs font-normal text-gray-500">CI/ID: {r.identityNumber}</span></span>}></Column>
            <Column field="departmentName" header="Departamento"></Column>
            <Column field="issueDate" header="Aprobación" body={(r) => <span className="text-gray-500">{new Date(r.issueDate).toLocaleDateString('es-ES')}</span>}></Column>
            <Column field="status" header="Estado" body={(r) => <Tag severity={r.status === 'ACTIVE' ? 'success' : 'info'} value={r.status} />}></Column>
            
            <Column field="totalAmount" header={`Capital (${viewCurrency})`} body={(r) => <span className="font-mono text-gray-700">{formatDynCurrency(r.totalAmount)}</span>} className="text-right"></Column>
            <Column field="balance" header={`Saldo Restante (${viewCurrency})`} body={(r) => <span className="font-bold font-mono text-rose-600">{formatDynCurrency(r.balance)}</span>} className="text-right"></Column>
          </DataTable>
        </div>
      </div>
    </AppLayout>
  );
}
