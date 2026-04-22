"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '../../../lib/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from 'primereact/toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const { user } = useAuth();
  const toast = React.useRef<Toast>(null);

  const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail });
  };

  useEffect(() => {
    if (user?.tenantId) {
      loadHolidays();
    }
  }, [user]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      // In a real multi-tenant scenario we pass tenantId, but here it's simple
      const res = await api.get('/holidays');
      // filter locally if API doesn't filter
      const tenantHolidays = res.data.filter((h: any) => h.tenantId === user?.tenantId).map((h: any) => {
          const d = new Date(h.date);
          // Creamos una llave matemática para ordenarlos por "Mes y Día" ignorando el año real.
          return { ...h, sortMonthDay: d.getUTCMonth() * 100 + d.getUTCDate() };
      });
      setHolidays(tenantHolidays);
    } catch (error) {
      showToast('error', 'Error', 'No se pudieron cargar los feriados.');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingHoliday(null);
    setName('');
    setDate(null);
    setIsAnnual(false);
    setShowDialog(true);
  };

  const editHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setName(holiday.name);
    if (holiday.date) {
      const [year, month, day] = holiday.date.split('T')[0].split('-');
      setDate(new Date(Number(year), Number(month) - 1, Number(day)));
    } else {
      setDate(null);
    }
    setIsAnnual(holiday.isAnnual);
    setShowDialog(true);
  };

  const saveHoliday = async () => {
    if (!name || !date) {
      showToast('error', 'Validation', 'El nombre y la fecha son obligatorios');
      return;
    }

    try {
      if (editingHoliday) {
         // Update not fully implemented in UI for simplicity, we just delete/recreate or patch
         await api.patch(`/holidays/${editingHoliday.id}`, { name, date, isAnnual });
         showToast('success', 'Actualizado', 'Feriado actualizado con éxito');
      } else {
         await api.post('/holidays', {
           tenantId: user?.tenantId,
           name,
           date,
           isAnnual
         });
         showToast('success', 'Creado', 'Feriado creado con éxito');
      }
      setShowDialog(false);
      loadHolidays();
    } catch (error) {
      showToast('error', 'Error', 'Ocurrió un error al guardar');
    }
  };

  const deleteHoliday = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este feriado?')) {
      try {
        await api.delete(`/holidays/${id}`);
        showToast('success', 'Eliminado', 'Feriado eliminado');
        loadHolidays();
      } catch (error) {
         showToast('error', 'Error', 'No se pudo eliminar');
      }
    }
  };

  const renderDate = (rowData: any) => {
    if (!rowData.date) return '';
    const [year, month, day] = rowData.date.split('T')[0].split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    // Si es anual, no mostramos el año artificial (e.g. 2000)
    return rowData.isAnnual 
      ? format(d, 'dd MMMM', { locale: es }) 
      : format(d, 'dd MMMM yyyy', { locale: es });
  };

  const renderBadge = (rowData: any) => {
    return rowData.isAnnual 
      ? <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-bold">Fijo (Anual)</span>
      : <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold">Móvil (Específico)</span>;
  };

  const actionBody = (rowData: any) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text" onClick={() => editHoliday(rowData)} tooltip="Editar" />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => deleteHoliday(rowData.id)} tooltip="Eliminar" />
    </div>
  );

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <i className="pi pi-calendar-plus mr-3 text-red-500"></i>
            Calendario de Feriados
          </h1>
          <Button label="Nuevo Feriado" icon="pi pi-plus" onClick={openNew} className="p-button-primary" />
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm">
          <p className="text-sm text-blue-800 font-medium">
            <strong>Feriados Astronómicos:</strong> El sistema calcula automáticamente Semana Santa y Carnaval al generar los resúmenes de nómina de cada año. Aquí puedes añadir fechas regionales o patrias como el <em>5 de Julio</em>.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <DataTable 
             value={holidays} loading={loading} className="p-datatable-sm" emptyMessage="No hay feriados registrados. Pulse procesar fichajes para auto-generar los básicos."
             scrollable scrollHeight="calc(100vh - 350px)"
             sortField="sortMonthDay" sortOrder={1}
          >
            <Column field="name" header="Nombre de la Festividad" className="font-semibold"></Column>
            <Column field="sortMonthDay" header="Fecha" body={renderDate} sortable></Column>
            <Column field="isAnnual" header="Tipo" body={renderBadge} sortable></Column>
            <Column body={actionBody} style={{ width: '100px' }}></Column>
          </DataTable>
        </div>

        <Dialog header={editingHoliday ? "Editar Feriado" : "Nuevo Feriado"} visible={showDialog} style={{ width: '400px' }} onHide={() => setShowDialog(false)}>
          <div className="flex flex-col gap-4 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Nombre (Ej: 5 de Julio)</label>
              <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Día de la Independencia" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Fecha exacta</label>
              <Calendar value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="dd/mm/yy" placeholder="Seleccione día" />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Checkbox inputId="isAnnual" checked={isAnnual} onChange={(e) => setIsAnnual(e.checked as boolean)} />
              <label htmlFor="isAnnual" className="text-sm text-gray-700 font-medium cursor-pointer">
                Se repite todos los años el mismo día (Fijo)
              </label>
            </div>

            <Button label="Guardar Festividad" icon="pi pi-save" onClick={saveHoliday} className="mt-4" />
          </div>
        </Dialog>
      </div>
    </AppLayout>
  );
}
