'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import api from '@/lib/api';

export default function ConceptsReportPage() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Filters state
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedConcepts, setSelectedConcepts] = useState<any[]>([]);
  const [isConsolidated, setIsConsolidated] = useState<boolean>(false);
  const [currencyView, setCurrencyView] = useState<string>('VES');

  const dt = useRef<any>(null);

  const fetchConceptsList = async () => {
    try {
      setLoadingFilters(true);
      const res = await api.get('/concepts');
      setConcepts(res.data.map((c: any) => ({
        label: `${c.code} - ${c.name}`,
        value: c.id
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    fetchConceptsList();
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Debes seleccionar un rango de fechas.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currencyView,
        consolidated: isConsolidated.toString()
      });

      if (selectedConcepts.length > 0) {
        params.append('conceptIds', selectedConcepts.join(','));
      }

      const res = await api.get(`/reports/concepts-distribution?${params.toString()}`);
      setReportData(res.data);
    } catch (e) {
      console.error(e);
      alert('Error generando el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    dt.current?.exportCSV();
  };

  const formatCurrency = (val: any) => {
    return Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatType = (type: string) => {
    if (type === 'EARNING' || type === 'ASIGNACION') return <span className="text-emerald-600 font-bold">Asignación</span>;
    if (type === 'DEDUCTION' || type === 'DEDUCCION') return <span className="text-red-600 font-bold">Deducción</span>;
    return <span className="text-blue-600 font-bold">Aporte Patronal</span>;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <div className="mb-6 flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reporte: Sabana de Conceptos</h1>
               <p className="mt-2 text-sm text-gray-500">Analiza la distribución y costos totales por concepto en nóminas calculadas, en revisión o cerradas.</p>
            </div>
            <Button icon="pi pi-file-excel" label="Exportar CSV" severity="success" onClick={exportExcel} disabled={reportData.length === 0} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="field">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Desde</label>
              <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date)} dateFormat="dd/mm/yy" className="w-full" showIcon />
            </div>
            <div className="field">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha Hasta</label>
              <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date)} dateFormat="dd/mm/yy" className="w-full" showIcon />
            </div>
            <div className="field">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ver Montos En</label>
              <Dropdown 
                 value={currencyView} 
                 options={[{label: 'Bolívares (Bs)', value: 'VES'}, {label: 'Dólares ($)', value: 'USD'}]} 
                 onChange={(e) => setCurrencyView(e.value)} 
                 className="w-full"
              />
            </div>
            <div className="field flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <InputSwitch checked={isConsolidated} onChange={(e) => setIsConsolidated(e.value || false)} />
                <span className="text-sm font-semibold text-gray-700">Consolidado Total (Sin Detalle)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4 items-end">
             <div className="field flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Filtrar Conceptos Específicos (Opcional)</label>
                <MultiSelect 
                   value={selectedConcepts} 
                   options={concepts} 
                   onChange={(e) => setSelectedConcepts(e.value)} 
                   placeholder="Todos los conceptos" 
                   display="chip"
                   className="w-full"
                   disabled={loadingFilters}
                   filter
                />
             </div>
             <Button icon="pi pi-search" label="Generar Reporte" className="h-12" onClick={generateReport} loading={loading} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable 
             ref={dt} 
             value={reportData} 
             paginator 
             rows={20} 
             loading={loading}
             emptyMessage="Genera el reporte o ajusta los filtros para ver los resultados."
             className="p-datatable-sm"
             rowHover
             sortField="periodDate"
             sortOrder={-1}
          >
             <Column field="periodName" header="Nómina / Período" sortable></Column>
             
             {!isConsolidated && (
               <Column field="workerRef" header="Trabajador (C.I - Nombre)" sortable></Column>
             )}

             <Column field="conceptCode" header="Código" sortable className="font-mono text-xs"></Column>
             <Column field="conceptName" header="Concepto" sortable></Column>
             <Column header="Tipo" body={(r) => formatType(r.type)} sortable field="type"></Column>
             
             <Column 
                header="Monto Total" 
                sortable 
                field="amount" 
                body={(r) => <span className={`font-bold ${r.type === 'DEDUCTION' || r.type === 'DEDUCCION' ? 'text-red-700' : 'text-gray-900'}`}>{r.currency === 'USD' ? '$' : 'Bs.'} {formatCurrency(r.amount)}</span>}
             ></Column>
          </DataTable>
        </div>
      </div>
    </AppLayout>
  );
}
