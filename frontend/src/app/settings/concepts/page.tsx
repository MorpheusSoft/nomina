'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Dropdown from '../../../components/ui/Dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import Dialog from '../../../components/ui/Dialog';
import ConceptSandboxDialog from '../../../components/payroll/ConceptSandboxDialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';
import AppLayout from "@/components/layout/AppLayout";

const conceptSchema = yup.object().shape({
  code: yup.string().required('Código requerido')
    .matches(/^[ADO]\d+$/, 'El código debe iniciar con A, D u O, seguido de solo números (Ej: A001, D012, O055)'),
  name: yup.string().required('Nombre requerido'),
  description: yup.string().nullable(),
  type: yup.string().required('Debe elegir un tipo de concepto'),
  accountingCode: yup.string().nullable(),
  accountingOperation: yup.string().nullable(),
  isSalaryIncidence: yup.boolean().default(false),
  isTaxable: yup.boolean().default(false),
  isAuxiliary: yup.boolean().default(false),
  formulaFactor: yup.string().nullable(),
  formulaRate: yup.string().nullable(),
  formulaAmount: yup.string().required('Al menos la fórmula de monto es obligatoria'),
  condition: yup.string().nullable(),
  executionSequence: yup.number().typeError('Secuencia numérica').required('Secuencia requerida').min(1),
  payrollGroupIds: yup.array().of(yup.string()).min(1, 'El concepto debe pertenecer a mínimo un Convenio').default([]),
  executionPeriodTypes: yup.array().of(yup.string()).min(1, 'Debe aplicar a mínimo un Tipo de Nómina').default(['REGULAR'])
});

const PERIOD_TYPE_OPTIONS = [
  { label: 'Ordinaria', value: 'REGULAR' },
  { label: 'Vacaciones', value: 'VACATION' },
  { label: 'Utilidades', value: 'BONUS' },
  { label: 'Especial', value: 'SPECIAL' },
  { label: 'Liquidación', value: 'LIQUIDATION' }
];

const TYPE_OPTIONS = [
  { label: 'Asignación (+)', value: 'EARNING' },
  { label: 'Deducción (-)', value: 'DEDUCTION' },
  { label: 'Aporte Patronal (Neutral)', value: 'EMPLOYER_CONTRIBUTION' }
];

const OP_OPTIONS = [
  { label: 'Debe (Débito)', value: 'DEBIT' },
  { label: 'Haber (Crédito)', value: 'CREDIT' }
];

const NATIVE_VARS = [
  { label: 'Sueldo Base (Vigente)', code: 'base_salary', color: 'indigo' },
  { label: 'Días Trabajados (Quincena/Semana)', code: 'worked_days', color: 'indigo' },
  { label: 'Días de Descanso', code: 'rest_days', color: 'indigo' },
  { label: 'Días Feriados', code: 'holidays', color: 'indigo' },
  { label: 'Feriados Trabajados', code: 'worked_holidays', color: 'indigo' },
  { label: 'Descansos Trabajados', code: 'worked_rest_days', color: 'indigo' },
  { label: 'Años de Antigüedad', code: 'seniority_years', color: 'indigo' },
  { label: 'Cant. Cargas Familiares', code: 'dependents_count', color: 'indigo' },
  { label: '¿Es Fin de Mes? (1 o 0)', code: 'es_fin_de_mes', color: 'teal' },
  { label: 'Días Lunes (Total Mes)', code: 'lunes_en_mes', color: 'teal' },
  { label: 'Días Lunes (En Periodo)', code: 'lunes_en_periodo', color: 'teal' },
  { label: 'Fórmula (Factor Actual)', code: 'factor', color: 'amber' },
  { label: 'Fórmula (Rata Actual)', code: 'rata', color: 'amber' },
  { label: 'Día de Ingreso (Contrato)', code: 'contract_start_day', color: 'blue' },
  { label: 'Mes de Ingreso (Contrato)', code: 'contract_start_month', color: 'blue' },
  { label: 'Año de Ingreso (Contrato)', code: 'contract_start_year', color: 'blue' },
  { label: 'Tipo de Contrato (\'Fijo\' u \'Ocasional\')', code: 'contract_type', color: 'blue' },
  { label: 'Acumulado Renta Bruta Acumulada para ISLR (Calculada en Vivo)', code: 'total_base_islr', color: 'fuchsia' },
  { label: 'Horas Ordinarias Diurnas', code: 'ordinary_day_hours', color: 'teal' },
  { label: 'Horas Ordinarias Nocturnas', code: 'ordinary_night_hours', color: 'teal' },
  { label: 'Horas Extras Diurnas Asistencia', code: 'extra_day_hours', color: 'teal' },
  { label: 'Horas Extras Nocturnas Asistencia', code: 'extra_night_hours', color: 'teal' },
  { label: 'Sábados Específicos Trabajados', code: 'saturdays_worked', color: 'teal' },
  { label: 'Domingos Específicos Trabajados', code: 'sundays_worked', color: 'teal' },
  { label: 'Duración del Turno Base de Horas (Fallback a Grupo de Nómina)', code: 'shift_base_hours', color: 'teal' },
  { label: 'Código del Tipo de Turno (\'DAY\', \'NIGHT\' o \'MIXED\')', code: 'shift_type', color: 'purple' },
  { label: 'Faltas Injustificadas', code: 'unjustified_absences', color: 'rose' },
  { label: 'Faltas Justificadas', code: 'justified_absences', color: 'emerald' },
  { label: 'Modo Asistencia (\'PHYSICAL\' o \'VIRTUAL\')', code: 'attendance_mode', color: 'indigo' }
];

const FORMULA_FUNCTIONS = [
  { label: 'Redondeo Comercial', code: 'round(valor, decimales)', example: 'round(base_salary / 30, 2)' },
  { label: 'Mínimo de montos', code: 'min(v1, v2)', example: 'min(bono, 100)' },
  { label: 'Máximo (Evita negativos)', code: 'max(v1, v2)', example: 'max(0, pago - deduc)' },
  { label: 'Condicional (Si... Entonces)', code: 'condicion ? siVerdad : siFalso', example: 'dias > 15 ? 100 : 0' },
  { label: 'Módulo o Resto (Par/Impar)', code: 'mod(v1, v2)', example: 'mod(mes_contrato, 2)' },
  { label: 'Valor Absoluto (Positivo)', code: 'abs(valor)', example: 'abs(-150)' }
];

export default function ConceptsPage() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [globalVars, setGlobalVars] = useState<any[]>([]);
  const [payrollGroupVars, setPayrollGroupVars] = useState<any[]>([]);
  const [costCenterVars, setCostCenterVars] = useState<any[]>([]);
  const [payrollGroups, setPayrollGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dictionarySearch, setDictionarySearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOracleAccess, setHasOracleAccess] = useState(false);
  const [childConcepts, setChildConcepts] = useState<any[]>([]);
  const [newChildId, setNewChildId] = useState<string | null>(null);
  const [newChildSeq, setNewChildSeq] = useState<number>(10);
  const [oracleDialog, setOracleDialog] = useState(false);
  const [oraclePrompt, setOraclePrompt] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(conceptSchema) as any,
    defaultValues: {
      id: undefined as string | undefined,
      code: '', name: '', description: '', type: 'EARNING',
      accountingCode: '', accountingOperation: 'DEBIT',
      isSalaryIncidence: false, isTaxable: false, isAuxiliary: false,
      formulaFactor: '', formulaRate: '', formulaAmount: '', condition: '',
      executionSequence: 10,
      payrollGroupIds: [],
      executionPeriodTypes: ['REGULAR']
    }
  });

  const isAuxVal = watch('isAuxiliary');
  const currentSequence = watch('executionSequence') || 0;
  
  // Filtrar conceptos previos para encadenamiento
  const previousConcepts = concepts.filter(c => c.executionSequence < currentSequence);

  const fetchConcepts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/concepts');
      setConcepts(res.data);
    } catch (error) {
      console.error('Error fetching concepts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalVars = async () => {
    try {
      const res = await api.get('/global-variables');
      setGlobalVars(res.data);
    } catch (error) {
      console.error('Error fetching global vars:', error);
    }
  };

  const fetchPayrollGroups = async () => {
    try {
      const res = await api.get('/payroll-groups');
      setPayrollGroups(res.data.map((g: any) => ({ label: g.name, value: g.id })));
    } catch (e) {
      console.error('Error fetching payroll groups:', e);
    }
  };

  const fetchPayrollGroupVars = async () => {
    try {
      const res = await api.get('/payroll-group-variables');
      setPayrollGroupVars(res.data);
    } catch (error) {
      console.error('Error fetching payroll group vars:', error);
    }
  };

  const fetchCostCenterVars = async () => {
    try {
      const res = await api.get('/cost-centers/variables/all');
      setCostCenterVars(res.data);
    } catch (error) {
      console.error('Error fetching cost center vars:', error);
    }
  };

  useEffect(() => {
    fetchConcepts();
    fetchGlobalVars();
    fetchPayrollGroups();
    fetchPayrollGroupVars();
    fetchCostCenterVars();
    api.get('/tenants/my-status').then(res => setHasOracleAccess(res.data?.hasOracleAccess || false)).catch(console.error);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.current?.show({ severity: 'success', summary: 'Variable Copiada', detail: `El sistema guardó '${text}' en tu portapapeles. ¡Pégala (Ctrl+V) en la fórmula!`, life: 3000 });
  };

  const openNew = () => {
    // Generate a default Sequence by bumping the max sequence found by 10
    const maxSeq = concepts.length > 0 ? Math.max(...concepts.map(c => c.executionSequence)) : 0;
    reset({
      id: undefined,
      code: '', name: '', description: '', type: 'EARNING',
      accountingCode: '', accountingOperation: 'DEBIT',
      isSalaryIncidence: false, isTaxable: false, isAuxiliary: false,
      formulaFactor: '', formulaRate: '', formulaAmount: '', condition: '',
      executionSequence: maxSeq + 10,
      payrollGroupIds: [],
      executionPeriodTypes: ['REGULAR']
    });
    setShowDialog(true);
  };

  const duplicateConcept = (rowData: any) => {
    const pgIds = rowData.payrollGroupConcepts ? rowData.payrollGroupConcepts.map((pgc: any) => pgc.payrollGroupId) : [];
    
    const maxSeq = concepts.length > 0 ? Math.max(...concepts.map(c => c.executionSequence)) : 0;
    
    reset({ 
      ...rowData, 
      id: undefined, 
      code: `${rowData.code}_COPIA`, 
      name: `${rowData.name} (Copia)`,
      executionSequence: maxSeq + 10,
      payrollGroupIds: pgIds,
      executionPeriodTypes: rowData.executionPeriodTypes || ['REGULAR']
    }); 
    
    setChildConcepts([]); // Dependencias de árbol hijas no se copian automáticamente por seguridad
    setShowDialog(true);
    toast.current?.show({ severity: 'info', summary: 'Clonado en Memoria', detail: 'Concepto duplicado. Cambia el código y guarda para confirmar.', life: 4000 });
  };

  const hideDialog = () => {
    setShowDialog(false);
    setChildConcepts([]);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (data.id) {
        await api.patch(`/concepts/${data.id}`, data);
      } else {
        await api.post('/concepts', data);
      }
      setShowDialog(false);
      fetchConcepts();
    } catch (error: any) {
      console.error('Error saving concept:', error);
      const msg = error.response?.data?.message || 'Error al guardar el Concepto Salarial';
      toast.current?.show({ severity: 'error', summary: 'Error de Validación', detail: msg, life: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteConcept = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este concepto maestro? Puede romper nóminas futuras ligadas a él.')) {
      try {
        await api.delete(`/concepts/${id}`);
        fetchConcepts();
      } catch (error: any) {
        console.error('Error deleting:', error);
        if (error.response?.status === 409) {
          alert('Este concepto ya está ligado a cálculos de nómina o trabajadores. ¡No puedes borrar del mapa un registro contable usado! Por favor edítalo y retíralo del Convenio correspondiente.');
        } else {
          alert('Fallo al intentar eliminar el concepto.');
        }
      }
    }
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-copy" rounded outlined severity="success" aria-label="Duplicate" title="Clonar Concepto" onClick={() => duplicateConcept(rowData)} />
        <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" title="Editar Concepto" onClick={async () => {
           const pgIds = rowData.payrollGroupConcepts ? rowData.payrollGroupConcepts.map((pgc: any) => pgc.payrollGroupId) : [];
           reset({ ...rowData, payrollGroupIds: pgIds }); 
           
           try {
             const depsRes = await api.get(`/concept-dependencies?parentConceptId=${rowData.id}`);
             setChildConcepts(depsRes.data);
           } catch(e) { console.error(e); }

           setShowDialog(true); 
        }} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" onClick={() => deleteConcept(rowData.id)} />
      </div>
    );
  };

  const importFromRoot = async () => {
    if (window.confirm('¿Deseas intentar clonar todos los conceptos ausentes desde la Sede Central ROOT?')) {
      try {
        const res = await api.post('/concepts/import-from-root');
        toast.current?.show({ severity: 'success', summary: 'Importación Exitosa', detail: `Se importaron ${res.data.importedCount} conceptos nuevos desde la matriz.`, life: 4000 });
        fetchConcepts();
      } catch (err: any) {
        toast.current?.show({ severity: 'error', summary: 'Error al importar', detail: err.response?.data?.message || 'Error desconocido.', life: 4000 });
      }
    }
  };

  const handleAskOracle = async () => {
    if (!oraclePrompt.trim()) return;
    
    // Add User Message to History UI
    const newUserMessage = { role: 'user', content: oraclePrompt };
    setChatHistory(prev => [...prev, newUserMessage]);
    const currentPrompt = oraclePrompt;
    setOraclePrompt('');

    try {
       setIsOracleLoading(true);

       // Empaquetar contexto dinámico para la IA
       const payloadContext = {
         globalVars: globalVars.map(v => ({ code: v.code, description: v.description, value: v.numericalValue })),
         payrollGroupVars: payrollGroupVars.map(v => ({ code: v.code, description: v.description, value: v.numericalValue })),
         costCenterVars: costCenterVars.map(v => ({ code: v.code, name: v.name, value: v.value })),
         existingConcepts: concepts.map(c => ({ code: c.code, name: c.name })),
         payrollGroups: payrollGroups.map(g => ({ id: g.value, name: g.label }))
       };

       const res = await api.post('/oracle/generate-concept', { 
         prompt: currentPrompt,
         context: payloadContext,
         history: chatHistory
       });
       
       const aiResponse = res.data;
       const newModelMessage = { role: 'model', content: aiResponse.message, draft: aiResponse.conceptDraft };
       setChatHistory(prev => [...prev, newModelMessage]);
       
    } catch(err: any) {
        toast.current?.show({ severity: 'error', summary: 'Error del Oráculo', detail: err.response?.data?.message || 'Tu empresa no cuenta con este módulo premium o hubo un fallo de conexión.', life: 5000 });
        // Rollback last user message on error
        setChatHistory(prev => prev.slice(0, -1));
        setOraclePrompt(currentPrompt);
    } finally {
       setIsOracleLoading(false);
    }
  };

  const applyDraft = (aiForm: any) => {
       const formValues = watch();
       if (aiForm.executionPeriodTypes) formValues.executionPeriodTypes = aiForm.executionPeriodTypes;
       if (aiForm.payrollGroupIds) formValues.payrollGroupIds = aiForm.payrollGroupIds;
       reset({
         ...formValues,
         name: aiForm.name || formValues.name,
         type: aiForm.type || formValues.type,
         formulaFactor: aiForm.formulaFactor || formValues.formulaFactor,
         formulaRate: aiForm.formulaRate || formValues.formulaRate,
         formulaAmount: aiForm.formulaAmount || formValues.formulaAmount,
         condition: aiForm.condition || formValues.condition,
         isTaxable: aiForm.isTaxable !== undefined ? aiForm.isTaxable : formValues.isTaxable,
         isSalaryIncidence: aiForm.isSalaryIncidence !== undefined ? aiForm.isSalaryIncidence : formValues.isSalaryIncidence
       });
       
       setOracleDialog(false);
       setShowDialog(true);
       toast.current?.show({ severity: 'success', summary: 'Oráculo IA', detail: 'Fórmula algorítmica inyectada en el formulario.', life: 4000 });
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar conceptos..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <div className="flex gap-2">
        {hasOracleAccess && (
          <Button label="Oráculo IA" icon="pi pi-sparkles" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors shadow-md" onClick={() => setOracleDialog(true)} />
        )}
        <Button label="Probar Fórmulas" icon="pi pi-bolt" className="bg-sky-600 hover:bg-sky-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={() => setShowSandbox(true)} />
        <Button label="Nuevo Concepto" icon="pi pi-plus" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-colors" onClick={openNew} />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
      <Toast ref={toast} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catálogo de Conceptos Salariales</h1>
        <p className="mt-2 text-sm text-gray-500">Diseñador principal del Motor de Fórmulas. Configura bonificaciones, deducciones y variables ocultas.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable value={concepts} paginator rows={15} loading={loading} globalFilter={globalFilter} header={header} 
          emptyMessage="No se encontraron conceptos algorítmicos."
          className="p-datatable-sm"
          rowHover>
          <Column field="executionSequence" header="Secuencia" sortable className="text-gray-500 font-mono w-24" />
          <Column field="code" header="Cod. Sistema" sortable className="font-mono text-xs text-indigo-600 font-semibold" />
          <Column field="name" header="Nombre Descripción" sortable className="font-medium text-gray-900" />
          <Column field="type" header="Acción" sortable body={(row) => (
             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.type === 'EARNING' ? 'bg-emerald-100 text-emerald-700' : row.type === 'DEDUCTION' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                {row.type === 'EARNING' ? 'Asignación' : row.type === 'DEDUCTION' ? 'Deducción' : 'Aporte Patronal'}
             </span>
          )} />
          <Column header="Aplica a Convenios" body={(row) => (
             <div className="flex flex-wrap gap-1">
                {row.payrollGroupConcepts?.map((pgc: any) => (
                   <span key={pgc.payrollGroupId} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] rounded uppercase font-bold tracking-wider">{pgc.payrollGroup?.name}</span>
                )) || <span className="text-gray-300">-</span>}
             </div>
          )} />
          <Column header="Incidencia Salarial" body={(row) => row.isSalaryIncidence ? <i className="pi pi-check-circle text-emerald-500"></i> : <i className="pi pi-minus text-gray-300"></i>} align="center" />
          <Column header="Aux (Variable Oculta)" body={(row) => row.isAuxiliary ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">Sí</span> : <span className="text-gray-300">-</span>} align="center" />
          <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem' }} />
        </DataTable>
      </div>

      <ConceptSandboxDialog visible={showSandbox} onHide={() => setShowSandbox(false)} />

      <Dialog visible={showDialog} style={{ width: '1200px' }} header="Diseñador de Concepto / Fórmula" modal className="p-fluid" onHide={hideDialog}>
        <div className="flex flex-col lg:flex-row gap-6 pt-2">
          
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-w-0">
          
          {/* Oracle Button inside Edit */}
          {hasOracleAccess && (
             <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm">
                <div>
                   <h4 className="text-indigo-900 font-bold m-0 flex items-center gap-2"><i className="pi pi-sparkles"></i> Asistente de Creación IA</h4>
                   <p className="text-indigo-700 text-sm m-0">Deja que el Oráculo diseñe la matemática del concepto por ti.</p>
                </div>
                <Button type="button" label="Consultar al Oráculo" icon="pi pi-bolt" className="p-button-sm bg-indigo-600 border-none shadow-md hover:bg-indigo-700" onClick={() => setOracleDialog(true)} />
             </div>
          )}

          <TabView className="flex-1">
            <TabPanel header="Datos Generales" leftIcon="pi pi-file-edit">
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="field">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Corto</label>
              <Controller name="name" control={control} render={({ field }) => (
                <InputText id={field.name} {...field} className={`w-full ${errors.name ? 'p-invalid' : ''}`} placeholder="Ej: Bono Nocturno" />
              )} />
              {errors.name && <small className="text-red-500 mt-1">{errors.name.message}</small>}
            </div>
            <div className="field">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Código del Sistema</label>
              <Controller name="code" control={control} render={({ field }) => (
                <InputText id={field.name} {...field} disabled={!!watch('id')} className={`w-full ${errors.code ? 'p-invalid' : ''} font-mono ${watch('id') ? 'bg-gray-100' : ''}`} placeholder="Ej: A001" onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/[^ADO0-9]/g, ''))}/>
              )} />
              {errors.code && <small className="text-red-500 mt-1">{errors.code.message}</small>}
            </div>
            <div className="field">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Movimiento</label>
              <Controller name="type" control={control} render={({ field }) => (
                <Dropdown id={field.name} value={field.value} options={TYPE_OPTIONS} onChange={(e) => field.onChange(e.value)} className="w-full" />
              )} />
            </div>
            <div className="field col-span-1 md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Aplica A Convenios (Grupos de Nómina) <span className="text-red-500">*</span></label>
              <Controller name="payrollGroupIds" control={control} render={({ field }) => (
                <MultiSelect id={field.name} value={field.value} options={payrollGroups} onChange={(e) => field.onChange(e.value)} display="chip" placeholder="Selecciona convenios" className={`w-full ${errors.payrollGroupIds ? 'p-invalid' : ''}`} />
              )} />
              {errors.payrollGroupIds && <small className="text-red-500 mt-1">{errors.payrollGroupIds.message}</small>}
            </div>
            <div className="field col-span-1 md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Aplica en Tipos de Nómina <span className="text-red-500">*</span></label>
              <Controller name="executionPeriodTypes" control={control} render={({ field }) => (
                <MultiSelect id={field.name} value={field.value} options={PERIOD_TYPE_OPTIONS} onChange={(e) => field.onChange(e.value)} display="chip" placeholder="Seleccione nóminas aplicables" className={`w-full ${errors.executionPeriodTypes ? 'p-invalid' : ''}`} />
              )} />
              {errors.executionPeriodTypes && <small className="text-red-500 mt-1">{errors.executionPeriodTypes.message}</small>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Comportamiento e Incidencias</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <Controller name="isSalaryIncidence" control={control} render={({ field }) => (
                    <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} />
                  )} />
                  <label htmlFor="isSalaryIncidence" className="ml-2 text-sm text-gray-700 cursor-pointer">Bonificable (Tiene Incidencia Salarial)</label>
                </div>
                <div className="flex items-center">
                  <Controller name="isTaxable" control={control} render={({ field }) => (
                    <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} />
                  )} />
                  <label htmlFor="isTaxable" className="ml-2 text-sm text-gray-700 cursor-pointer">Sujeto a ISLR (Impuesto sobre la Renta)</label>
                </div>
                <div className="flex items-center mt-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <Controller name="isAuxiliary" control={control} render={({ field }) => (
                    <Checkbox inputId={field.name} onChange={(e) => field.onChange(e.checked)} checked={field.value} />
                  )} />
                  <div className="ml-2">
                    <label htmlFor="isAuxiliary" className="text-sm font-semibold text-indigo-900 cursor-pointer block">Variable Oculta (Auxiliar)</label>
                    <span className="text-xs text-indigo-600">Si se marca, el resultado no sale en el recibo, se usa para pre-calcular algo para el siguiente concepto.</span>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mt-6">Flujo y Control de Ejecución</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="field col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Condicional (Ej: seniority_years &gt; 1)</label>
                  <Controller name="condition" control={control} render={({ field }) => (
                    <InputText id={field.name} {...field} value={field.value || ''} className="w-full font-mono text-xs" />
                  )} />
                </div>
                <div className="field">
                  <label className="block text-xs font-bold text-rose-600 mb-1">Nº Secuencia</label>
                  <Controller name="executionSequence" control={control} render={({ field }) => (
                    <InputText id={field.name} {...field} value={field.value?.toString() || ''} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} type="number" className={`w-full text-center ${errors.executionSequence ? 'p-invalid' : ''}`} />
                  )} />
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">El Motor Algebraico Automático</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="field">
                  <label className="block text-xs font-bold text-emerald-700 mb-1">Fórmula (Factor)</label>
                  <Controller name="formulaFactor" control={control} render={({ field }) => (
                    <InputTextarea id={field.name} {...field} value={field.value || ''} rows={2} className="w-full font-mono text-sm border-emerald-200 focus:border-emerald-500" placeholder="Ej: (worked_days + rest_days)" />
                  )} />
                </div>
                <div className="field">
                  <label className="block text-xs font-bold text-amber-600 mb-1">Fórmula (Rata)</label>
                  <Controller name="formulaRate" control={control} render={({ field }) => (
                    <InputTextarea id={field.name} {...field} value={field.value || ''} rows={2} className="w-full font-mono text-sm border-amber-200 focus:border-amber-500" placeholder="Ej: base_salary / 30" />
                  )} />
                </div>
              </div>

              <div className="field">
                <label className="block text-xs font-bold text-indigo-700 mb-1">Fórmula (Monto Final de Respaldo) *</label>
                <Controller name="formulaAmount" control={control} render={({ field }) => (
                  <InputTextarea id={field.name} {...field} value={field.value || ''} rows={2} className={`w-full font-mono text-sm border-indigo-200 focus:border-indigo-500 ${errors.formulaAmount ? 'p-invalid' : ''}`} placeholder="Obligatorio. Ej: (base_salary / 30) * worked_days" />
                )} />
                {errors.formulaAmount && <small className="text-red-500 mt-1">{errors.formulaAmount.message}</small>}
              </div>

              </div>
              </div>
              </div>
            </TabPanel>

            <TabPanel header="Sub-Conceptos (Árbol)" leftIcon="pi pi-sitemap" disabled={!watch('id')}>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-blue-800 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100"><i className="pi pi-info-circle mr-2"></i>Si este Concepto es un Nodo Raíz (Ej: "Nómina Regular"), anexe aquí los conceptos hijos que deben calcularse de forma subordinada y en qué orden lógico.</p>
                <div className="flex gap-2 items-end mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Concepto Hijo a Invocar</label>
                    <Dropdown value={newChildId} options={concepts.filter(c => c.id !== watch('id')).map(c => ({ label: `${c.code} - ${c.name}`, value: c.id }))} onChange={(e) => setNewChildId(e.value)} placeholder="Seleccione sub-concepto" className="w-full text-sm" filter />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Orden (Nº)</label>
                    <InputText type="number" value={newChildSeq.toString()} onChange={(e) => setNewChildSeq(parseInt(e.target.value) || 0)} className="w-full text-center" />
                  </div>
                  <Button type="button" icon="pi pi-plus" label="Enlazar" className="p-button-success" onClick={async () => {
                     if(!newChildId) return;
                     try {
                       await api.post('/concept-dependencies', { parentConceptId: watch('id'), childConceptId: newChildId, executionSequence: newChildSeq });
                       const depsRes = await api.get(`/concept-dependencies?parentConceptId=${watch('id')}`);
                       setChildConcepts(depsRes.data);
                       setNewChildId(null);
                     } catch(e) { console.error(e); }
                  }} />
                </div>
                
                {childConcepts.length > 0 && (
                  <DataTable value={childConcepts} className="p-datatable-sm" size="small">
                    <Column field="executionSequence" header="Nº" style={{ width: '4rem' }} />
                    <Column field="childConcept.code" header="Cod. Sistema" style={{ width: '30%' }} className="font-mono text-xs" />
                    <Column field="childConcept.name" header="Nombre del Sub-Concepto" />
                    <Column body={(rowData) => (
                      <Button type="button" icon="pi pi-trash" rounded outlined severity="danger" style={{ width: '2rem', height: '2rem' }} onClick={async () => {
                         try {
                           await api.delete(`/concept-dependencies/${rowData.id}`);
                           setChildConcepts(childConcepts.filter(c => c.id !== rowData.id));
                         } catch(e) { console.error(e); }
                      }} />
                    )} style={{ width: '4rem', textAlign: 'center' }} />
                  </DataTable>
                )}
              </div>
            </TabPanel>

            <TabPanel header="Contabilidad" leftIcon="pi pi-book">
              <div className="space-y-4 mt-4">
               {!isAuxVal ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 border-b pb-4 mb-6">Enrutamiento Contable del Concepto</h3>
                  <p className="text-xs text-gray-500 mb-6">Define a qué cuenta del libro mayor de tu empresa afectará el total monetario resultante de este concepto, para generar la nómina contable (póliza) de forma automática.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="field">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cuenta Mayor (Código)</label>
                      <Controller name="accountingCode" control={control} render={({ field }) => (
                        <InputText id={field.name} {...field} className="w-full text-base font-mono p-3 border-gray-300 focus:border-indigo-500 rounded-md" placeholder="Ej: 5.1.1.001" />
                      )} />
                    </div>
                    <div className="field">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Afectación en Póliza</label>
                      <Controller name="accountingOperation" control={control} render={({ field }) => (
                        <Dropdown id={field.name} value={field.value} options={OP_OPTIONS} onChange={(e) => field.onChange(e.value)} className="w-full text-base p-1 border-gray-300" />
                      )} />
                    </div>
                  </div>
                </div>
               ) : (
                 <div className="text-center p-8 bg-purple-50 rounded-lg border border-purple-100">
                    <i className="pi pi-directions-alt text-4xl text-purple-300 mb-4"></i>
                    <h4 className="text-purple-900 font-bold mb-2">Concepto Oculto (Auxiliar)</h4>
                    <p className="text-sm text-purple-700">Este concepto está marcado como auxiliar en la pestaña de Datos Generales. Dado que sus montos no se emiten fiscalmente en los recibos, no genera asientos contables en el libro mayor.</p>
                 </div>
               )}
              </div>
            </TabPanel>
          </TabView>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 px-4">
            <Button label="Cancelar" icon="pi pi-times" onClick={hideDialog} className="p-button-text text-gray-600 hover:text-gray-900" type="button" />
            <Button label="Guardar Concepto" icon="pi pi-save" type="submit" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 py-2 rounded-lg font-medium" />
          </div>
        </form>

        {/* MAGIC FORMULA DICTIONARY SIDE-PANEL */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-y-auto max-h-[80vh] shadow-inner">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
              <i className="pi pi-book text-indigo-600 text-xl"></i>
              <h3 className="font-bold text-slate-800 m-0">Diccionario Mágico</h3>
            </div>
            <div className="relative w-full">
              <i className="pi pi-search absolute left-3 top-[50%] -translate-y-[50%] text-slate-400 z-10 text-sm"></i>
              <InputText 
                type="search" 
                value={dictionarySearch}
                onInput={(e) => setDictionarySearch(e.currentTarget.value)} 
                placeholder="Buscar variable..." 
                className="w-full border-slate-200 focus:border-indigo-400 rounded-lg text-sm bg-white" 
                style={{ paddingLeft: '2.2rem' }} 
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Presiona cualquier código para <b>copiarlo</b> y pegarlo directamente en tus fórmulas matemáticas.
          </p>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3">🛠️ Funciones Matemáticas</h4>
            <ul className="space-y-3 m-0 p-0 list-none">
              {FORMULA_FUNCTIONS.filter(f => 
                 !dictionarySearch || f.label.toLowerCase().includes(dictionarySearch.toLowerCase()) || f.code.toLowerCase().includes(dictionarySearch.toLowerCase())
              ).map((f, idx) => (
                <li key={`fn-${idx}`} className="flex flex-col gap-1 p-2 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-bold text-sky-800">{f.label}</span>
                  <span onClick={() => copyToClipboard(f.code)} className="text-xs bg-white text-slate-800 font-mono px-2 py-1 rounded cursor-pointer hover:bg-sky-50 transition-colors border border-slate-200 w-max" title="Click para copiar plantilla">{f.code}</span>
                  <span className="text-[10px] text-slate-500 italic mt-0.5">Ej: {f.example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Variables Nativas</h4>
            <ul className="space-y-3 m-0 p-0 list-none">
              {NATIVE_VARS.filter(v => 
                 !dictionarySearch || v.label.toLowerCase().includes(dictionarySearch.toLowerCase()) || v.code.toLowerCase().includes(dictionarySearch.toLowerCase())
              ).map((v, idx) => (
                <li key={idx} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-700">{v.label}</span>
                  <span onClick={() => copyToClipboard(v.code)} className={`text-xs bg-${v.color}-100 text-${v.color}-700 font-mono px-2 py-1 rounded inline-block w-max cursor-pointer hover:bg-${v.color}-200 transition-colors border border-${v.color}-200`} title="Click para copiar">{v.code}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tus Variables Globales</h4>
            {globalVars.length === 0 ? (
               <p className="text-xs text-slate-400 italic">No tienes variables creadas en Configuración.</p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none">
                {globalVars.filter(gv => 
                  !dictionarySearch || gv.name.toLowerCase().includes(dictionarySearch.toLowerCase()) || gv.code.toLowerCase().includes(dictionarySearch.toLowerCase())
                ).map(gv => (
                  <li key={gv.id} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">{gv.name} <span className="text-[10px] text-emerald-600 font-bold ml-1"> ${Number(gv.value || 0).toFixed(2)}</span></span>
                    <span onClick={() => copyToClipboard(gv.code)} className="text-xs bg-emerald-50 text-emerald-700 font-mono px-2 py-1 rounded inline-block w-max cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200" title="Click para copiar">{gv.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Variables de Convenio</h4>
            {payrollGroupVars.length === 0 ? (
               <p className="text-xs text-slate-400 italic">No tienes variables de convenio.</p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none">
                {payrollGroupVars.filter(gv => 
                  !dictionarySearch || gv.name.toLowerCase().includes(dictionarySearch.toLowerCase()) || gv.code.toLowerCase().includes(dictionarySearch.toLowerCase())
                ).map(gv => (
                  <li key={gv.id} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">{gv.name}</span>
                    <span onClick={() => copyToClipboard(gv.code)} className="text-xs bg-indigo-50 text-indigo-700 font-mono px-2 py-1 rounded inline-block w-max cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200" title="Click para copiar">{gv.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Variables Geográficas (C.C.)</h4>
            {costCenterVars.length === 0 ? (
               <p className="text-xs text-slate-400 italic">No tienes variables locacionales.</p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none">
                {costCenterVars.filter(cv => 
                  !dictionarySearch || cv.name.toLowerCase().includes(dictionarySearch.toLowerCase()) || cv.code.toLowerCase().includes(dictionarySearch.toLowerCase())
                ).map(cv => (
                  <li key={cv.id} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">{cv.name} <span className="text-[10px] text-fuchsia-600 font-bold ml-1" title={`Ejemplo referencial de ${cv.costCenterName}`}>Ej: ${Number(cv.value || 0).toFixed(2)}</span></span>
                    <span onClick={() => copyToClipboard(cv.code)} className="text-xs bg-fuchsia-50 text-fuchsia-700 font-mono px-2 py-1 rounded inline-block w-max cursor-pointer hover:bg-fuchsia-100 transition-colors border border-fuchsia-200" title="Click para copiar">{cv.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3" title="Conceptos con Secuencia menor a la actual">Calculados Previos</h4>
            {previousConcepts.length === 0 ? (
               <p className="text-xs text-slate-400 italic">No hay previos configurados.</p>
            ) : (
              <ul className="space-y-4 m-0 p-0 list-none">
                {previousConcepts.filter(pc => 
                  !dictionarySearch || pc.name.toLowerCase().includes(dictionarySearch.toLowerCase()) || pc.code.toLowerCase().includes(dictionarySearch.toLowerCase()) || (pc.description && pc.description.toLowerCase().includes(dictionarySearch.toLowerCase()))
                ).map(pc => (
                  <li key={pc.id} className="flex flex-col gap-2 p-2 bg-white rounded border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-indigo-900 border-b border-slate-100 pb-1">{pc.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">Sec: {pc.executionSequence}</span></span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span onClick={() => copyToClipboard(`fact_${pc.code}`)} className="text-[10px] bg-sky-50 text-sky-700 font-mono px-1.5 py-0.5 rounded cursor-pointer hover:bg-sky-100 border border-sky-100" title="Copiar Factor de este Concepto">fact_{pc.code}</span>
                      <span onClick={() => copyToClipboard(`rata_${pc.code}`)} className="text-[10px] bg-sky-50 text-sky-700 font-mono px-1.5 py-0.5 rounded cursor-pointer hover:bg-sky-100 border border-sky-100" title="Copiar Rata de este Concepto">rata_{pc.code}</span>
                      <span onClick={() => copyToClipboard(`monto_${pc.code}`)} className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-100 border border-indigo-100 font-bold shadow-sm" title="Copiar Monto Final de este Concepto">monto_{pc.code}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
        </div>
      </Dialog>

      {/* Oráculo Dialog */}
      <Dialog visible={oracleDialog} style={{ width: '600px', height: '80vh' }} modal onHide={() => { setOracleDialog(false); setOraclePrompt(''); setChatHistory([]); }} headerClassName="bg-indigo-900 text-white p-4" className="rounded-2xl overflow-hidden flex flex-col" contentClassName="p-0 flex flex-col overflow-hidden h-full" header={
        <div className="flex items-center gap-3">
           <i className="pi pi-sparkles text-2xl text-amber-300"></i>
           <div className="flex flex-col">
             <span className="font-extrabold text-lg">El Oráculo de Nebula</span>
             <span className="text-xs text-indigo-200 font-medium">Asistente de Inteligencia Artificial Matemática</span>
           </div>
        </div>
      }>
         <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Historial de Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 mt-10">
                   <i className="pi pi-comments text-5xl mb-3 opacity-50"></i>
                   <p className="text-sm px-8 leading-relaxed">
                     Describe en lenguaje natural qué tipo de asignación o deducción quieres crear. El Oráculo sugerirá la fórmula matemática e interactuará contigo.
                   </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                     <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                     {msg.draft && msg.draft.formulaAmount && (
                       <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2 text-emerald-800">
                               <i className="pi pi-check-circle"></i>
                               <span className="font-bold text-xs uppercase tracking-wider">Concepto Listo</span>
                             </div>
                             {msg.draft.type === 'EARNING' ? <span className="text-[10px] font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded">PAGO</span> : <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded">DESC</span>}
                          </div>
                          {msg.draft.formulaFactor && (
                            <div className="mb-2">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Fórmula Factor:</span>
                              <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-100 text-emerald-900 break-all">
                                 {msg.draft.formulaFactor}
                              </div>
                            </div>
                          )}
                          {msg.draft.formulaRate && (
                            <div className="mb-2">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Fórmula Rata:</span>
                              <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-100 text-emerald-900 break-all">
                                 {msg.draft.formulaRate}
                              </div>
                            </div>
                          )}
                          <div className="mb-3">
                             <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Monto Final:</span>
                             <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-100 text-emerald-900 break-all">
                                {msg.draft.formulaAmount}
                             </div>
                          </div>
                          <Button label="Aplicar al Formulario" icon="pi pi-download" className="w-full text-xs p-2 bg-emerald-600 hover:bg-emerald-700 border-none" onClick={() => applyDraft(msg.draft)} />
                       </div>
                     )}
                  </div>
                </div>
              ))}
              {isOracleLoading && (
                <div className="flex justify-start">
                   <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm text-slate-400 text-sm flex items-center gap-2">
                     <i className="pi pi-spin pi-spinner"></i>
                     <span>Analizando variables...</span>
                   </div>
                </div>
              )}
            </div>
            
            {/* Input Inferior */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
               <div className="flex gap-2">
                 <InputTextarea 
                   value={oraclePrompt} 
                   onChange={(e) => setOraclePrompt(e.target.value)} 
                   rows={2} 
                   autoResize
                   className="flex-1 text-sm p-3 bg-slate-50 border-slate-300 focus:border-indigo-500 rounded-xl" 
                   placeholder="Escribe tu requerimiento (ej. Bono sujeto a ISLR de $50)..."
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleAskOracle();
                     }
                   }}
                 />
                 <Button 
                   icon={isOracleLoading ? "pi pi-spin pi-spinner" : "pi pi-send"} 
                   onClick={handleAskOracle} 
                   disabled={isOracleLoading || !oraclePrompt.trim()} 
                   className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl w-12 h-12 flex-shrink-0 flex items-center justify-center p-0"
                 />
               </div>
            </div>
         </div>
      </Dialog>
      
      </div>
    </AppLayout>
  );
}
