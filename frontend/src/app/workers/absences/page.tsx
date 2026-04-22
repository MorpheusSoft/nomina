"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { FilterMatchMode } from 'primereact/api';
import api from '@/lib/api';
import { Tag } from 'primereact/tag';

interface WorkerAbsence {
  id: string;
  workerId: string;
  startDate: string;
  endDate: string;
  isJustified: boolean;
  isPaid: boolean;
  reason: string;
  observations: string;
  status: string;
  worker?: any;
}

export default function WorkerAbsencesPage() {
  const [absences, setAbsences] = useState<WorkerAbsence[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  // Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    workerId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    isJustified: true,
    isPaid: true,
    reason: 'Permiso Médico', // Default or from catalog later
    observations: ''
  });

  const [catalogReasons, setCatalogReasons] = useState<any[]>([
    { label: 'Permiso Médico', value: 'Permiso Médico' },
    { label: 'Duelo', value: 'Duelo' },
    { label: 'Ausencia Injustificada', value: 'Ausencia Injustificada' },
    { label: 'Reposición de Horas', value: 'Reposición de Horas' },
    { label: 'Otros (Justificado)', value: 'Otros (Justificado)' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [absRes, workRes, catRes] = await Promise.all([
        api.get('/worker-absences'),
        api.get('/workers'),
        api.get('/general-catalogs?category=ABSENCE_REASON')
      ]);
      setAbsences(absRes.data);
      if (catRes.data && catRes.data.length > 0) {
         setCatalogReasons(catRes.data.map((c: any) => ({ label: c.value, value: c.value })));
      }
      const workerOptions = workRes.data.map((w: any) => ({
        label: `${w.primaryIdentityNumber} - ${w.firstName} ${w.lastName}`,
        value: w.id
      }));
      setWorkers(workerOptions);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAbsence = async () => {
    if (!form.workerId || !form.startDate || !form.endDate || !form.reason) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (form.reason === 'Ausencia Injustificada') {
         form.isJustified = false;
         form.isPaid = false;
      }

      await api.post('/worker-absences', {
        workerId: form.workerId,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
        isJustified: form.isJustified,
        isPaid: form.isPaid,
        reason: form.reason,
        observations: form.observations
      });
      setShowDialog(false);
      fetchData();
      // reset
      setForm({ workerId: '', startDate: null, endDate: null, isJustified: true, isPaid: true, reason: 'Permiso Médico', observations: '' });
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la inasistencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAbsence = async (id: string) => {
    if(!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      await api.delete(`/worker-absences/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value as any;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 m-0">Permisos y Ausencias</h2>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative w-full md:w-auto flex items-center">
            <i className="pi pi-search absolute left-3 text-gray-400 z-10" />
            <InputText 
               value={globalFilterValue} 
               onChange={onGlobalFilterChange} 
               placeholder="Buscar registro..." 
               className="w-full py-2 border border-gray-300 rounded-lg outline-none transition-all"
               style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <Button 
            label="Registrar Incidencia" 
            icon="pi pi-plus" 
            onClick={() => setShowDialog(true)} 
            className="w-full md:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold rounded-lg shadow-sm whitespace-nowrap"
          />
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-2 md:p-6 max-w-7xl mx-auto">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <DataTable 
            value={absences} 
            paginator 
            rows={10} 
            loading={loading} 
            dataKey="id" 
            filters={filters}
            globalFilterFields={['worker.firstName', 'worker.lastName', 'worker.primaryIdentityNumber', 'reason']}
            header={renderHeader()}
            emptyMessage="No se encontraron registros de ausencias."
            className="p-datatable-sm"
          >
            <Column field="worker.firstName" header="Trabajador" sortable body={(r) => <span className="font-bold text-indigo-900">{r.worker?.firstName} {r.worker?.lastName}</span>} style={{ minWidth: '15rem' }} />
            <Column field="reason" header="Motivo" sortable style={{ minWidth: '12rem' }} body={(r) => <span className="text-gray-700 font-medium">{r.reason}</span>} />
            <Column field="startDate" header="Fecha Inicio" sortable body={(r) => { const [y,m,d] = r.startDate.split('T')[0].split('-'); return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString(); }} style={{ minWidth: '8rem' }} />
            <Column field="endDate" header="Fecha Fin" sortable body={(r) => { const [y,m,d] = r.endDate.split('T')[0].split('-'); return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString(); }} style={{ minWidth: '8rem' }} />
            <Column field="isJustified" header="Tipo" sortable body={(r) => r.isJustified ? <Tag severity="success" value="Justificada" rounded /> : <Tag severity="danger" value="Injustificada" rounded />} style={{ minWidth: '9rem' }} />
            <Column field="isPaid" header="Remunerado" sortable body={(r) => r.isPaid ? <i className="pi pi-check text-green-500 font-bold"></i> : <i className="pi pi-times text-gray-400"></i>} align="center" style={{ minWidth: '9rem' }} />
            <Column header="Borrar" body={(r) => <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteAbsence(r.id)}/>} />
          </DataTable>
        </div>
      </div>

      <Dialog header="Registrar Permiso o Ausencia" visible={showDialog} style={{ width: '35vw', minWidth: '300px' }} onHide={() => setShowDialog(false)}>
         <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1">
               <label className="text-sm font-semibold text-gray-700">Trabajador *</label>
               <Dropdown value={form.workerId} options={workers} onChange={(e) => setForm({...form, workerId: e.value})} filter placeholder="Seleccione Trabajador..." className="w-full" />
            </div>

            <div className="flex flex-col gap-1">
               <label className="text-sm font-semibold text-gray-700">Motivo Predefinido *</label>
               <Dropdown value={form.reason} options={catalogReasons} onChange={(e) => {
                  const val = e.value;
                  const isInj = val === 'Ausencia Injustificada';
                  setForm({...form, reason: val, isJustified: !isInj, isPaid: !isInj});
               }} className="w-full" />
            </div>

            <div className="flex gap-4">
               <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-sm font-semibold text-gray-700">Desde *</label>
                  <Calendar value={form.startDate} onChange={(e) => setForm({...form, startDate: e.value as Date})} dateFormat="dd/mm/yy" showIcon />
               </div>
               <div className="flex flex-col gap-1 w-1/2">
                  <label className="text-sm font-semibold text-gray-700">Hasta *</label>
                  <Calendar value={form.endDate} onChange={(e) => setForm({...form, endDate: e.value as Date})} dateFormat="dd/mm/yy" showIcon />
               </div>
            </div>

            <div className="flex items-center gap-6 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
               <div className="flex items-center">
                   <Checkbox inputId="cb1" onChange={(e: any) => setForm({...form, isJustified: e.checked})} checked={form.isJustified} disabled={form.reason === 'Ausencia Injustificada'}></Checkbox>
                   <label htmlFor="cb1" className="ml-2 font-medium text-sm text-gray-700">Es Justificada</label>
               </div>
               <div className="flex items-center">
                   <Checkbox inputId="cb2" onChange={(e: any) => setForm({...form, isPaid: e.checked})} checked={form.isPaid} disabled={form.reason === 'Ausencia Injustificada'}></Checkbox>
                   <label htmlFor="cb2" className="ml-2 font-medium text-sm text-gray-700">Remunerada (Paga)</label>
               </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
               <label className="text-sm font-semibold text-gray-700">Observaciones (Opcional)</label>
               <InputTextarea value={form.observations} onChange={(e) => setForm({...form, observations: e.target.value})} rows={3} placeholder="Detalles médicos o administrativos..." className="w-full" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
               <Button label="Cancelar" icon="pi pi-times" className="p-button-text text-gray-600" onClick={() => setShowDialog(false)} />
               <Button label="Guardar Registro" icon="pi pi-check" onClick={saveAbsence} loading={isSubmitting} className="p-button-primary bg-indigo-600 border-indigo-600" />
            </div>
         </div>
      </Dialog>
    </AppLayout>
  );
}
