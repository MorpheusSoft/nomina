"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import PayslipPrintTemplate from '@/components/payroll/PayslipPrintTemplate';

import api from '../../../../lib/api';

const currencyOptions = [
  { label: 'Bolívares (VES)', value: 'VES' },
  { label: 'Dólares (USD)', value: 'USD' }
];

export default function PayrollEngineConsole({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [period, setPeriod] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const dtResumen = React.useRef<any>(null);
  const dtPrenomina = React.useRef<any>(null);
  
  const [exchangeRate, setExchangeRate] = useState<string>('1.00');
  const [currency, setCurrency] = useState<string>('VES');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  
  const fetchPeriodData = async () => {
    try {
      setLoading(true);
      const [resPeriod, resReceipts] = await Promise.all([
        api.get(`/payroll-periods/${id}`),
        api.get(`/payroll-engine/receipts/${id}`)
      ]);
      setPeriod(resPeriod.data);
      if (resPeriod.data.exchangeRate) setExchangeRate(resPeriod.data.exchangeRate.toString());
      if (resPeriod.data.currency) setCurrency(resPeriod.data.currency);
      setReceipts(resReceipts.data);
    } catch (e) {
      console.error(e);
      alert('Error cargando la consola de cálculo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPeriodData();
    }
  }, [id]);

  const handleCalculate = async () => {
    try {
      setComputing(true);
      await api.post(`/payroll-engine/calculate/${id}`, {});
      await fetchPeriodData();
    } catch (e: any) {
      console.error(e);
      const backendMsg = e.response?.data?.message || e.message || '';
      alert(`Hubo un error al compilar la nómina:\n\n${backendMsg}`);
    } finally {
      setComputing(false);
    }
  };

  const handleUpdateRate = async () => {
    try {
      setIsUpdatingRate(true);
      await api.patch(`/payroll-periods/${id}`, {
        exchangeRate: parseFloat(exchangeRate) || 1,
        currency
      });
      alert('Tasa y moneda actualizadas correctamente. Puedes recalcular la nómina.');
      await fetchPeriodData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Error actualizando las métricas financieras.');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'DRAFT') return <Tag severity="warning" value="Borrador" />;
    if (s === 'PRE_CALCULATED') return <Tag severity="info" value="Calculada" />;
    if (s === 'CLOSED') return <Tag severity="success" value="Cerrada" />;
    return <Tag value={s} />;
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const workerTemplate = (r: any) => {
    return (
       <div>
         <div className="font-semibold text-gray-800">{r.worker?.firstName} {r.worker?.lastName}</div>
         <div className="text-xs text-gray-500">{r.worker?.primaryIdentityNumber}</div>
       </div>
    );
  };

  const netPayTemplate = (r: any) => {
    return <span className="font-bold text-green-700">${formatCurrency(r.netPay)}</span>;
  };

  const exportExcelResumen = () => dtResumen.current?.exportCSV();
  const exportExcelPrenomina = () => dtPrenomina.current?.exportCSV();

  const detailsExpansionTemplate = (receipt: any) => {
    return (
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg ml-8 shadow-inner">
        <h5 className="text-sm font-bold text-gray-700 mb-2">Desglose Calculado de {receipt.worker?.firstName}</h5>
        <DataTable value={receipt.details || []} size="small" emptyMessage="No hay detalles calculados">
          <Column header="Código" body={(r) => r.concept?.code || '-'} className="font-mono text-xs text-gray-500"></Column>
          <Column field="conceptNameSnapshot" header="Concepto" className="font-semibold text-gray-800"></Column>
          <Column field="rate" header="Monto Base / Unidad" align="right" body={(r) => (r.rate || r.factor) ? `${formatCurrency(r.factor)} x ${formatCurrency(r.rate)}` : '-'}></Column>
          <Column field="amount" header="Total Calculado" align="right" body={(r) => {
             if (['DEDUCCION', 'DEDUCTION'].includes(r.typeSnapshot)) return <span className="text-red-600 font-semibold">-{formatCurrency(r.amount)}</span>;
             if (['APORTE_PATRONAL', 'EMPLOYER_CONTRIBUTION'].includes(r.typeSnapshot)) return <span className="text-blue-600 font-semibold">{formatCurrency(r.amount)} (Aporte)</span>;
             return <span className="text-green-600 font-semibold">+{formatCurrency(r.amount)}</span>;
          }}></Column>
        </DataTable>
      </div>
    );
  };
  
  const [expandedRows, setExpandedRows] = useState<any[]>([]);

  if (loading) return <AppLayout><div className="p-8 text-center text-gray-500">Cargando consola del motor...</div></AppLayout>;

  return (
    <>
      {/* NATIVE PRINT VIEW */}
      <div className="hidden print:block bg-white text-black min-h-screen">
        <PayslipPrintTemplate period={period} receipts={receipts} />
      </div>

      {/* INTERACTIVE SCREEN VIEW */}
      <div className="print:hidden">
        <AppLayout>
          <div className="p-6 max-w-7xl mx-auto w-full">
        {/* Header Block */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <Button icon="pi pi-arrow-left" label="Volver a Períodos" className="p-button-text p-button-secondary pl-0 mb-2" onClick={() => router.push('/payroll/periods')} />
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
               Consola de Ejecución: {period?.name}
               {statusBadge(period?.status)}
             </h1>
             <p className="mt-1 text-sm text-gray-500">Convenio: {period?.payrollGroup?.name} | Desde: {new Date(period?.startDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })} Hasta: {new Date(period?.endDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
             
             {/* PARÁMETROS FINANCIEROS */}
             <div className="mt-4 flex items-end gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Moneda Base</label>
                  <Dropdown 
                     value={currency} 
                     options={currencyOptions} 
                     onChange={(e) => setCurrency(e.value)} 
                     disabled={period?.status === 'CLOSED'}
                     className="w-40" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tasa de Cambio (Oficial BCV)</label>
                  <InputText 
                     value={exchangeRate} 
                     onChange={(e) => setExchangeRate(e.target.value)}
                     disabled={period?.status === 'CLOSED'}
                     type="number"
                     step="0.01"
                     className="w-32 text-center font-bold text-indigo-700"
                  />
                </div>
                <Button 
                   icon={isUpdatingRate ? "pi pi-spin pi-spinner" : "pi pi-save"} 
                   label="Guardar Tasa" 
                   onClick={handleUpdateRate}
                   disabled={isUpdatingRate || period?.status === 'CLOSED'}
                   severity="secondary"
                   className="ml-2 px-4 whitespace-nowrap"
                />
             </div>
          </div>
          
          <div className="flex flex-col gap-3">
             <Button 
                label="Imprimir Recibos PDF" 
                icon="pi pi-print" 
                className={`px-6 py-3 rounded-xl font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all`}
                onClick={() => window.print()}
                disabled={receipts.length === 0}
             />
             <Button 
                label={computing ? "Motor Procesando..." : "Calcular Nómina Automática"} 
                icon={computing ? "pi pi-spin pi-spinner" : "pi pi-bolt"} 
                className={`px-6 py-3 rounded-xl font-bold ${computing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white border-none shadow-md transition-all`}
                onClick={handleCalculate}
                disabled={computing || period?.status === 'CLOSED' || period?.status === 'PENDING_APPROVAL' || period?.status === 'APPROVED'}
             />
          </div>
        </div>

        {computing && (
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6">
              <h3 className="text-indigo-900 font-semibold mb-3 flex items-center gap-2">
                <i className="pi pi-cog pi-spin text-xl"></i> Resolviendo AST y Fórmulas Matemáticas...
              </h3>
              <ProgressBar mode="indeterminate" style={{ height: '8px' }} color="#4f46e5"></ProgressBar>
              <p className="text-xs text-indigo-700 mt-2">Iterando dependencias de conceptos e inyectando histórico salarial en memoria...</p>
           </div>
        )}

        {/* Reports Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
           <TabView className="pt-2">
              <TabPanel header="Nómina Resumida (Bancaria)" leftIcon="pi pi-list mr-2">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Recibos Resumidos ({receipts.length})</h2>
                    <Button type="button" icon="pi pi-file-excel" label="Exportar a CSV" severity="success" size="small" onClick={exportExcelResumen} disabled={receipts.length === 0} data-pr-tooltip="CSV" />
                  </div>
                  {receipts.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <i className="pi pi-receipt text-4xl text-gray-300 mb-3 block"></i>
                        <p className="text-gray-500">No hay recibos calculados en este período todavía.<br/>Presiona "Calcular" para procesar la nómina.</p>
                      </div>
                  ) : (
                      <DataTable ref={dtResumen} value={receipts} paginator rows={10} className="p-datatable-sm text-sm border border-gray-100 rounded-lg overflow-hidden">
                        <Column field="worker.primaryIdentityNumber" header="Cédula / ID"></Column>
                        <Column body={workerTemplate} header="Trabajador" style={{ width: '30%' }}></Column>
                        <Column field="totalEarnings" header="Asignaciones" align="right" body={(r) => `${period?.currency === 'USD' ? '$' : 'Bs. '}${formatCurrency(r.totalEarnings)}`} className="text-gray-700"></Column>
                        <Column field="totalDeductions" header="Deducciones" align="right" body={(r) => `${period?.currency === 'USD' ? '$' : 'Bs. '}${formatCurrency(r.totalDeductions)}`} className="text-red-600"></Column>
                        <Column field="netPay" align="right" body={(r) => <span className="font-bold text-green-700">{period?.currency === 'USD' ? '$' : 'Bs. '}{formatCurrency(r.netPay)}</span>} header="Neto a Pagar"></Column>
                        <Column field="status" header="Estado" body={(r) => statusBadge(r.status)}></Column>
                      </DataTable>
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Reporte Prenómina Detallado" leftIcon="pi pi-chart-pie mr-2">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Sabana de Conceptos</h2>
                    <Button type="button" icon="pi pi-file-excel" label="Exportar a CSV" severity="success" size="small" onClick={exportExcelPrenomina} disabled={receipts.length === 0} />
                  </div>
                  {receipts.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Calcula la nómina para ver los detalles.</p>
                      </div>
                  ) : (
                      <DataTable 
                         ref={dtPrenomina} 
                         value={receipts} 
                         paginator rows={10} 
                         expandedRows={expandedRows} 
                         onRowToggle={(e) => setExpandedRows(e.data as any[])} 
                         rowExpansionTemplate={detailsExpansionTemplate} 
                         dataKey="id"
                         className="p-datatable-sm text-sm border border-gray-100 rounded-lg"
                      >
                         <Column expander style={{ width: '3rem' }} />
                         <Column body={workerTemplate} header="Trabajador"></Column>
                         <Column field="netPay" header="Neto Final" body={(r) => <span className="font-bold text-gray-900">${formatCurrency(r.netPay)}</span>}></Column>
                         <Column body={(r) => <Badge value={r.details?.length || 0} severity="info" />} header="Cant. Conceptos"></Column>
                      </DataTable>
                  )}
                </div>
              </TabPanel>


           </TabView>
        </div>
      </div>
    </AppLayout>
    </div>
    </>
  );
}
