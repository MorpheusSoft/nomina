"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Dialog from '../../../components/ui/Dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';
import Dropdown from '../../../components/ui/Dropdown';
import { Divider } from 'primereact/divider';

const shiftSchema = yup.object().shape({
  name: yup.string().required('El nombre del turno es obligatorio'),
});

type ShiftSequence = {
  type: 'WORK' | 'REST';
  start?: string;
  end?: string;
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sequence, setSequence] = useState<ShiftSequence[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(shiftSchema) as any,
    defaultValues: { name: '' }
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shifts');
      setShifts(res.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openNew = () => {
    reset({ name: '' });
    setSequence([{ type: 'WORK', start: '08:00', end: '17:00' }]);
    setSelectedShift(null);
    setShowDialog(true);
  };

  const openEdit = (shift: any) => {
    reset({ name: shift.name });
    setSequence(shift.sequence || []);
    setSelectedShift(shift);
    setShowDialog(true);
  };

  const deleteShift = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este Turno Maestro?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchShifts();
    } catch (e) {
      console.error(e);
      alert('Error eliminando turno');
    }
  };

  const onSubmit = async (data: any) => {
    if (sequence.length === 0) {
      alert('Agregue al menos un día a la secuencia');
      return;
    }
    
    // Validar secuencias
    for (const [i, seq] of sequence.entries()) {
       if (seq.type === 'WORK' && (!seq.start || !seq.end)) {
         alert(`El día ${i + 1} de trabajo requiere hora de entrada y salida.`);
         return;
       }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: data.name,
        sequence: sequence,
      };

      if (selectedShift) {
        await api.put(`/shifts/${selectedShift.id}`, payload);
      } else {
        await api.post('/shifts', payload);
      }
      setShowDialog(false);
      fetchShifts();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Ocurrió un error al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDay = () => {
    let newDay: ShiftSequence = { type: 'WORK', start: '08:00', end: '17:00' };
    if (sequence.length > 0) {
      const lastDay = sequence[sequence.length - 1];
      newDay = { type: lastDay.type, start: lastDay.start, end: lastDay.end };
    }
    setSequence([...sequence, newDay]);
  };
  const removeDay = (idx: number) => setSequence(sequence.filter((_, i) => i !== idx));
  const updateDay = (idx: number, key: keyof ShiftSequence, value: any) => {
    const updated = [...sequence];
    updated[idx] = { ...updated[idx], [key]: value };
    // Limpiar horas si cambia a descanso
    if (key === 'type' && value === 'REST') {
       updated[idx].start = undefined;
       updated[idx].end = undefined;
    } else if (key === 'type' && value === 'WORK') {
       updated[idx].start = '08:00';
       updated[idx].end = '17:00';
    }
    setSequence(updated);
  };

  const renderDaysSequence = (rowData: any) => {
    const seq = rowData.sequence || [];
    return <span>{seq.length} Días (Rotación)</span>;
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 animate-fadein">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">Matrices de Turnos (Shifts)</h1>
            <p className="text-gray-500 mt-1">Constructor Mágico: Modela ciclos rotativos para asociarlos a Cuadrillas.</p>
          </div>
          <Button label="Crear Matriz" icon="pi pi-plus" className="p-button-primary shadow-md" onClick={openNew} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
             <div className="relative w-full md:w-96 flex items-center">
                <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
                <InputText 
                  placeholder="Buscar turnos..." 
                  className="w-full border-gray-200 focus:border-indigo-500 rounded-xl"
                  style={{ paddingLeft: '2.5rem' }}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
             </div>
          </div>

          <DataTable 
            value={shifts} 
            loading={loading}
            paginator 
            rows={10}
            globalFilter={globalFilter}
            emptyMessage="No se encontraron turnos maestros."
            className="p-datatable-sm"
          >
            <Column field="name" header="Nombre del Turno Maestro" className="font-semibold text-indigo-900" />
            <Column header="Ciclo de Rotación" body={renderDaysSequence} />
            <Column body={(rowData) => (
              <div className="flex justify-end gap-2 px-4 shadow-none">
                <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteShift(rowData.id)} />
              </div>
            )} />
          </DataTable>
        </div>

        <Dialog
          visible={showDialog}
          onHide={() => setShowDialog(false)}
          header={selectedShift ? 'Editar Matriz' : 'Nueva Matriz de Turno'}
          style={{ width: '800px' }}
          footer={
            <div className="flex justify-end gap-3 mt-6">
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text text-gray-600" onClick={() => setShowDialog(false)} />
              <Button label={isSubmitting ? 'Guardando...' : 'Guardar Matriz'} icon="pi pi-save" className="p-button-primary shadow-md" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} />
            </div>
          }
        >
           <form className="space-y-6 pt-2">
             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Turno Maestro <span className="text-red-500">*</span></label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <InputText id={field.name} {...field} className={`w-full ${errors.name ? 'p-invalid' : ''}`} placeholder="Ej: Guardia 5x2 Diurna" />
                  )} />
                  {errors.name && <small className="p-error block mt-1">{errors.name.message as string}</small>}
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-2">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-indigo-900">Secuencia Mágica (Ciclo de Vida)</h3>
                      <Button label="Añadir Día" icon="pi pi-plus" size="small" outlined className="p-button-secondary" onClick={addDay} type="button" />
                   </div>
                   <p className="text-xs text-gray-500 mb-4">Agrega cada día del ciclo rotativo en el orden exacto. Ej: 5 días laborables, seguidos de 2 descansos.</p>
                   
                   <div className="space-y-3">
                     {sequence.map((seq, idx) => (
                       <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-200">
                         <div className="w-16 text-center font-bold text-gray-400">Día {idx + 1}</div>
                         <Dropdown
                           options={[{label: 'Laborable', value: 'WORK'}, {label: 'Descanso', value: 'REST'}]}
                           value={seq.type}
                           onChange={(e) => updateDay(idx, 'type', e.target.value)}
                         />
                         
                         {seq.type === 'WORK' ? (
                           <>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Desde:</span>
                                <InputText type="time" value={seq.start || ''} onChange={(e) => updateDay(idx, 'start', e.target.value)} className="w-32" />
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Hasta:</span>
                                <InputText type="time" value={seq.end || ''} onChange={(e) => updateDay(idx, 'end', e.target.value)} className="w-32" />
                             </div>
                           </>
                         ) : (
                           <div className="flex-1 text-gray-400 italic text-sm text-center">Día Libre de Guardias</div>
                         )}
                         <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeDay(idx)} type="button" />
                       </div>
                     ))}
                   </div>
                   {sequence.length === 0 && <div className="text-center p-4 text-gray-400">Sin secuencia definida</div>}
                </div>
             </div>
           </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
