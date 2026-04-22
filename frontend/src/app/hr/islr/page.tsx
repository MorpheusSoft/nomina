'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import api from '@/lib/api';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { generateAriPdfOverlay } from '@/lib/ariPdfOverlay';

export default function HrISLRPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear());
  const toast = useRef<Toast>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const yearOptions = [
    { label: `${new Date().getFullYear()}`, value: new Date().getFullYear() },
    { label: `${new Date().getFullYear() + 1}`, value: new Date().getFullYear() + 1 },
  ];

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ari-forms/statuses?fiscalYear=${fiscalYear}`);
      setRecords(res.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estatus ISLR' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [fiscalYear]);

  const generateSystemForms = async () => {
    if (!window.confirm('¿Está seguro de generar planillas De Oficio (Desgravamen Único, 0 cargas familiares) para todos los trabajadores que no han cumplido con entregar su formato AR-I vigente?')) return;
    
    try {
      setLoading(true);
      const res = await api.post('/ari-forms/system/generate', { fiscalYear });
      toast.current?.show({ severity: 'success', summary: 'Ejecutado', detail: res.data.message });
      fetchStatuses();
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al generar planillas reglamentarias' });
    } finally {
      setLoading(false);
    }
  };

  const downloadPrintableForm = async (recordData: any) => {
    try {
      setIsPrinting(true);
      const res = await api.get(`/ari-forms/details/${recordData.formData.id}`);
      await generateAriPdfOverlay(res.data);
      setIsPrinting(false);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron descargar los detalles para impresión.' });
      setIsPrinting(false);
    }
  };

  const statusTemplate = (rowData: any) => {
    if (!rowData.hasForm) return <Tag severity="danger" value="Pendiente / Omisión" />;
    if (rowData.isSystemGenerated) return <Tag severity="warning" value="AR-I Reglamentario (De Oficio)" />;
    return <Tag severity="success" value="Declarado Voluntario" />;
  };

  const percentTemplate = (rowData: any) => {
    if (!rowData.hasForm) return '--';
    return <strong className="text-blue-700">{rowData.percentage}%</strong>;
  };

  const actionTemplate = (rowData: any) => {
    return (
      <div className="flex justify-center gap-2">
        <Button 
          icon="pi pi-eye" 
          rounded 
          text 
          severity="info"
          disabled={!rowData.hasForm}
          onClick={() => {
             setSelectedRecord(rowData);
             setViewDialog(true);
          }} 
          tooltip="Ver Detalles"
        />
        <Button 
          icon="pi pi-print" 
          rounded 
          text 
          severity="secondary"
          disabled={!rowData.hasForm || isPrinting}
          onClick={() => downloadPrintableForm(rowData)} 
          tooltip="Exportar PDF SENIAT"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center bg-white p-6 rounded-t-xl border-b mb-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Análisis de Retenciones ISLR (AR-I)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supervise la entrega de la Planilla AR-I y genere de oficio para empleados omisos.
          </p>
        </div>
        <div className="flex gap-4">
          <Dropdown value={fiscalYear} options={yearOptions} onChange={(e) => setFiscalYear(e.value)} />
          <Button label="Generar de Oficio (Faltantes)" icon="pi pi-bolt" severity="danger" raised onClick={generateSystemForms} />
        </div>
      </div>

      <Toast ref={toast} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DataTable value={records} loading={loading} paginator rows={15} emptyMessage="No hay registros para este año fiscal" stripedRows className="p-datatable-sm" filterDisplay="menu">
          <Column field="identity" header="Cédula" sortable filter />
          <Column field="workerName" header="Trabajador" sortable filter />
          <Column header="Estatus AR-I" body={statusTemplate} sortable field="hasForm" />
          <Column header="% Asignado (Retención)" body={percentTemplate} sortable field="percentage" />
          <Column body={actionTemplate} exportable={false} align="center" style={{ minWidth: '4rem' }}></Column>
        </DataTable>
      </div>

      <Dialog header="Detalle de Declaración AR-I" visible={viewDialog} style={{ width: '35vw', minWidth: '400px' }} onHide={() => setViewDialog(false)}>
        {selectedRecord && selectedRecord.formData ? (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2 flex justify-between items-center">
               <div>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Trabajador</p>
                 <p className="font-bold text-gray-800 text-lg">{selectedRecord.workerName}</p>
                 <p className="text-sm text-gray-500">{selectedRecord.identity}</p>
               </div>
               <div className="text-right">
                 {selectedRecord.formData.isSystemGenerated ? <Tag severity="warning" value="De Oficio" /> : <Tag severity="success" value="Voluntario" />}
               </div>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
               <p className="text-xs text-blue-500/70 font-bold uppercase tracking-wider mb-1">Ingreso Estimado (Bs)</p>
               <p className="font-bold text-blue-900 text-lg">{Number(selectedRecord.formData.estimatedRemuneration).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
               <p className="text-xs text-blue-500/70 font-bold uppercase tracking-wider mb-1">Tipo de Desgravamen</p>
               <p className="font-bold text-blue-900">{selectedRecord.formData.deductionType === 'UNIQUE' ? 'Único (774 U.T.)' : 'Detallado'}</p>
            </div>

            {selectedRecord.formData.deductionType === 'DETAILED' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 col-span-2 flex justify-between items-center">
                 <p className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">Monto de Desgravamen Detallado</p>
                 <p className="font-bold text-amber-900">{Number(selectedRecord.formData.detailedDeductionsAmount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cargas Familiares</p>
               <p className="font-bold text-gray-800">{selectedRecord.formData.familyLoadCount} Personas</p>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
               <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Porcentaje de Retención</p>
               <p className="font-black text-emerald-700 text-2xl">{selectedRecord.formData.withholdingPercentage}%</p>
            </div>
            
            <div className="col-span-2 flex justify-end mt-4 pt-4 border-t border-gray-100">
               <Button label="Descargar Formato PDF" icon="pi pi-file-pdf" onClick={() => downloadPrintableForm(selectedRecord)} loading={isPrinting} className="bg-indigo-600 border-none" />
            </div>
          </div>
        ) : (
          <p className="text-center p-8 text-gray-500">No hay formato válido asociado para mostrar.</p>
        )}
      </Dialog>
    </AppLayout>
  );
}
