"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Dialog from '../../../components/ui/Dialog';
import Dropdown from '../../../components/ui/Dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Checkbox } from 'primereact/checkbox';
import api from '../../../lib/api';

const variableSchema = yup.object().shape({
  id: yup.string().nullable(),
  code: yup.string().required('Código requerido'),
  name: yup.string().required('Nombre requerido'),
  type: yup.string().default('STATIC'),
  value: yup.number().typeError('Debe ser numérico').default(0),
  conceptIds: yup.array().of(yup.string()).nullable(),
  validFrom: yup.date().nullable().required('Fecha inicial requerida')
});

const groupSchema = yup.object().shape({
  name: yup.string().required('El nombre del convenio es obligatorio'),
  rootRegularConceptId: yup.string().nullable(),
  rootVacationConceptId: yup.string().nullable(),
  rootBonusConceptId: yup.string().nullable(),
  rootLiquidationConceptId: yup.string().nullable(),
  loanDeductionConceptId: yup.string().nullable(),
  islrConceptId: yup.string().nullable(),
  standardWorkHours: yup.number().default(8.0),
  nightShiftStartTime: yup.string().default('19:00'),
  nightShiftEndTime: yup.string().default('05:00'),
});

export default function PayrollGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showVarsDialog, setShowVarsDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupVariables, setGroupVariables] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingVar, setIsSubmittingVar] = useState(false);

  const { control: groupControl, handleSubmit: handleGroupSubmit, reset: resetGroup, formState: { errors: groupErrors } } = useForm({
    resolver: yupResolver(groupSchema) as any,
    defaultValues: {
      name: '',
      rootRegularConceptId: null,
      rootVacationConceptId: null,
      rootBonusConceptId: null,
      rootLiquidationConceptId: null,
      loanDeductionConceptId: null,
      islrConceptId: null,
      standardWorkHours: 8.0,
      nightShiftStartTime: '19:00',
      nightShiftEndTime: '05:00',
    }
  });

  const { control: varControl, handleSubmit: handleVarSubmit, reset: resetVar, watch: watchVar, formState: { errors: varErrors } } = useForm({
    resolver: yupResolver(variableSchema) as any,
    defaultValues: {
      id: null, code: '', name: '', type: 'STATIC', value: 0, conceptIds: [], validFrom: new Date() as any
    }
  });

  const varType = watchVar('type');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, conceptsRes] = await Promise.all([
        api.get('/payroll-groups'),
        api.get('/concepts')
      ]);
      setGroups(groupsRes.data);
      setConcepts(conceptsRes.data.map((c: any) => ({ label: `${c.code} - ${c.name}`, value: c.id })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    resetGroup({ 
      name: '', 
      standardWorkHours: 8.0, 
      nightShiftStartTime: '19:00', 
      nightShiftEndTime: '05:00', 
      rootRegularConceptId: null, 
      rootVacationConceptId: null, 
      rootBonusConceptId: null, 
      rootLiquidationConceptId: null, 
      loanDeductionConceptId: null,
      islrConceptId: null,
    });
    setShowDialog(true);
  };

  const hideDialog = () => {
    setShowDialog(false);
  };

  const onSubmitGroup = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (data.id) {
        await api.patch(`/payroll-groups/${data.id}`, data);
      } else {
        await api.post('/payroll-groups', data);
      }
      setShowDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar el Convenio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVariables = async (group: any) => {
    setSelectedGroup(group);
    resetVar({ id: null, code: '', name: '', type: 'STATIC', value: 0, conceptIds: [], validFrom: new Date() as any });
    
    try {
      const res = await api.get(`/payroll-group-variables?payrollGroupId=${group.id}`);
      setGroupVariables(res.data);
      setShowVarsDialog(true);
    } catch (error) {
       console.error(error);
    }
  };

  const onSubmitVar = async (data: any) => {
     try {
       setIsSubmittingVar(true);
       if (data.id) {
         await api.patch(`/payroll-group-variables/${data.id}`, data);
       } else {
         await api.post('/payroll-group-variables', { ...data, payrollGroupId: selectedGroup.id });
       }
       
       // Refetch internal
       const res = await api.get(`/payroll-group-variables?payrollGroupId=${selectedGroup.id}`);
       setGroupVariables(res.data);
       resetVar({ id: null, code: '', name: '', type: 'STATIC', value: 0, conceptIds: [], validFrom: new Date() as any });
     } catch (e) { console.error(e); } finally { setIsSubmittingVar(false); }
  };

  const editVar = (rowData: any) => {
    resetVar({
      id: rowData.id,
      code: rowData.code,
      name: rowData.name,
      type: rowData.type,
      value: rowData.value,
      conceptIds: rowData.concepts?.map((c: any) => c.id) || [],
      validFrom: new Date(rowData.validFrom.split('T')[0] + 'T00:00:00') as any
    });
  };

  const deleteVar = async (id: string) => {
      try {
        await api.delete(`/payroll-group-variables/${id}`);
        const res = await api.get(`/payroll-group-variables?payrollGroupId=${selectedGroup.id}`);
        setGroupVariables(res.data);
      } catch (error) { console.error(error); }
  };

  const deleteGroup = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este Convenio? Los contratos atados perderán su grupo.')) {
      try {
        await api.delete(`/payroll-groups/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-sliders-h" rounded outlined severity="warning" aria-label="Variables" onClick={() => openVariables(rowData)} title="Configurar Variables/Ley" />
        <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" onClick={() => { resetGroup(rowData); setShowDialog(true); }} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" onClick={() => deleteGroup(rowData.id)} />
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar convenios..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <Button label="Nuevo Convenio" icon="pi pi-users" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={openNew} />
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Convenios (Grupos de Nómina)</h1>
          <p className="mt-2 text-sm text-gray-500">Agrupa a los trabajadores bajo un mismo conjunto de reglas salariales y frecuencia de pago. Ej: Obreros, Empleados, Directiva.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable value={groups} paginator rows={10} loading={loading} globalFilter={globalFilter} header={header} 
            emptyMessage="No hay convenios registrados."
            className="p-datatable-sm"
            rowHover>
            <Column field="name" header="Nombre del Convenio" sortable className="font-semibold text-gray-900" />
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
          </DataTable>
        </div>

        <Dialog visible={showDialog} style={{ width: '450px' }} header="Gestión de Convenio" modal className="p-fluid" onHide={hideDialog}>
          <form onSubmit={handleGroupSubmit(onSubmitGroup)} className="space-y-4 pt-4">
            
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Ej: Obreros Semanales)</label>
              <Controller name="name" control={groupControl} render={({ field }) => (
                <InputText id={field.name} {...field} className={`w-full ${groupErrors.name ? 'p-invalid' : ''}`} placeholder="" />
              )} />
              {groupErrors.name && <small className="text-red-500 mt-1">{groupErrors.name.message as string}</small>}
            </div>

            <h3 className="text-md font-semibold text-gray-800 mt-6 mb-4 border-b pb-2">Reglas de Jornada Base</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas Ordinarias</label>
                <Controller name="standardWorkHours" control={groupControl} render={({ field }) => (
                  <InputText id={field.name} value={field.value as any} onChange={(e) => field.onChange(Number(e.target.value) || 0)} className="w-full" placeholder="Ej: 8" keyfilter="num" />
                )} />
              </div>
              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio Nocturno</label>
                <Controller name="nightShiftStartTime" control={groupControl} render={({ field }) => (
                  <InputText id={field.name} {...field} className="w-full" placeholder="Ej: 19:00" />
                )} />
              </div>
              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin Nocturno</label>
                <Controller name="nightShiftEndTime" control={groupControl} render={({ field }) => (
                  <InputText id={field.name} {...field} className="w-full" placeholder="Ej: 05:00" />
                )} />
              </div>
            </div>


            <h3 className="text-md font-semibold text-gray-800 mt-6 mb-4 border-b pb-2">Árbol de Ejecución (Puntos de Entrada)</h3>
            <p className="text-xs text-gray-500 mb-4">Seleccione qué Conceptos Mástros deben arrancar el cálculo estadístico según el tipo de nómina. Si se deja en blanco, deberá indicarse manualmente al abrir el período.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nómina Regular</label>
                <Controller name="rootRegularConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione concepto base..." className="w-full text-sm" filter showClear />
                )} />
              </div>

              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nómina de Vacaciones</label>
                <Controller name="rootVacationConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione concepto base..." className="w-full text-sm" filter showClear />
                )} />
              </div>

              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nómina de Utilidades/Bono</label>
                <Controller name="rootBonusConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione concepto base..." className="w-full text-sm" filter showClear />
                )} />
              </div>

              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nómina de Liquidación</label>
                <Controller name="rootLiquidationConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione concepto base..." className="w-full text-sm" filter showClear />
                )} />
              </div>

              <div className="field md:col-span-2 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-purple-700 mb-1">Concepto Autorizado para Rebajar Préstamos (Ej: DEDUCCIÓN PRÉSTAMO RRHH)</label>
                <Controller name="loanDeductionConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Opcional. Seleccione concepto para auto-liquidación de préstamos..." className="w-full text-sm shadow-sm" filter showClear />
                )} />
              </div>

              <div className="field md:col-span-2 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-emerald-700 mb-1">Concepto Autorizado para Retención ISLR (ARC / SENIAT)</label>
                <Controller name="islrConceptId" control={groupControl} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Opcional. Seleccione concepto oficial para retención impositiva (ISLR)..." className="w-full text-sm shadow-sm" filter showClear />
                )} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button label="Cancelar" icon="pi pi-times" onClick={hideDialog} className="p-button-text text-gray-600 hover:text-gray-900" type="button" />
              <Button label="Guardar" icon="pi pi-check" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2 rounded-lg font-medium" />
            </div>
          </form>
        </Dialog>

        {/* VARIABLES DIALOG */}
        <Dialog visible={showVarsDialog} style={{ width: '850px' }} header={`Constantes Legales: ${selectedGroup?.name}`} modal className="p-fluid" onHide={() => setShowVarsDialog(false)}>
           <div className="flex flex-col gap-6 pt-2">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                 <p className="text-sm text-amber-800 m-0">Define parámetros únicos para este convenio (Ej: <b>PORC_UTIL: 15.00</b>, <b>DIAS_VACACIONES: 30</b>). El motor de fórmulas inyectará estas constantes cuando deba calcular la nómina de estos trabajadores, ignorando variables globales que se llamen igual.</p>
              </div>

              <form onSubmit={handleVarSubmit(onSubmitVar)} className="flex flex-col gap-4 border-b border-gray-200 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CÓDIGO (Ej: BASE_UTIL)</label>
                       <Controller name="code" control={varControl} render={({ field }) => (
                          <InputText {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, '_'))} className={`w-full font-mono text-sm ${varErrors.code ? 'p-invalid' : ''}`} />
                       )} />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Descriptivo</label>
                       <Controller name="name" control={varControl} render={({ field }) => (
                          <InputText {...field} className={`w-full text-sm ${varErrors.name ? 'p-invalid' : ''}`} />
                       )} />
                    </div>
                    <div className="md:col-span-1">
                       <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Comportamiento</label>
                       <Controller name="type" control={varControl} render={({ field }) => (
                          <Dropdown {...field} options={[{label: 'Valor Plano (Constante)', value: 'STATIC'}, {label: 'Sumatoria Histórica', value: 'SUM_CONCEPTS'}]} className="w-full text-sm" />
                       )} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    {varType === 'STATIC' ? (
                      <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Valor Matemático</label>
                         <Controller name="value" control={varControl} render={({ field }) => (
                            <InputText {...field} value={field.value?.toString() ?? ''} onChange={(e) => field.onChange(e.target.value)} type="number" step="0.0001" className={`w-full text-sm font-bold text-emerald-700 ${varErrors.value ? 'p-invalid' : ''}`} />
                         )} />
                      </div>
                    ) : (
                      <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Conceptos a Sumar (Acumular)</label>
                         <Controller name="conceptIds" control={varControl} render={({ field }) => (
                            <MultiSelect {...field} options={concepts} onChange={(e) => field.onChange(e.value)} display="chip" placeholder="Selecciona conceptos..." className="w-full text-sm" filter />
                         )} />
                      </div>
                    )}
                    <div className="md:col-span-1">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vigencia Desde</label>
                       <Controller name="validFrom" control={varControl} render={({ field }) => (
                           <Calendar value={field.value as any} onChange={e => field.onChange(e.value)} dateFormat="dd/mm/yy" className="w-full text-sm" />
                       )} />
                    </div>
                    <div className="md:col-span-1">
                       <Button type="submit" label={watchVar('id') ? "Guardar" : "Anexar Ley"} icon={watchVar('id') ? "pi pi-save" : "pi pi-plus"} loading={isSubmittingVar} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full text-sm" />
                    </div>
                  </div>
              </form>

              <DataTable value={groupVariables} emptyMessage="No hay parámetros particulares definidos para este sindicato/convenio." className="p-datatable-sm shadow-sm border border-gray-100">
                 <Column field="code" header="Variable AST" className="font-mono text-indigo-700 font-bold text-xs" />
                 <Column field="name" header="Descripción" className="text-sm" />
                 <Column field="type" header="Tipo" body={(r) => r.type === 'SUM_CONCEPTS' ? <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded">Sumatoria</span> : <span className="text-[10px] bg-gray-100 text-gray-800 px-2 py-1 rounded">Constante</span>} />
                 <Column header="Valor / Composición" body={(r) => r.type === 'SUM_CONCEPTS' ? (
                   <div className="flex flex-wrap gap-1">
                     {r.concepts?.map((c: any) => <span key={c.id} className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.5 rounded">{c.code}</span>)}
                   </div>
                 ) : (
                   <span className="text-emerald-700 font-bold">{Number(r.value).toFixed(2)}</span>
                 )} />
                 <Column field="validFrom" header="Vigencia" body={(r) => new Date(r.validFrom.split('T')[0] + 'T00:00:00').toLocaleDateString('es-ES')} className="text-sm text-gray-500" />
                 <Column header="" body={(r) => (
                    <div className="flex gap-2 justify-end">
                       <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => editVar(r)} />
                       <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deleteVar(r.id)} />
                    </div>
                 )} style={{ width: '7rem' }}/>
              </DataTable>
           </div>
        </Dialog>
      </div>
    </AppLayout>
  );
}
