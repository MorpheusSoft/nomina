"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Dialog from '../../../components/ui/Dialog';
import Dropdown from '../../../components/ui/Dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import { InputSwitch } from 'primereact/inputswitch';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';

const TYPE_OPTIONS = [
  { label: 'Nómina Regular', value: 'REGULAR' },
  { label: 'Vacaciones', value: 'VACATION' },
  { label: 'Utilidades / Bono', value: 'PROFIT_SHARING' },
  { label: 'Liquidación / Finiquito', value: 'SETTLEMENT' },
  { label: 'Nómina Especial', value: 'SPECIAL' },
];

const periodSchema = yup.object().shape({
  name: yup.string().required('Nombre requerido. Ej: 1era Quincena Marzo 2026'),
  payrollGroupId: yup.string().required('Debe seleccionar un convenio'),
  type: yup.string().required('Seleccione el tipo de nómina'),
  costCenterId: yup.string().nullable(),
  departmentIds: yup.array().of(yup.string()),
  specialConceptIds: yup.array().of(yup.string()).nullable().when('type', {
    is: 'SPECIAL',
    then: (schema) => schema.required('Debe seleccionar al menos un concepto').min(1, 'Debe seleccionar al menos un concepto')
  }),
  linkedAttendancePeriodIds: yup.array().of(yup.string()).nullable(),
  processStatuses: yup.array().of(yup.string()).required('Seleccione al menos un estatus a procesar').min(1, 'Seleccione al menos un estatus a procesar'),
  startDate: yup.date().nullable().required('Fecha inicial requerida'),
  endDate: yup.date().nullable().required('Fecha final requerida').min(
    yup.ref('startDate'),
    'La fecha final no puede ser menor a la inicial'
  ),
});

export default function PayrollPeriodsPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(periodSchema) as any,
    defaultValues: {
      id: '',
      name: '',
      payrollGroupId: '',
      type: 'REGULAR',
      costCenterId: null as any,
      departmentIds: [] as any[],
      specialConceptIds: [] as any[],
      linkedAttendancePeriodIds: [] as any[],
      processStatuses: ['ACTIVE'] as any,
      startDate: null as any,
      endDate: null as any
    }
  });

  const watchType = watch('type');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [periodsRes, groupsRes, conceptsRes, ccRes, depRes] = await Promise.all([
        api.get('/payroll-periods'),
        api.get('/payroll-groups'),
        api.get('/concepts'),
        api.get('/cost-centers'),
        api.get('/departments')
      ]);
      setPeriods(periodsRes.data);
      setGroups(groupsRes.data.map((g: any) => ({ label: g.name, value: g.id })));
      setConcepts(conceptsRes.data.map((c: any) => ({ label: `${c.code} - ${c.name}`, value: c.id })));
      setCostCenters(ccRes.data.map((c: any) => ({ label: c.name, value: c.id })));
      setDepartments(depRes.data.map((d: any) => ({ label: d.name, value: d.id })));
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
    reset({ id: '', name: '', payrollGroupId: '', type: 'REGULAR', costCenterId: null, departmentIds: [], specialConceptIds: [], linkedAttendancePeriodIds: [], processStatuses: ['ACTIVE'], startDate: null as any, endDate: null as any });
    setShowDialog(true);
  };

  const editPeriod = (period: any) => {
    reset({
      id: period.id,
      name: period.name,
      payrollGroupId: period.payrollGroupId,
      costCenterId: period.costCenterId,
      departmentIds: period.departments ? period.departments.map((d: any) => d.id) : [],
      type: period.type,
      specialConceptIds: period.specialConcepts ? period.specialConcepts.map((c: any) => c.id) : [],
      linkedAttendancePeriodIds: period.importedAttendancePeriods ? period.importedAttendancePeriods.map((p: any) => p.id) : [],
      processStatuses: period.processStatuses && period.processStatuses.length > 0 ? period.processStatuses : ['ACTIVE'],
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate)
    });
    setShowDialog(true);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const { id, ...payload } = data;
      if (id) {
        await api.patch(`/payroll-periods/${id}`, payload);
      } else {
        await api.post('/payroll-periods', payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      const apiMessage = error.response?.data?.message || 'Error al guardar la nómina';
      alert(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePeriod = (rowData: any) => {
    const receiptCount = rowData._count?.receipts || 0;
    let msg = '¿Estás seguro de eliminar este período de nómina?';
    if (receiptCount > 0) {
      msg = `Existen ${receiptCount} recibos procesados atados a esta nómina. Si procedes, SERÁN ELIMINADOS DEFINITIVAMENTE. ¿Estás seguro?`;
    }
    
    confirmDialog({
      message: msg,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await api.delete(`/payroll-periods/${rowData.id}`);
          fetchData();
        } catch (error) {
          console.error('Error deleting:', error);
          alert('Error al eliminar el período. Puede estar cerrado o protegido.');
        }
      }
    });
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'warning';
      case 'PRE_CALCULATED': return 'info';
      case 'CLOSED': return 'success';
      default: return 'warning';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador / Abierta';
      case 'PRE_CALCULATED': return 'Pre-Calculada (Revisión)';
      case 'CLOSED': return 'Cerrada / Pagada';
      default: return status;
    }
  };

  const getTypeBadge = (type: string) => {
    const opt = TYPE_OPTIONS.find(o => o.value === type);
    return opt ? opt.label : type;
  };

  const actionBodyTemplate = (rowData: any) => {
    const isClosed = rowData.status === 'CLOSED';
    return (
      <div className="flex gap-2 justify-end">
        <Button icon="pi pi-cog" rounded outlined severity="help" aria-label="Procesar" title="Ir al Motor de Fórmulas" onClick={() => router.push(`/payroll/periods/${rowData.id}`)} />
        <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Editar" onClick={() => editPeriod(rowData)} disabled={isClosed} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" onClick={() => deletePeriod(rowData)} disabled={isClosed} />
      </div>
    );
  };

  const scopeBodyTemplate = (r: any) => {
    const depNames = r.departments?.map((d: any) => d.name).join(', ');
    const ccName = r.costCenter?.name;
    if (!depNames && !ccName) return <span className="text-gray-400 italic text-xs">Toda la Empresa</span>;
    
    return (
      <div className="flex flex-col text-[11px] leading-tight max-w-[200px]">
        {depNames && <span className="text-gray-700"><b>Dptos:</b> {depNames}</span>}
        {ccName && <span className="text-gray-700 mt-1"><b>CC:</b> {ccName}</span>}
      </div>
    );
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar períodos..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <InputSwitch checked={showClosed} onChange={(e) => setShowClosed(e.value)} />
          <span className="text-sm font-medium text-gray-700">Mostrar Histórico</span>
        </div>
        <Button label="Aperturar Nómina" icon="pi pi-calendar-plus" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={openNew} />
      </div>
    </div>
  );

  const displayedPeriods = showClosed ? periods : periods.filter(p => !['CLOSED', 'APPROVED'].includes(p.status));

  return (
    <AppLayout>
      <ConfirmDialog />
      <div className="p-6 max-w-[1600px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Períodos de Nómina</h1>
          <p className="mt-2 text-sm text-gray-500">Apertura las nóminas regulares o especiales para preparar el entorno a ser procesado por el Motor Algebraico. Las fechas dictaminarán qué recibos leer para variables históricas (Ej: Utilidades).</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable value={displayedPeriods} paginator rows={10} loading={loading} globalFilter={globalFilter} header={header} 
            emptyMessage="No hay períodos registrados."
            className="p-datatable-sm"
            rowHover>
            <Column field="name" header="Nombre del Período" sortable className="font-semibold text-gray-900" />
            <Column field="payrollGroup.name" header="Convenio Atado" sortable />
            <Column header="Alcance Geográfico" body={scopeBodyTemplate} />
            <Column field="type" header="Tipo de Cálculo" body={(r) => <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{getTypeBadge(r.type)}</span>} sortable />
            <Column field="startDate" header="Fechas" sortable body={(r) => <span className="text-sm text-gray-600">{new Date(r.startDate).toLocaleDateString('es-VE', {timeZone: 'UTC'})} - {new Date(r.endDate).toLocaleDateString('es-VE', {timeZone: 'UTC'})}</span>} />
            <Column field="status" header="Estado" body={(r) => <Tag value={getStatusName(r.status)} severity={getStatusSeverity(r.status)} />} sortable />
            <Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} />
          </DataTable>
        </div>

        <Dialog visible={showDialog} style={{ width: '550px' }} header="Aperturar Nuevo Período de Nómina" modal className="p-fluid" onHide={() => setShowDialog(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
            
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Descriptivo</label>
              <Controller name="name" control={control} render={({ field }) => (
                <InputText id={field.name} {...field} className={`w-full ${errors.name ? 'p-invalid' : ''}`} placeholder="Ej: 1era Quincena Marzo 2026" />
              )} />
              {errors.name && <small className="text-red-500 mt-1">{errors.name.message as string}</small>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Convenio Gremial</label>
                <Controller name="payrollGroupId" control={control} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={groups} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione grupo..." className={`w-full ${errors.payrollGroupId ? 'p-invalid' : ''}`} filter />
                )} />
                {errors.payrollGroupId && <small className="text-red-500 mt-1">{errors.payrollGroupId.message as string}</small>}
              </div>

              <div className="field">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Nómina</label>
                <Controller name="type" control={control} render={({ field }) => (
                  <Dropdown id={field.name} value={field.value} options={TYPE_OPTIONS} onChange={(e) => field.onChange(e.value)} className={`w-full ${errors.type ? 'p-invalid' : ''}`} />
                )} />
                {errors.type && <small className="text-red-500 mt-1">{errors.type.message as string}</small>}
              </div>

              <div className="field md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estatus del Empleado a Procesar</label>
                <Controller name="processStatuses" control={control} render={({ field }) => (
                  <MultiSelect id={field.name} value={field.value} options={[
                    { label: 'Activos', value: 'ACTIVE' },
                    { label: 'De Vacaciones', value: 'ON_VACATION' },
                    { label: 'Suspendidos', value: 'SUSPENDED' },
                    { label: 'Liquidados', value: 'LIQUIDATED' }
                  ]} onChange={(e) => field.onChange(e.value)} className={`w-full ${errors.processStatuses ? 'p-invalid' : ''}`} display="chip" />
                )} />
                {errors.processStatuses && <small className="text-red-500 mt-1">{errors.processStatuses.message as string}</small>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
               <div className="field">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Alcance: Centro de Costo (Opcional)</label>
                 <Controller name="costCenterId" control={control} render={({ field }) => (
                   <Dropdown id={field.name} value={field.value} options={costCenters} onChange={(e) => field.onChange(e.value === undefined ? null : e.value)} placeholder="Todos los Centros..." className="w-full" showClear filter />
                 )} />
               </div>
               <div className="field">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Alcance: Departamentos (Opcional)</label>
                 <Controller name="departmentIds" control={control} render={({ field }) => (
                   <MultiSelect id={field.name} value={field.value} options={departments} onChange={(e) => field.onChange(e.value)} placeholder="Todos los Departamentos..." className="w-full" display="chip" filter />
                 )} />
               </div>
            </div>

            {watchType === 'SPECIAL' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concepto Especial a Ejecutar (Multiselección)</label>
                  <Controller name="specialConceptIds" control={control} render={({ field }) => (
                    <MultiSelect id={field.name as string} value={field.value} options={concepts} onChange={(e) => field.onChange(e.value)} placeholder="Seleccione conceptos..." display="chip" className={`w-full ${errors.specialConceptIds ? 'p-invalid' : ''}`} filter />
                  )} />
                  {errors.specialConceptIds && <small className="text-red-500 mt-1">{errors.specialConceptIds.message as string}</small>}
                </div>

                <div className="field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importar Asistencias (Opcional)</label>
                  <Controller name="linkedAttendancePeriodIds" control={control} render={({ field }) => (
                    <MultiSelect id={field.name as string} value={field.value} options={periods.filter(p => p.type === 'REGULAR' || p.type === 'VACATION').map(p => ({ label: p.name, value: p.id }))} onChange={(e) => field.onChange(e.value)} placeholder="Vincular con nóminas origen..." display="chip" className="w-full" filter />
                  )} />
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-4">
               <h4 className="text-xs font-bold text-blue-900 uppercase mb-2"><i className="pi pi-calendar mr-2"></i>Límites Temporales (Fechas de Corte)</h4>
               <p className="text-xs text-blue-700 mb-3">Estas fechas determinarán la asistencia de los trabajadores y además fungirán como filtro para los conceptos históricos que dependan de la fecha (Ej. Utilidades).</p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="field">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Inicial (Desde)</label>
                    <Controller name="startDate" control={control} render={({ field }) => (
                      <Calendar id={field.name} value={field.value as any} onChange={(e) => field.onChange(e.value)} dateFormat="dd/mm/yy" className={`w-full ${errors.startDate ? 'p-invalid' : ''}`} showIcon />
                    )} />
                    {errors.startDate && <small className="text-red-500 mt-1">{errors.startDate.message as string}</small>}
                  </div>
                  <div className="field">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha Final (Hasta)</label>
                    <Controller name="endDate" control={control} render={({ field }) => (
                      <Calendar id={field.name} value={field.value as any} onChange={(e) => field.onChange(e.value)} dateFormat="dd/mm/yy" className={`w-full ${errors.endDate ? 'p-invalid' : ''}`} showIcon />
                    )} />
                    {errors.endDate && <small className="text-red-500 mt-1">{errors.endDate.message as string}</small>}
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button label="Cancelar" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text text-gray-600 hover:text-gray-900" type="button" />
              <Button label="Aperturar Nómina" icon="pi pi-check" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2 rounded-lg font-medium" />
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
