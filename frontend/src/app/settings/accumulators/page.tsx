'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputSwitch } from 'primereact/inputswitch';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';
import AppLayout from "@/components/layout/AppLayout";
import { BreadCrumb } from 'primereact/breadcrumb';

const accumulatorSchema = yup.object().shape({
  name: yup.string().required('Nombre requerido').matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos (A-Z, a-z, 0-9, _) sin espacios. Ej: ACUM_SALARIO_NORMAL'),
  description: yup.string().nullable(),
  type: yup.string().required('Requerido'),
  weeksBack: yup.number().nullable().min(1, 'Min 1'),
  includeAllBonifiable: yup.boolean().default(false),
  conceptIds: yup.array().of(yup.string()).default([]),
});

export default function AccumulatorsPage() {
  const [accumulators, setAccumulators] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(accumulatorSchema),
    defaultValues: { name: '', description: '', type: 'WEEKS_BACK', weeksBack: 4, includeAllBonifiable: false, conceptIds: [] }
  });

  const watchIncludeAllBonifiable = watch('includeAllBonifiable');

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccumulators();
    fetchConcepts();
  }, []);

  const fetchAccumulators = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll-accumulators');
      setAccumulators(res.data);
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los Acumuladores' });
    } finally {
      setLoading(false);
    }
  };

  const fetchConcepts = async () => {
    try {
      const res = await api.get('/concepts');
      setConcepts(res.data.map((c: any) => ({ label: `${c.code} - ${c.name}`, value: c.id })));
    } catch(err) {}
  };

  const openNew = () => {
    setEditingId(null);
    reset({ name: '', description: '', type: 'WEEKS_BACK', weeksBack: 4, includeAllBonifiable: false, conceptIds: [] });
    setShowDialog(true);
  };

  const openEdit = (acc: any) => {
    setEditingId(acc.id);
    reset({
      name: acc.name,
      description: acc.description || '',
      type: acc.type || 'WEEKS_BACK',
      weeksBack: acc.weeksBack || 4,
      includeAllBonifiable: acc.includeAllBonifiable || false,
      conceptIds: acc.concepts?.map((c: any) => c.conceptId) || []
    });
    setShowDialog(true);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/payroll-accumulators/${editingId}`, data);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Acumulador actualizado' });
      } else {
        await api.post('/payroll-accumulators', data);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Acumulador creado' });
      }
      setShowDialog(false);
      fetchAccumulators();
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: error.response?.data?.message || 'Error guardando Acumulador' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAccumulator = async (id: string) => {
    if (window.confirm('¿Eliminar este Acumulador Dinámico? Las fórmulas del motor que dependan de él podrían fallar.')) {
      try {
        await api.delete(`/payroll-accumulators/${id}`);
        fetchAccumulators();
        toast.current?.show({ severity: 'success', summary: 'Eliminado', detail: 'Acumulador eliminado' });
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el Acumulador' });
      }
    }
  };

  const header = (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border-b border-gray-200 gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Acumuladores Dinámicos (Variables N a N)</h2>
        <p className="text-sm text-gray-500 mt-1">Crea variables inyectables al Motor de Nómina que asimilen promedios de conceptos anteriores.</p>
      </div>
      <div className="flex items-center gap-3">
        <IconField iconPosition="left" className="w-full md:w-auto">
          <InputIcon className="pi pi-search text-gray-400" />
          <InputText type="search" onInput={(e: any) => setGlobalFilter(e.target.value)} placeholder="Buscar..." className="w-full" />
        </IconField>
        <Button label="Crear Acumulador" icon="pi pi-plus" onClick={openNew} />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6">
        <BreadCrumb model={[{ label: 'Ajustes' }, { label: 'Acumuladores' }]} home={{ icon: 'pi pi-home', url: '/' }} className="mb-6 border-none bg-transparent p-0" />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable 
            value={accumulators} 
            loading={loading}
            paginator rows={10}
            globalFilter={globalFilter}
            header={header}
            emptyMessage="No hay acumuladores registrados"
            className="p-datatable-sm"
          >
            <Column field="name" header="Variable" className="font-mono text-indigo-600 font-semibold" sortable />
            <Column header="Análisis Retrospectivo" body={(r) => r.type === 'YEAR_TO_DATE' ? <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs">YTD (1ro Ene actual)</span> : r.type === 'EXACT_PERIOD' ? <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs">Período de Nómina</span> : <span className="text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs">Últimas {r.weeksBack} semanas</span>} />
            <Column field="description" header="Descripción" />
            <Column header="Conceptos Asociados" body={(r) => (
              r.includeAllBonifiable ? (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-200 font-medium">Todos los Bonificables</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {r.concepts?.map((c: any) => (
                    <span key={c.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                      {c.concept?.code}
                    </span>
                  ))}
                </div>
              )
            )} />
            <Column body={(row) => (
              <div className="flex justify-end gap-2">
                <Button icon="pi pi-pencil" rounded text onClick={() => openEdit(row)} />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteAccumulator(row.id)} />
              </div>
            )} />
          </DataTable>
        </div>
      </div>

      <Dialog 
        visible={showDialog} 
        onHide={() => setShowDialog(false)} 
        header={editingId ? 'Editar Acumulador' : 'Nuevo Acumulador'}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Sistémico (Variable)</label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <IconField iconPosition="left" className="w-full">
                    <InputIcon className="pi pi-code text-gray-400" />
                    <InputText {...field} 
                      className={`w-full ${fieldState.error ? 'p-invalid' : ''}`} 
                      placeholder="ACUM_SALARIO_NORMAL" 
                    />
                  </IconField>
                  {fieldState.error && <small className="text-red-500 block mt-1">{fieldState.error.message}</small>}
                </div>
              )}
            />
            <small className="text-gray-500 text-xs">Con este nombre exacto invocarás este saldo dentro de tus fórmulas matemáticas.</small>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período Analítico</label>
              <Controller
                name="type"
                control={control}
                render={({ field, fieldState }) => (
                  <Dropdown {...field}
                    options={[
                      { label: 'Análisis por Semana Atrás', value: 'WEEKS_BACK' },
                      { label: 'Acumulado Anual (YTD)', value: 'YEAR_TO_DATE' },
                      { label: 'Período de Nómina', value: 'EXACT_PERIOD' }
                    ]}
                    className={`w-full ${fieldState.error ? 'p-invalid' : ''}`}
                  />
                )}
              />
            </div>
            
            <Controller
              name="type"
              control={control}
              render={({ field: typeField }) => (
                  <div className={typeField.value === 'WEEKS_BACK' ? 'block' : 'hidden'}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semanas a Evaluar</label>
                    <Controller
                      name="weeksBack"
                      control={control}
                      render={({ field, fieldState }) => (
                        <div className="w-full">
                          <InputNumber 
                            id={field.name} 
                            value={field.value} 
                            onValueChange={(e) => field.onChange(e.value)} 
                            min={1} max={520} 
                            className={`w-full ${fieldState.error ? 'p-invalid' : ''}`} 
                          />
                          {fieldState.error && <small className="text-red-500">{fieldState.error.message}</small>}
                        </div>
                      )}
                    />
                  </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <InputTextarea {...field} value={field.value || ''} rows={3} className="w-full" placeholder="Base para utilidades legales..." />
              )}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 mb-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <Controller
              name="includeAllBonifiable"
              control={control}
              render={({ field }) => (
                <InputSwitch inputId="includeAllBonifiable" checked={field.value} onChange={(e) => field.onChange(e.value)} />
              )}
            />
            <label htmlFor="includeAllBonifiable" className="text-sm font-medium text-indigo-900 cursor-pointer">
              Integrar automáticamente todos los Conceptos Bonificables
            </label>
          </div>

          {!watchIncludeAllBonifiable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conceptos Maestros de la Relación (M-N)</label>
              <Controller
                name="conceptIds"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <MultiSelect 
                      id={field.name}
                      value={field.value} 
                      onChange={e => field.onChange(e.value)} 
                      options={concepts} 
                      optionLabel="label" 
                      filter 
                      placeholder="Seleccione los Conceptos a sumar" 
                      display="chip"
                      className={`w-full ${fieldState.error ? 'p-invalid' : ''}`} 
                    />
                    {fieldState.error && <small className="text-red-500 block mt-1">{fieldState.error.message}</small>}
                  </>
                )}
              />
            </div>
          )}

          <div className="flex justify-end pt-4 gap-3 border-t mt-6">
            <Button type="button" label="Cancelar" outlined onClick={() => setShowDialog(false)} />
            <Button type="submit" label="Guardar Acumulador" loading={isSubmitting} />
          </div>
        </form>
      </Dialog>
    </AppLayout>
  );
}
