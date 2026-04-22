import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import Dropdown from '@/components/ui/Dropdown';
import Calendar from '@/components/ui/Calendar';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';

const vacationHistorySchema = yup.object().shape({
  serviceYear: yup.number().min(1, 'Debe ser >= 1').required('Requerido'),
  servicePeriodName: yup.string().required('Requerido'), // Ej: 2024-2025
  totalDays: yup.number().min(0),
  enjoymentDays: yup.number().min(0, 'Debe ser >= 0').required('Requerido'),
  restDays: yup.number().min(0, 'Puede ser 0').required('Requerido'),
  startDate: yup.date().required('Requerido'),
  endDate: yup.date().required('Requerido'),
  notes: yup.string().nullable(),
});

export default function WorkerVacationsTab({ contracts }: { contracts: any[] }) {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
    resolver: yupResolver(vacationHistorySchema),
    defaultValues: {
      serviceYear: 1,
      servicePeriodName: '',
      totalDays: 15,
      enjoymentDays: 15,
      restDays: 0,
      startDate: new Date() as any,
      endDate: new Date() as any,
      notes: ''
    }
  });

  useEffect(() => {
    const active = contracts.find(c => c.isActive);
    if (active) setSelectedContractId(active.id);
    else if (contracts.length > 0) setSelectedContractId(contracts[0].id);
  }, [contracts]);

  useEffect(() => {
    if (selectedContractId) {
      fetchHistories(selectedContractId);
    }
  }, [selectedContractId]);

  const fetchHistories = async (contractId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/vacation-histories/by-employment/${contractId}`);
      setHistories(res.data);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial vacacional' });
    } finally {
      setLoading(false);
    }
  };

  const openNewRecord = () => {
    const sy = histories.length + 1;
    reset({
      serviceYear: sy,
      servicePeriodName: '',
      totalDays: 15 + (sy - 1),
      enjoymentDays: 15 + (sy - 1),
      restDays: 0,
      startDate: new Date() as any,
      endDate: new Date() as any,
      notes: ''
    });
    setShowDialog(true);
  };

  const deleteRecord = async (id: string) => {
    if (window.confirm('¿Seguro de eliminar este registro histórico vacacional?')) {
      try {
        await api.delete(`/vacation-histories/${id}`);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado' });
        if (selectedContractId) fetchHistories(selectedContractId);
      } catch (err) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro' });
      }
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (!selectedContractId) return;
      const formattedData = {
        serviceYear: data.serviceYear,
        servicePeriodName: data.servicePeriodName,
        enjoymentDays: data.enjoymentDays,
        restDays: data.restDays,
        notes: data.notes,
        employmentRecordId: selectedContractId,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
      };
      await api.post('/vacation-histories', formattedData);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Período Vacacional Registrado' });
      setShowDialog(false);
      fetchHistories(selectedContractId);
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Error guardando registro' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractOptions = contracts.map(c => ({
    label: `${c.position} - ${c.isActive ? 'Activo' : 'Liquidado'} (${c.startDate.split('T')[0]})`,
    value: c.id
  }));

  if (contracts.length === 0) {
    return <div className="p-8 text-center text-gray-500">Este trabajador no tiene contratos.</div>;
  }

  const getTotalEnjoyedDays = () => {
    return histories.reduce((sum, h) => sum + h.enjoymentDays, 0);
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="w-full md:w-1/3">
          <label className="text-sm font-semibold text-gray-600 block mb-2">Ver Historial del Contrato:</label>
          <Dropdown 
             value={selectedContractId} 
             options={contractOptions} 
             onChange={(e) => setSelectedContractId(e.value)} 
             className="w-full"
          />
        </div>
        <div>
          <Button label="Registrar Vacaciones Disfrutadas" icon="pi pi-sun" severity="warning" onClick={openNewRecord} />
        </div>
      </div>

      <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 flex items-center justify-between mb-6 shadow-sm">
        <div>
           <h3 className="text-orange-900 font-bold text-lg">Resumen de Antigüedad vs Disfrute</h3>
           <p className="text-orange-700 text-sm mt-1">Lleva el control de los días otorgados al trabajador por año de servicio.</p>
        </div>
        <div className="text-right">
           <span className="block text-3xl font-black text-orange-600 font-mono">{getTotalEnjoyedDays()}</span>
           <span className="text-xs uppercase font-bold text-orange-700 tracking-wider">Días Totales Disfrutados</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <DataTable value={histories} loading={loading} emptyMessage="No hay vacaciones registradas en este contrato">
          <Column field="serviceYear" header="Año Serv." body={(r) => <span className="font-bold">Año {r.serviceYear}</span>} />
          <Column field="servicePeriodName" header="Período" />
          <Column header="Fechas Disfrute" body={(r) => `${r.startDate.split('T')[0]} - ${r.endDate.split('T')[0]}`} />
          <Column header="Días de Disfrute" body={(r) => <span className="text-emerald-600 font-bold">{r.enjoymentDays}</span>} />
          <Column header="Días Restantes" body={(r) => <span className="text-amber-500 font-bold">{r.restDays}</span>} />
          <Column field="notes" header="Observaciones" />
          <Column body={(r) => (
             <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteRecord(r.id)} />
          )} />
        </DataTable>
      </div>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header="Registrar Historial de Vacaciones"
        className="w-full max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Año de Servicio <span className="text-red-500">*</span></label>
              <Controller
                name="serviceYear"
                control={control}
                render={({ field }) => (
                  <InputText 
                    {...field} 
                    type="number"
                    value={field.value?.toString() || ''}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                    className={`w-full ${errors.serviceYear ? 'p-invalid' : ''}`} 
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Período Referencial <span className="text-red-500">*</span></label>
              <Controller
                name="servicePeriodName"
                control={control}
                render={({ field }) => (
                  <InputText {...field} placeholder="Ej. 2024-2025" className={`w-full ${errors.servicePeriodName ? 'p-invalid' : ''}`} />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Días Correspondientes</label>
              <Controller
                name="totalDays"
                control={control}
                render={({ field }) => (
                  <InputText 
                    {...field} 
                    type="number"
                    value={field.value?.toString() || ''}
                    onChange={e => {
                       const t = parseInt(e.target.value) || 0;
                       field.onChange(t);
                       setValue('enjoymentDays', t - (getValues('restDays') || 0));
                    }} 
                    className="w-full bg-blue-50/50" 
                  />
                )}
              />
            </div>

             <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Días Pendientes <span className="text-red-500">*</span></label>
              <Controller
                name="restDays"
                control={control}
                render={({ field }) => (
                  <InputText 
                    {...field} 
                    type="number"
                    value={field.value?.toString() || ''}
                    onChange={e => {
                       const r = parseInt(e.target.value) || 0;
                       field.onChange(r);
                       setValue('enjoymentDays', Math.max(0, (getValues('totalDays') || 0) - r));
                    }} 
                    className={`w-full ${errors.restDays ? 'p-invalid' : ''}`} 
                  />
                )}
              />
            </div>

             <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Días Disfrutados <span className="text-red-500">*</span></label>
              <Controller
                name="enjoymentDays"
                control={control}
                render={({ field }) => (
                  <InputText 
                    {...field} 
                    type="number"
                    readOnly
                    value={field.value?.toString() || ''}
                    className={`w-full font-bold text-emerald-600 bg-gray-50`} 
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha Inicio <span className="text-red-500">*</span></label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                   <Calendar value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Fecha Fin <span className="text-red-500">*</span></label>
               <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                   <Calendar value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <InputText {...field} className="w-full" placeholder="Vacaciones adelantadas..." />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button type="button" label="Cancelar" onClick={() => setShowDialog(false)} unstyled className="px-5 py-2 font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors" />
            <Button type="submit" label="Guardar Registro" loading={isSubmitting} unstyled className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 font-semibold border border-orange-500 rounded-lg transition-colors flex items-center gap-2" />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
