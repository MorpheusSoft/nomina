"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import api from '@/lib/api';

export default function GlobalWorkerNoveltiesPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
  
  const toast = useRef<Toast>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/worker-novelties`);
      setIncidents(res.data);
    } catch (e) {
      console.error(e);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error cargando las novedades globales' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [wRes, cRes] = await Promise.all([
        api.get(`/workers`),
        api.get(`/concepts`)
      ]);
      setWorkers(wRes.data.map((w: any) => ({ 
         label: `${w.firstName} ${w.lastName} (${w.primaryIdentityNumber})`, 
         value: w.employmentRecords?.find((er: any) => er.isActive)?.id || ''
      })).filter((w: any) => w.value !== ''));
      setConcepts(cRes.data.filter((c: any) => c.isAuxiliary === true));
    } catch (e) {
      console.error("Error fetching dependencies", e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchDependencies();
  }, []);

  const saveIncident = async () => {
    if (!selectedWorkerId || !selectedConcept || amount === null || !paymentDate) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Faltan campos obligatorios' });
      return;
    }
    
    try {
      await api.post('/worker-novelties', {
        employmentRecordId: selectedWorkerId,
        conceptId: selectedConcept.id,
        paymentDate: paymentDate.toISOString(),
        amount,
        notes: "Cargado manual por usuario (Bandeja Global)"
      });
      setShowDialog(false);
      
      // Reset form
      setSelectedWorkerId(null);
      setSelectedConcept(null);
      setAmount(null);
      
      fetchIncidents();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Novedad registrada y en espera de consolidación.' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error al guardar la novedad' });
    }
  };

  const deleteIncident = async (id: string, status: string) => {
    if (status !== 'PENDING') {
       toast.current?.show({ severity: 'warn', summary: 'Restringido', detail: 'No se puede eliminar una novedad que ya fue inyectada o pagada.' });
       return;
    }
    if (!window.confirm("¿Seguro de eliminar esta Novedad?")) return;
    try {
      await api.delete(`/worker-novelties/${id}`);
      fetchIncidents();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Novedad eliminada' });
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
    }
  };

  const workerBodyTemplate = (rowData: any) => {
    return rowData.employmentRecord?.owner ? `${rowData.employmentRecord.owner.firstName} ${rowData.employmentRecord.owner.lastName}` : '-';
  };

  const codeBodyTemplate = (rowData: any) => {
    return <span className="font-mono text-indigo-700">{rowData.concept?.code}</span>;
  };
  
  const dateBodyTemplate = (rowData: any) => {
    if (!rowData.paymentDate) return '-';
    return new Date(rowData.paymentDate).toLocaleDateString();
  };

  const statusBodyTemplate = (rowData: any) => {
     if (rowData.status === 'INJECTED') return <Tag severity="info" value="Inyectada en Nómina" />;
     if (rowData.status === 'PAID') return <Tag severity="success" value="Liquidada" />;
     return <Tag severity="warning" value="Pendiente" />;
  };

  const actionBodyTemplate = (rowData: any) => {
    if (rowData.status !== 'PENDING') return null;
    return (
      <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deleteIncident(rowData.id, rowData.status)} />
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
        <Toast ref={toast} />
        
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
               Bandeja Global de Novedades
            </h1>
            <p className="mt-1 text-sm text-gray-500">
               Agrega asignaciones, bonos manuales, métricas o faltas que serán barridas por el Motor de Consolidación según su <strong>Fecha de Pago</strong>.
            </p>
          </div>
          <Button 
             type="button" 
             icon="pi pi-plus" 
             label="Registrar Novedad" 
             className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md border-none px-5 py-3" 
             onClick={() => setShowDialog(true)} 
          />
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden p-6">
          <DataTable value={incidents} paginator rows={15} loading={loading} className="p-datatable-sm" emptyMessage="No hay novedades registradas en este Tenant">
             <Column body={workerBodyTemplate} header="Trabajador Afectado" sortable></Column>
             <Column body={dateBodyTemplate} header="Fecha de Pago" sortable></Column>
             <Column body={codeBodyTemplate} header="Cód."></Column>
             <Column field="concept.name" header="Concepto Paramétrico"></Column>
             <Column field="amount" header="Monto / Variable Objeto" body={(r) => <span className="font-bold text-gray-900">{r.amount}</span>}></Column>
             <Column body={statusBodyTemplate} header="Estatus"></Column>
             <Column body={actionBodyTemplate} align="center" style={{ width: '5rem' }}></Column>
          </DataTable>
        </div>

        <Dialog header="Registrar Novedad Puntual" visible={showDialog} style={{ width: '450px' }} onHide={() => setShowDialog(false)}>
           <div className="space-y-4 pt-4">
              <div className="field">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Trabajador</label>
                 <Dropdown 
                    value={selectedWorkerId} 
                    options={workers} 
                    filter 
                    onChange={(e) => setSelectedWorkerId(e.value)} 
                    placeholder="Selecciona trabajador" 
                    className="w-full"
                 />
              </div>
              
              <div className="field">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Pago Objetivo</label>
                 <Calendar 
                    value={paymentDate} 
                    onChange={(e) => setPaymentDate(e.value as Date)} 
                    dateFormat="dd/mm/yy" 
                    className="w-full"
                    placeholder="Cuándo se procesará"
                 />
                 <small className="text-gray-500 block mt-1">El Motor aspirará esta novedad en la nómina que abarque esta fecha.</small>
              </div>

              <div className="field">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Concepto a Afectar</label>
                 <Dropdown 
                    value={selectedConcept} 
                    options={concepts} 
                    optionLabel="name"
                    valueTemplate={(opt) => opt ? `${opt.code} - ${opt.name}` : 'Selecciona el concepto'}
                    itemTemplate={(opt) => `${opt.code} - ${opt.name}`}
                    filter 
                    onChange={(e) => setSelectedConcept(e.value)} 
                    placeholder="Selecciona el concepto" 
                    className="w-full"
                 />
                 {selectedConcept?.formulaAmount && (
                    <small className="text-amber-600 font-semibold block mt-1">
                       ⚠️ Este concepto tiene fórmula. El monto que ingreses aquí reemplazará (override) el cálculo automático del motor.
                    </small>
                 )}
              </div>

              <div className="field">
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Valor Numérico (Cantidad / Monto)</label>
                 <InputNumber 
                    value={amount} 
                    onValueChange={(e) => setAmount(e.value ?? null)}  
                    mode="decimal" 
                    minFractionDigits={0} 
                    maxFractionDigits={2}
                    className="w-full"
                    placeholder="Ej: 2, 50.5"
                 />
                 <small className="text-gray-500 block mt-1">Representa un monto, porcentaje, horas o cantidad según la matemática configurada.</small>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                 <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setShowDialog(false)} />
                 <Button label="Añadir a Bandeja" icon="pi pi-check" onClick={saveIncident} />
              </div>
           </div>
        </Dialog>
      </div>
    </AppLayout>
  );
}
