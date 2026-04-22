'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Dialog from '../../../components/ui/Dialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';
import Calendar from '../../../components/ui/Calendar';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from "@/components/layout/AppLayout";

const variableSchema = yup.object().shape({
  code: yup.string().required('Código requerido'),
  name: yup.string().required('Nombre requerido'),
  value: yup.number().typeError('Debe ser un valor numérico').required('Valor requerido'),
  validFrom: yup.date().required('Fecha de inicio requerida'),
  validTo: yup.date().nullable()
});

export default function GlobalVariablesPage() {
  const { user } = useAuth();
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(variableSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      value: 0,
      validFrom: new Date(),
      validTo: null as Date | null
    }
  });

  const fetchVariables = async () => {
    try {
      setLoading(true);
      const res = await api.get('/global-variables');
      setVariables(res.data);
    } catch (error) {
      console.error('Error fetching global variables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  const openNew = () => {
    reset({
      code: '',
      name: '',
      value: 0,
      validFrom: new Date(),
      validTo: null as Date | null
    });
    setEditingId(null);
    setShowDialog(true);
  };

  const editVariable = (variable: any) => {
    reset({
      code: variable.code,
      name: variable.name,
      value: variable.value,
      validFrom: new Date(variable.validFrom.split('T')[0] + 'T00:00:00'),
      validTo: variable.validTo ? new Date(variable.validTo.split('T')[0] + 'T00:00:00') : null
    });
    setEditingId(variable.id);
    setShowDialog(true);
  };

  const hideDialog = () => {
    setShowDialog(false);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingId) {
        await api.patch(`/global-variables/${editingId}`, data);
      } else {
        await api.post('/global-variables', data);
      }
      setShowDialog(false);
      fetchVariables();
    } catch (error) {
      console.error('Error saving variable:', error);
      alert('Error al guardar la variable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteVariable = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta variable?')) {
      try {
        await api.delete(`/global-variables/${id}`);
        fetchVariables();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const importFromRoot = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post('/global-variables/import-from-root');
      alert(`Importación exitosa: ${res.data.importedCount} variables copiadas desde la matriz.`);
      fetchVariables();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al importar de la matriz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" onClick={() => editVariable(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" onClick={() => deleteVariable(rowData.id)} />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar variables..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <div className="flex gap-2">
        <Button label="Nueva Variable" icon="pi pi-plus" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={openNew} />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Variables Globales</h1>
        <p className="mt-2 text-sm text-gray-500">Administra las constantes de nómina (Salario Mínimo, Cestaticket, Unidad Tributaria) que se inyectarán en los cálculos.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable value={variables} paginator rows={10} loading={loading} globalFilter={globalFilter} header={header} 
          emptyMessage="No se encontraron variables registradas."
          className="p-datatable-sm"
          rowHover>
          <Column field="code" header="Código AST" sortable className="font-mono text-xs text-indigo-600 font-semibold" />
          <Column field="name" header="Nombre Descriptivo" sortable className="font-medium text-gray-900" />
          <Column field="value" header="Valor Numérico" sortable body={(rowData) => <span className="text-indigo-600 font-bold font-mono px-2 py-1 bg-indigo-50 rounded-md border border-indigo-100">{rowData.value}</span>} />
          <Column field="validFrom" header="Vigente Desde" sortable body={(rowData) => format(new Date(rowData.validFrom.split('T')[0] + 'T00:00:00'), 'dd/MM/yyyy')} />
          <Column field="validTo" header="Hasta" body={(rowData) => rowData.validTo ? format(new Date(rowData.validTo.split('T')[0] + 'T00:00:00'), 'dd/MM/yyyy') : <span className="text-gray-400 italic">Actualidad</span>} />
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
        </DataTable>
      </div>

      <Dialog visible={showDialog} style={{ width: '450px' }} header="Detalle de Variable Global" modal className="p-fluid" onHide={hideDialog}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Código AST (Variable)</label>
            <Controller name="code" control={control} render={({ field }) => (
              <InputText id={field.name} {...field} placeholder="Ej: SUELDO_MINIMO" className={`w-full ${errors.code ? 'p-invalid' : ''} font-mono uppercase`} onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, '_'))} />
            )} />
            {errors.code && <small className="text-red-500 mt-1">{errors.code.message}</small>}
          </div>

          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Descriptivo</label>
            <Controller name="name" control={control} render={({ field }) => (
              <InputText id={field.name} {...field} className={`w-full ${errors.name ? 'p-invalid' : ''}`} />
            )} />
            {errors.name && <small className="text-red-500 mt-1">{errors.name.message}</small>}
          </div>

          <div className="field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Numérico</label>
            <Controller name="value" control={control} render={({ field }) => (
              <InputText id={field.name} {...field} value={field.value?.toString() ?? ''} onChange={(e) => field.onChange(e.target.value)} type="number" step="0.0001" className={`w-full ${errors.value ? 'p-invalid' : ''}`} />
            )} />
            {errors.value && <small className="text-red-500 mt-1">{errors.value.message}</small>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vigente Desde</label>
              <Controller name="validFrom" control={control} render={({ field }) => (
                <Calendar id={field.name} value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className={`w-full ${errors.validFrom ? 'p-invalid' : ''}`} />
              )} />
              {errors.validFrom && <small className="text-red-500 mt-1">{errors.validFrom.message}</small>}
            </div>

            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta (Opcional)</label>
              <Controller name="validTo" control={control} render={({ field }) => (
                <Calendar id={field.name} value={(field.value as any) || null} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" placeholder="Pendiente" />
              )} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button label="Cancelar" icon="pi pi-times" onClick={hideDialog} className="p-button-text text-gray-600 hover:text-gray-900" type="button" />
            <Button label="Guardar Variable" icon="pi pi-check" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2 rounded-lg font-medium" />
          </div>
        </form>
      </Dialog>
      </div>
    </AppLayout>
  );
}
