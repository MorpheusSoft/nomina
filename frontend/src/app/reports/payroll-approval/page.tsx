"use client";

import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { InputSwitch } from 'primereact/inputswitch';
import api from '@/lib/api';

export default function PayrollApprovalDashboard() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  
  const toast = useRef<Toast>(null);

  const [viewCurrency, setViewCurrency] = useState('VES');

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll-periods');
      // Al activar el switch, todas las nóminas serán visibles.
      setPeriods(res.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los periodos' });
    } finally {
      setLoading(false);
    }
  };

  const openAnalysis = async (period: any) => {
    setSelectedPeriod(period);
    // Auto-select currency based on period's native currency
    setViewCurrency(period.currency || 'VES');
    setShowDialog(true);
    setAnalysis(null);
    try {
      const res = await api.get(`/payroll-periods/${period.id}/budget-analysis`);
      setAnalysis(res.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el análisis presupuestario' });
      setShowDialog(false);
    }
  };

  const changeStatus = async (newStatus: string) => {
    try {
      if (newStatus === 'APPROVED' && viewCurrency === 'VES' && (!selectedPeriod.exchangeRate || selectedPeriod.exchangeRate <= 1)) {
         throw new Error("No puedes aprobar una nómina en VES sin una Tasa de Cambio BCV real configurada en el motor.");
      }
      await api.patch(`/payroll-periods/${selectedPeriod.id}`, { status: newStatus });
      toast.current?.show({ severity: 'success', summary: 'Estatus Modificado', detail: `La nómina ahora está en estatus: ${newStatus}` });
      setShowDialog(false);
      fetchPeriods();
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error de Aprobación', detail: e.response?.data?.message || e.message || 'Error al cambiar estatus' });
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Tag value="Borrador" severity="warning" />;
      case 'PRE_CALCULATED': return <Tag value="Pre-Calculada" severity="warning" />;
      case 'PENDING_APPROVAL': return <Tag value="En Revisión" severity="info" />;
      case 'APPROVED': return <Tag value="Aprobada (Lista)" severity="success" />;
      case 'CLOSED': return <Tag value="Cerrada" severity="success" />;
    }
    return <Tag value={status} />;
  };

  const getMultiplier = () => {
    if (viewCurrency === 'USD') return 1;
    // Si la tasa de cambio en la BD no está configurada (e.g., vale 0), usar 1 para no ocultar montos
    return Number(selectedPeriod?.exchangeRate || 1);
  };

  const formatDynCurrency = (val: number) => {
    const finalVal = val * getMultiplier();
    return new Intl.NumberFormat(viewCurrency === 'VES' ? 'es-VE' : 'en-US', { 
      style: 'currency', 
      currency: viewCurrency 
    }).format(finalVal);
  };

  const budgetPctTemplate = (rowData: any) => {
    // Percentage is completely agnostic of currency since it's a ratio (USD/USD == VES/VES).
    const pct = rowData.monthlyBudgetUSD > 0 ? (rowData.totalProjectedCostUSD / rowData.monthlyBudgetUSD) * 100 : 0;
    const color = pct > 100 ? 'bg-red-500' : (pct > 85 ? 'bg-orange-500' : 'bg-green-500');
    return (
      <div className="w-full">
        <div className="flex justify-between mb-1 text-xs font-semibold">
          <span>{pct.toFixed(2)}% del PPTO Mensual</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <Toast ref={toast} position="bottom-right" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Centro de Comando: Aprobaciones</h1>
            <p className="text-gray-500 text-sm mt-1">Supervisa y autoriza las nóminas contrastadas con presupuestos departamentales (Mes Acumulado).</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <InputSwitch checked={showClosed} onChange={(e) => setShowClosed(e.value ?? false)} />
            <span className="text-sm font-medium text-gray-700">Mostrar Todas (Cerradas/Borradores)</span>
          </div>
        </div>

        <DataTable value={showClosed ? periods : periods.filter(p => ['PRE_CALCULATED', 'PENDING_APPROVAL'].includes(p.status))} loading={loading} stripedRows emptyMessage="No hay nóminas pendientes de revisión.">
          <Column field="name" header="Nombre del Periodo" className="font-bold" />
          <Column field="type" header="Frecuencia" />
          <Column header="Auditoría / Estatus" body={(r) => renderStatus(r.status)} />
          <Column body={(rowData) => (
            <Button icon="pi pi-search" label="Auditar y Analizar" severity="secondary" outlined size="small" onClick={() => openAnalysis(rowData)} />
          )} align="right" />
        </DataTable>

        <Dialog
          header={
            <div className="flex items-center justify-between w-full pr-8">
              <div className="flex items-center gap-2">
                <i className="pi pi-chart-bar text-indigo-500 text-xl"></i>
                <span>Auditoría de Nómina: {selectedPeriod?.name}</span>
              </div>
              {selectedPeriod && (
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg ml-auto mr-4">
                  <span className="text-xs font-bold text-gray-600 uppercase">Moneda de Visualización:</span>
                  <div className="flex bg-white rounded shadow-sm overflow-hidden border border-gray-300">
                    <button type="button" onClick={() => setViewCurrency('VES')} className={`px-3 py-1 text-xs font-bold transition-colors ${viewCurrency === 'VES' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>VES (Bs.)</button>
                    <button type="button" onClick={() => setViewCurrency('USD')} className={`px-3 py-1 text-xs font-bold transition-colors border-l border-gray-200 ${viewCurrency === 'USD' ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>USD ($)</button>
                  </div>
                </div>
              )}
            </div>
          }
          visible={showDialog} style={{ width: '90vw' }} onHide={() => setShowDialog(false)}
        >
          {analysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-2">
                <div className="bg-blue-50 p-4 rounded border border-blue-100 flex flex-col justify-between">
                  <span className="block text-xs font-semibold text-blue-500 uppercase tracking-wide">Estatus Actual</span>
                  <span className="block text-xl font-bold text-blue-800 mt-1">{renderStatus(selectedPeriod.status)}</span>
                </div>
                <div className="bg-indigo-50 p-4 rounded border border-indigo-100 flex flex-col justify-between">
                  <span className="block text-xs font-bold text-indigo-500 uppercase tracking-wide">Costo Nómina (Aprobación)</span>
                  <span className="block text-3xl font-black text-indigo-800 mt-1">{formatDynCurrency(analysis.analysis?.reduce((acc: number, curr: any) => acc + curr.currentPeriodCostUSD, 0) || 0)}</span>
                  <p className="text-[10px] text-indigo-600 font-medium italic mt-1">Gasto Acum. Previo (Mes): {formatDynCurrency(analysis.analysis?.reduce((acc: number, curr: any) => acc + curr.mtdHistoricCostUSD, 0) || 0)}</p>
                </div>
                
                <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded border border-slate-200 flex flex-col justify-between">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Desglose de Trabajadores Computados</span>
                  <div className="grid grid-cols-4 gap-2 mt-auto">
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Activos</span>
                        <span className="text-sm font-black text-slate-700 leading-none mt-1">{analysis.workerStatusSummary?.ACTIVE || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Vacaciones</span>
                        <span className="text-sm font-black text-slate-700 leading-none mt-1">{analysis.workerStatusSummary?.ON_VACATION || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Suspendidos</span>
                        <span className="text-sm font-black text-slate-700 leading-none mt-1">{analysis.workerStatusSummary?.SUSPENDED || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">Liquidados</span>
                        <span className="text-sm font-black text-slate-700 leading-none mt-1">{analysis.workerStatusSummary?.LIQUIDATED || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-bold text-gray-700 m-0">Análisis C-Level (Acumulado MTD)</h4>
              <DataTable key={viewCurrency} value={analysis.analysis} stripedRows className="text-sm p-datatable-sm">
                <Column field="departmentName" header="Departamento" className="font-bold text-gray-900" style={{ width: '15%' }} />
                <Column header="PPTO Mensual Completo" body={(r) => <span className="font-semibold text-indigo-900">{formatDynCurrency(r.monthlyBudgetUSD)}</span>} />
                <Column header="Gasto Acum. Mes" body={(r) => <span className="text-gray-500">{formatDynCurrency(r.mtdHistoricCostUSD)}</span>} />
                <Column header="Nómina Actual" body={(r) => <span className="text-gray-900 font-bold bg-yellow-50 px-2 py-1 rounded">{formatDynCurrency(r.currentPeriodCostUSD)}</span>} />
                <Column header="Total Proyectado MTD" body={(r) => <span className={r.isOverBudget ? "text-red-700 font-black" : "text-green-700 font-black"}>{formatDynCurrency(r.totalProjectedCostUSD)}</span>} />
                <Column header="Consumo Acumulado" body={budgetPctTemplate} style={{ width: '20%' }} />
              </DataTable>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                {selectedPeriod.status === 'PENDING_APPROVAL' && (
                  <>
                    <Button label="Rechazar (Volver a DRAFT)" icon="pi pi-times" severity="danger" text onClick={() => changeStatus('DRAFT')} />
                    <Button label="Autorizar Nómina (APPROVED)" icon="pi pi-check" severity="success" onClick={() => changeStatus('APPROVED')} className="px-6 shadow-md" />
                  </>
                )}
                {(selectedPeriod.status === 'DRAFT' || selectedPeriod.status === 'PRE_CALCULATED') && (
                  <Button label="Solicitar Revisión (A PENDING_APPROVAL)" icon="pi pi-bell" severity="info" onClick={() => changeStatus('PENDING_APPROVAL')} />
                )}
                {selectedPeriod.status === 'APPROVED' && (
                  <Button label="Ejecutar Cierre Definitivo (CLOSED)" icon="pi pi-lock" className="bg-indigo-600 border-indigo-600 shadow-md" onClick={() => changeStatus('CLOSED')} />
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center"><i className="pi pi-spin pi-spinner text-4xl text-indigo-500"></i><p className="mt-4 text-gray-500">Computando Semáforos Financieros...</p></div>
          )}
        </Dialog>
      </div>
    </AppLayout>
  );
}
