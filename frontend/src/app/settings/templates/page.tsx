"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/AppLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';

// Dynamic import of Editor to avoid SSR issues with Quill
const Editor = dynamic(() => import('primereact/editor').then((mod) => mod.Editor), { ssr: false });

const schema = yup.object({
  name: yup.string().required('El nombre de la plantilla es requerido'),
  type: yup.string().required('Seleccione un tipo de documento'),
  isSelfService: yup.boolean().default(false),
  contentHtml: yup.string().required('El contenido del documento no puede estar vacío').min(15, 'Escriba algo de texto en la plantilla')
});

const typeOptions = [
  { label: 'Contrato de Trabajo', value: 'CONTRACT' },
  { label: 'Carta de Trabajo', value: 'WORK_LETTER' },
  { label: 'Liquidación / Finiquito', value: 'LIQUIDATION' },
  { label: 'Otro Documento', value: 'OTHER' }
];

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  const toast = useRef<Toast>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      type: 'WORK_LETTER',
      isSelfService: false,
      contentHtml: ''
    }
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/document-templates');
      setTemplates(res.data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las plantillas' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openNew = () => {
    setEditingTemplate(null);
    reset({ name: '', type: 'WORK_LETTER', isSelfService: false, contentHtml: '' });
    setDialogVisible(true);
  };

  const editTemplate = (t: any) => {
    setEditingTemplate(t);
    setValue('name', t.name);
    setValue('type', t.type);
    setValue('isSelfService', t.isSelfService || false);
    setValue('contentHtml', t.contentHtml);
    setDialogVisible(true);
  };

  const deleteTemplate = async (t: any) => {
    if (window.confirm('¿Seguro de borrar esta plantilla documental?')) {
      try {
        await api.delete(`/document-templates/${t.id}`);
        fetchTemplates();
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla eliminada' });
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingTemplate) {
        await api.patch(`/document-templates/${editingTemplate.id}`, data);
      } else {
        await api.post('/document-templates', data);
      }
      setDialogVisible(false);
      fetchTemplates();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla guardada correctamente' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al procesar la solicitud' });
    }
  };

  // Helper dictionary to insert tags
  const tags = [
    { label: 'Nombres', value: '{{trabajador.nombres}}' },
    { label: 'Apellidos', value: '{{trabajador.apellidos}}' },
    { label: 'Nombre Completo', value: '{{trabajador.nombreCompleto}}' },
    { label: 'Cédula / Documento', value: '{{trabajador.documento}}' },
    { label: 'Nacionalidad', value: '{{trabajador.nacionalidad}}' },
    { label: 'Estado Civil', value: '{{trabajador.estadoCivil}}' },
    { label: 'Teléfono', value: '{{trabajador.telefono}}' },
    { label: 'Cuenta Bancaria', value: '{{trabajador.banco.cuenta}}' },
    { label: 'Banco (Nombre)', value: '{{trabajador.banco.nombre}}' },
    { label: 'Cargo Actual', value: '{{contrato.cargo}}' },
    { label: 'Fecha Inicio Contrato', value: '{{contrato.fechaInicio}}' },
    { label: 'Sueldo Base (Origen)', value: '{{contrato.salarioBase}}' },
    { label: 'Sueldo Base (Origen) Letras', value: '{{contrato.salarioBaseLetras}}' },
    { label: 'Sueldo Convertido (Bolívares)', value: '{{contrato.salarioBaseBs}}' },
    { label: 'Sueldo Convertido (BS) Letras', value: '{{contrato.salarioBaseBsLetras}}' },
    { label: 'Centro de Costo', value: '{{contrato.centroCosto}}' },
    { label: 'Departamento', value: '{{contrato.departamento}}' },
    { label: 'Fecha de Hoy (01/01/24)', value: '{{empresa.fechaActual}}' },
    { label: 'Fecha Larga Texto', value: '{{empresa.fechaActualLarga}}' }
  ];

  const insertTag = (tag: string) => {
    const currentHtml = watch('contentHtml') || '';
    setValue('contentHtml', currentHtml + tag);
    toast.current?.show({ severity: 'info', summary: 'Etiqueta Añadida', detail: `El tag ${tag} se añadió al final del documento`, life: 2000 });
  };

  const typeTemplate = (rowData: any) => {
    const map: any = {
      CONTRACT: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contrato' },
      WORK_LETTER: { bg: 'bg-green-100', text: 'text-green-800', label: 'Carta de Trabajo' },
      LIQUIDATION: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Liquidación' },
      OTHER: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Otro' }
    };
    const t = map[rowData.type] || map.OTHER;
    return <span className={`px-2 py-1 rounded text-xs font-bold ${t.bg} ${t.text}`}>{t.label}</span>;
  };

  return (
    <AppLayout>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Toast ref={toast} position="bottom-right" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Motor de Plantillas Documentales</h1>
            <p className="text-gray-500 text-sm mt-1">Crea y edita plantillas para generar contratos y cartas automáticamente.</p>
          </div>
          <Button label="Nueva Plantilla" icon="pi pi-plus" className="bg-indigo-600 border-none shadow-md hover:bg-indigo-700" onClick={openNew} />
        </div>

        <DataTable value={templates} loading={loading} className="p-datatable-sm" stripedRows emptyMessage="No hay plantillas creadas.">
          <Column field="name" header="Nombre de la Plantilla" className="font-bold text-gray-700" />
          <Column header="Tipo de Documento" body={typeTemplate} />
          <Column header="Autogestionable" body={(r) => r.isSelfService ? <i className="pi pi-check-circle text-green-500 text-lg" title="Visible en Portal del Trabajador"></i> : <i className="pi pi-minus text-gray-300" title="Solo uso Interno RRHH"></i>} align="center" />
          <Column field="createdAt" header="Fecha de Creación" body={(r) => new Date(r.createdAt).toLocaleDateString('es-ES')} />
          <Column body={(rowData) => (
            <div className="flex justify-end gap-2">
              <Button icon="pi pi-file-pdf" rounded text severity="success" tooltip="Generador (en construcción)" tooltipOptions={{position:'top'}} />
              <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editTemplate(rowData)} />
              <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteTemplate(rowData)} />
            </div>
          )} />
        </DataTable>

        <Dialog 
          visible={dialogVisible} 
          style={{ width: '90vw', maxWidth: '1000px' }} 
          header={editingTemplate ? 'Modificar Plantilla Documental' : 'Crear Nueva Plantilla'} 
          modal 
          className="p-fluid" 
          onHide={() => setDialogVisible(false)}
          maximized={false}
        >
          <div className="flex gap-6 mt-4">
            
            {/* Sidebar Diccionario */}
            <div className="w-[300px] border-r border-gray-200 pr-5 hidden md:block">
              <h4 className="flex items-center gap-2 text-indigo-800 font-bold mb-4 pb-2 border-b border-indigo-100 uppercase tracking-widest text-xs">
                <i className="pi pi-bolt text-indigo-500"></i> Variables Mágicas
              </h4>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                Haz clic en cualquier variable para insertarla en el documento. Al generar un documento, **Ned** sustituirá estas etiquetas por los datos reales del trabajador.
              </p>
              
              <div className="h-[400px] hover:overflow-y-auto overflow-y-hidden pr-2 space-y-1 layout-scrollbar">
                {tags.map((t) => (
                  <div 
                    key={t.value} 
                    className="group flex flex-col p-2 rounded-lg border border-transparent hover:border-indigo-100 hover:bg-indigo-50 cursor-pointer transition-colors"
                    onClick={() => insertTag(t.value)}
                  >
                    <span className="text-[11px] font-bold text-gray-700 group-hover:text-indigo-800">{t.label}</span>
                    <span className="text-[10px] font-mono text-gray-400 group-hover:text-indigo-500 bg-white group-hover:bg-indigo-100 px-1 py-0.5 rounded w-max mt-1">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Principal */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="field">
                  <label className="font-bold text-gray-700 mb-2 block">Nombre de Referencia</label>
                  <Controller name="name" control={control} render={({ field, fieldState }) => (
                    <>
                      <InputText {...field} className={fieldState.invalid ? 'p-invalid w-full' : 'w-full'} placeholder="Ejem: Contrato Fijo 2026..." />
                      {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message as string}</small>}
                    </>
                  )} />
                </div>

                <div className="field">
                  <label className="font-bold text-gray-700 mb-2 block">Tipo (Clasificación)</label>
                  <Controller name="type" control={control} render={({ field, fieldState }) => (
                    <>
                      <Dropdown {...field} options={typeOptions} className={fieldState.invalid ? 'p-invalid w-full' : 'w-full'} />
                    </>
                  )} />
                </div>
              </div>
              
              <div className="field flex items-center p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <Controller name="isSelfService" control={control} render={({ field }) => (
                  <InputSwitch inputId="isSelfService" checked={field.value} onChange={(e) => field.onChange(e.value)} />
                )} />
                <label htmlFor="isSelfService" className="ml-3 font-semibold text-gray-700 cursor-pointer w-full">
                  Disponible en Portal del Trabajador (Autogestionable)
                  <p className="font-normal text-xs text-gray-500 m-0 mt-1">Si marcas esta opción, el empleado podrá generar e imprimir este documento por sí mismo desde su portal público.</p>
                </label>
              </div>

              <div className="field">
                 <label className="font-bold text-gray-700 mb-2 block">Cuerpo del Documento</label>
                 <p className="text-[11px] text-gray-500 mt-0 mb-3 bg-blue-50 p-2 rounded border border-blue-100">
                   <i className="pi pi-info-circle mr-1"></i>
                   Consejo: Redacta tu documento en Google Docs o Microsoft Word, presiona <kbd className="bg-white border rounded px-1">Ctrl + C</kbd> y pega aquí el resultado con <kbd className="bg-white border rounded px-1">Ctrl + V</kbd>. El editor preservará tus alineaciones, viñetas y formato.
                 </p>
                 <Controller name="contentHtml" control={control} render={({ field, fieldState }) => (
                   <>
                     <Editor 
                       {...field} 
                       onTextChange={(e) => field.onChange(e.htmlValue)} 
                       style={{ height: '320px' }} 
                     />
                     {fieldState.error && <small className="p-error block mt-2 font-bold">{fieldState.error.message as string}</small>}
                   </>
                 )} />
              </div>

              <div className="flex justify-end pt-4 gap-2 border-t border-gray-100 mt-4">
                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setDialogVisible(false)} type="button" />
                <Button label="Guardar Plantilla" icon="pi pi-save" className="bg-indigo-600 border-none" type="submit" />
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </AppLayout>
  );
}
