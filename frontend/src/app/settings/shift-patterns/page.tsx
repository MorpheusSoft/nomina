"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import Dialog from '../../../components/ui/Dialog';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../lib/api';

const patternSchema = yup.object().shape({
  name: yup.string().required('Nombre requerido'),
  blocks: yup.array().of(
    yup.object().shape({
      matrixId: yup.string().required('Requerido')
    })
  ).min(1, 'El ciclo debe tener al menos 1 bloque base'),
});

export default function ShiftPatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [matrices, setMatrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, watch, setError, formState: { errors } } = useForm({
    resolver: yupResolver(patternSchema) as any,
    defaultValues: {
      id: '',
      name: '',
      blocks: [ { matrixId: '' } ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blocks'
  });
  
  const blocksWatch = watch('blocks');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shift-patterns');
      const allData = res.data;
      
      const _matrices = allData.filter((p: any) => !p.sequence || !p.sequence[0]?.sourceMatrixId);
      const _patterns = allData.filter((p: any) => p.sequence && p.sequence[0]?.sourceMatrixId);
      
      setMatrices(_matrices);
      setPatterns(_patterns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    reset({
      id: '',
      name: '',
      blocks: [ { matrixId: '' } ]
    });
    setShowDialog(true);
  };

  const editPattern = (pattern: any) => {
    // Rebuild the blocks from the flattened sequence!
    const loadedBlocks: any[] = [];
    let currentMatrixId: string | null = null;
    let currentBlockIndex = -1;

    if (pattern.sequence && Array.isArray(pattern.sequence)) {
        for (const day of pattern.sequence) {
            if (day.blockIndex !== currentBlockIndex) {
               loadedBlocks.push({ matrixId: day.sourceMatrixId });
               currentBlockIndex = day.blockIndex;
               currentMatrixId = day.sourceMatrixId;
            }
        }
    }

    if (loadedBlocks.length === 0) {
        loadedBlocks.push({ matrixId: '' });
    }

    reset({
      id: pattern.id,
      name: pattern.name,
      blocks: loadedBlocks
    });
    setShowDialog(true);
  };

  const deletePattern = async (id: string) => {
    if(window.confirm('¿Eliminar esta Rotación? Afectará a las cuadrillas asignadas.')){
      try {
        await api.delete(`/shift-patterns/${id}`);
        fetchData();
      } catch(e) {
        alert('No se puede eliminar porque está en uso o protegido.');
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // 1. Validation: ALL selected matrices must have the EXACT SAME length
      let cycleLength = null;
      for (const block of data.blocks) {
          const matrix = matrices.find(m => m.id === block.matrixId);
          if (!matrix) continue;
          
          const len = matrix.sequence?.length || 0;
          if (cycleLength === null) {
              cycleLength = len;
          } else if (cycleLength !== len) {
              alert(`Error de Uniformidad: No puedes mezclar Turnos de distinta longitud. El primer bloque usa un turno de ${cycleLength} días, pero intentas añadir uno de ${len} días.`);
              return; // Stop execution
          }
      }

      setIsSubmitting(true);
      const { id, name, blocks } = data;
      
      // 2. Flattening: Convert blocks into the massive array format
      const finalSequence: any[] = [];
      let blockIndex = 0;
      for (const block of blocks) {
          const matrix = matrices.find(m => m.id === block.matrixId);
          if (matrix && matrix.sequence) {
              for (const day of matrix.sequence) {
                  finalSequence.push({
                      ...day,
                      sourceMatrixId: block.matrixId,
                      blockIndex: blockIndex
                  });
              }
          }
          blockIndex++;
      }

      const payload = {
          name,
          sequence: finalSequence
      };

      if (id) {
        await api.patch(`/shift-patterns/${id}`, payload);
      } else {
        await api.post('/shift-patterns', payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error guardando rotación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMatrixName = (matrixId: string) => {
      return matrices.find(m => m.id === matrixId)?.name || 'Turno Eliminado/Desconocido';
  };

  const header = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80 flex items-center">
        <i className="pi pi-search absolute left-3 text-gray-400 z-10"></i>
        <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar Rotaciones..." className="w-full border-gray-200 focus:border-indigo-500 rounded-lg" style={{ paddingLeft: '2.5rem' }} />
      </div>
      <Button label="Crear Patrón Cíclico" icon="pi pi-plus" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-2 rounded-lg font-medium" onClick={openNew} />
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-[1400px] mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Rotaciones y Patrones Cíclicos</h1>
          <p className="mt-2 text-sm text-gray-500">Encadena las Matrices de Turnos para formar super-ciclos de rotación (Ej. Semana Día, Semana Noche, Semana Libre).</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable value={patterns} paginator rows={10} loading={loading} globalFilter={globalFilter} header={header} emptyMessage="No has creado ninguna Rotación todavía.">
            <Column field="name" header="Nombre de la Rotación" className="font-semibold text-gray-900" />
            
            <Column header="Bloques Encadenados" body={(r) => {
                // Re-derive blocks length
                if (!r.sequence) return '0 Fases';
                const blocks = Array.from(new Set(r.sequence.map((s:any) => s.blockIndex)));
                return <span className="text-gray-700 font-medium">{blocks.length} Fases</span>;
            }} />
            
            <Column header="Longitud Total" body={(r) => <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">{(r.sequence?.length || 0)} días continuos</span>} />
            
            <Column header="Grupos Atados" body={(r) => <span className="text-slate-500">{r._count?.crews || 0} Cuadrillas</span>} />
            <Column body={(r) => (
              <div className="flex gap-2 justify-end">
                <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => editPattern(r)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deletePattern(r.id)} />
              </div>
            )} />
          </DataTable>
        </div>

        <Dialog visible={showDialog} style={{ width: '700px' }} header={control._defaultValues.id ? "Editar Rotación" : "Nueva Rotación"} modal onHide={() => setShowDialog(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="field">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Descriptivo de la Rotación</label>
              <Controller name="name" control={control} render={({ field }) => (
                <InputText id={field.name} {...field} className="w-full" placeholder="Ej: Rotación 10x4 Petrolera..." />
              )} />
              {errors.name && <small className="text-red-500">{errors.name.message as string}</small>}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-slate-800">Fases de la Rotación ({fields.length} bloques)</h4>
                 <Button type="button" icon="pi pi-plus" label="Añadir Fase" size="small" outlined onClick={() => append({ matrixId: '' })} />
               </div>
               
               <p className="text-xs text-gray-500 mb-4">Importante: Todos los turnos que encadenes deben tener **la misma cantidad de días** (Uniformidad de Ciclo). No puedes mezclar un turno de 7 días con uno de 5 días.</p>

               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 modern-scrollbar">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                       <div className="w-20 text-center font-bold text-indigo-400 bg-indigo-50 py-1 rounded">Fase {index + 1}</div>
                       
                       <div className="flex-1 w-full">
                          <Controller name={`blocks.${index}.matrixId`} control={control} render={({ field: { onChange, value } }: any) => (
                            <Dropdown value={value} options={matrices.map(m => ({ label: `${m.name} (${m.sequence?.length || 0} Días)`, value: m.id }))} onChange={onChange} placeholder="Selecciona el Turno Base..." className="w-full border-gray-300" filter />
                          )} />
                          {errors.blocks?.[index]?.matrixId && <small className="text-red-500 font-medium">Debes seleccionar un Turno para esta Fase</small>}
                       </div>

                       <Button type="button" icon="pi pi-trash" rounded text severity="danger" onClick={() => remove(index)} disabled={fields.length === 1} className="ml-2" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <Button label="Cancelar" icon="pi pi-times" outlined type="button" severity="secondary" onClick={() => setShowDialog(false)} />
              <Button label="Guardar Rotación Consolidad" icon="pi pi-verified" type="submit" loading={isSubmitting} className="bg-indigo-600 border-none px-6" />
            </div>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
