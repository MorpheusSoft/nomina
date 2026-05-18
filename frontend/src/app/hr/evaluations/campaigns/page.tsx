"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { MultiSelect } from 'primereact/multiselect';
import { InputNumber } from 'primereact/inputnumber';
import api from '@/lib/api';

export default function EvaluationCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [allSupervisors, setAllSupervisors] = useState<any[]>([]);
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  
  // Campaign Form State
  const [name, setName] = useState('');
  const [dates, setDates] = useState<Date[] | null>(null);
  // Selection State
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedJobPositions, setSelectedJobPositions] = useState<string[]>([]);
  const [minSeniorityMonths, setMinSeniorityMonths] = useState<number>(0);
  const [departmentWorkers, setDepartmentWorkers] = useState<any[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<any[]>([]);

  const stepperRef = useRef(null);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resCamp, resDept, resWork, resJobs] = await Promise.all([
        api.get('/evaluation-campaigns'),
        api.get('/departments'),
        api.get('/workers'),
        api.get('/job-positions')
      ]);
      setCampaigns(resCamp.data);
      setDepartments(resDept.data.map((d: any) => ({ label: d.name, value: d.id, supervisorId: d.supervisorId })));
      setWorkers(resWork.data);
      setAllSupervisors(resWork.data.map((w: any) => ({ label: `${w.firstName} ${w.lastName}`, value: w.id })));
      setJobPositions(resJobs.data.map((j: any) => ({ label: j.name, value: j.id, template: j.evaluationTemplate })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWorkers = async () => {
    if (selectedDepartments.length === 0 && selectedJobPositions.length === 0) {
      toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Mostrando todos los empleados activos (sin filtros).' });
    }

    try {
      const res = await api.get(`/employment-records`);
      
      const now = new Date();
      let activeRecords = res.data.filter((er: any) => er.isActive);

      if (selectedDepartments.length > 0) {
        activeRecords = activeRecords.filter((er: any) => selectedDepartments.includes(er.departmentId));
      }

      if (selectedJobPositions.length > 0) {
        activeRecords = activeRecords.filter((er: any) => selectedJobPositions.includes(er.jobPositionId));
      }

      if (minSeniorityMonths > 0) {
        activeRecords = activeRecords.filter((er: any) => {
          const startDate = new Date(er.startDate);
          const months = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          return months >= minSeniorityMonths;
        });
      }
      
      const mappedWorkers = activeRecords.map((er: any) => {
        const worker = workers.find(w => w.id === er.workerId);
        const dept = departments.find(d => d.value === er.departmentId);
        const defaultSupervisorId = dept?.supervisorId || null;
        
        const jobPos = jobPositions.find(j => j.value === er.jobPositionId);
        
        return {
          workerId: worker?.id,
          name: `${worker?.firstName} ${worker?.lastName}`,
          position: er.position,
          evaluatorId: defaultSupervisorId,
          templateName: jobPos?.template?.name || null,
          hasTemplate: !!jobPos?.template
        };
      }).filter((w: any) => w.workerId);

      setDepartmentWorkers(mappedWorkers);
      setSelectedWorkers([...mappedWorkers]);
      
      if (mappedWorkers.length > 0) {
        (stepperRef.current as any)?.nextCallback();
      } else {
        toast.current?.show({ severity: 'warn', summary: 'Sin Resultados', detail: 'No se encontraron trabajadores que coincidan con los filtros.' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEvaluatorChange = (workerId: string, newEvaluatorId: string) => {
    const updated = departmentWorkers.map(w => 
      w.workerId === workerId ? { ...w, evaluatorId: newEvaluatorId } : w
    );
    setDepartmentWorkers(updated);
    
    // Also update selected if it's there
    const updatedSelected = selectedWorkers.map(w => 
      w.workerId === workerId ? { ...w, evaluatorId: newEvaluatorId } : w
    );
    setSelectedWorkers(updatedSelected);
  };

  const handleSave = async (status: 'DRAFT' | 'ACTIVE') => {
    if (!name || !dates || dates.length !== 2 || !dates[1]) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Complete los datos de la campaña.' });
      return;
    }

    if (selectedWorkers.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar al menos un trabajador para evaluar.' });
      return;
    }

    // Validar que todos los seleccionados tengan un evaluador
    const missingEvaluator = selectedWorkers.find(w => !w.evaluatorId);
    if (missingEvaluator) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: `El trabajador ${missingEvaluator.name} no tiene Evaluador asignado.` });
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name,
        startDate: dates[0].toISOString(),
        endDate: dates[1].toISOString(),
        status,
        targetDepartments: selectedDepartments,
        targetJobPositions: selectedJobPositions,
        minSeniorityMonths,
        reviews: selectedWorkers.map(w => ({
          evaluateeId: w.workerId,
          supervisorId: w.evaluatorId
        }))
      };

      await api.post('/evaluation-campaigns', payload);
      
      setShowModal(false);
      setName('');
      setDates(null);
      setSelectedDepartments([]);
      setSelectedJobPositions([]);
      setMinSeniorityMonths(0);
      setDepartmentWorkers([]);
      setSelectedWorkers([]);
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: status === 'ACTIVE' ? 'Campaña Lanzada Oficialmente.' : 'Borrador Guardado.' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la campaña.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'DRAFT') return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">BORRADOR</span>;
    if (status === 'ACTIVE') return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">ACTIVA</span>;
    if (status === 'COMPLETED') return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">COMPLETADA</span>;
    return <span>{status}</span>;
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta campaña?')) {
      try {
        await api.delete(`/evaluation-campaigns/${id}`);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Campaña eliminada correctamente.' });
        loadData();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la campaña.' });
      }
    }
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Campañas de Evaluación</h1>
            <p className="text-gray-500 mt-1">Lanza y monitorea ciclos de evaluación 360 del personal.</p>
          </div>
          <Button 
            label="Lanzar Nueva Campaña" 
            icon="pi pi-rocket" 
            className="p-button-primary bg-indigo-600 border-indigo-600"
            onClick={() => setShowModal(true)}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable value={campaigns} loading={loading} emptyMessage="No hay campañas registradas." stripedRows>
            <Column field="name" header="Nombre de la Campaña" className="font-bold text-gray-800" />
            <Column header="Período" body={(r) => `${new Date(r.startDate).toLocaleDateString('es-ES')} - ${new Date(r.endDate).toLocaleDateString('es-ES')}`} />
            <Column header="Participantes" body={(r) => r._count?.performanceReviews || 0} />
            <Column field="status" header="Estado" body={(r) => getStatusBadge(r.status)} />
            <Column header="Acciones" body={(r) => {
              const canDelete = r.status !== 'COMPLETED' && (!r._count?.performanceReviews || r._count.performanceReviews === 0);
              return (
                <div className="flex gap-2">
                  <Button icon="pi pi-eye" rounded text severity="info" tooltip="Monitorear Avance" onClick={() => router.push(`/hr/evaluations/campaigns/${r.id}`)} />
                  {canDelete && (
                    <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Eliminar Campaña" onClick={() => handleDeleteCampaign(r.id)} />
                  )}
                </div>
              );
            }} style={{ width: '8rem' }} />
          </DataTable>
        </div>
      </div>

      <Dialog 
        header="Nueva Campaña de Evaluación" 
        visible={showModal}  
        style={{ width: '900px' }} 
        onHide={() => setShowModal(false)}
        contentStyle={{ minHeight: '400px' }}
      >
        <Stepper ref={stepperRef}>
          <StepperPanel header="Datos Principales">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Nombre de la Campaña <span className="text-red-500">*</span></label>
                <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Evaluación Anual 2024" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Rango de Fechas <span className="text-red-500">*</span></label>
                <Calendar value={dates as any} onChange={(e) => setDates(e.value as Date[])} selectionMode="range" readOnlyInput hideOnRangeSelection placeholder="Seleccione Inicio y Fin" showIcon />
              </div>

              <div className="flex flex-col gap-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800">Filtros de Audiencia (Segmentación)</h3>
                <p className="text-xs text-gray-500 mb-2">Deje en blanco para evaluar a todos. El sistema buscará trabajadores activos y les asignará la plantilla de su cargo.</p>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Departamentos</label>
                    <MultiSelect options={departments} value={selectedDepartments} onChange={(e) => setSelectedDepartments(e.value)} placeholder="Todos" filter maxSelectedLabels={2} className="w-full" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Cargos Específicos</label>
                    <MultiSelect options={jobPositions} value={selectedJobPositions} onChange={(e) => setSelectedJobPositions(e.value)} placeholder="Todos" filter maxSelectedLabels={2} className="w-full" />
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="w-1/2 flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-700">Antigüedad Mínima (Meses)</label>
                    <InputNumber value={minSeniorityMonths} onValueChange={(e) => setMinSeniorityMonths(e.value || 0)} min={0} placeholder="Ej: 6" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button label="Buscar Personal" icon="pi pi-search" iconPos="right" onClick={handleSearchWorkers} disabled={!name || !dates || !dates[1]} />
              </div>
            </div>
          </StepperPanel>
          
          <StepperPanel header="Selección de Personal y Evaluadores">
            <div className="flex flex-col gap-4 py-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Personal Encontrado ({departmentWorkers.length})</span>
                </div>
                <DataTable 
                  value={departmentWorkers} 
                  selection={selectedWorkers} 
                  onSelectionChange={(e) => setSelectedWorkers(e.value)} 
                  dataKey="workerId"
                  emptyMessage="No hay trabajadores con los filtros actuales."
                  size="small"
                >
                  <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                  <Column field="name" header="Trabajador" className="font-medium" />
                  <Column field="position" header="Cargo" />
                  <Column header="Plantilla de Eval." body={(r) => (
                    r.hasTemplate ? <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold">{r.templateName}</span> : <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-bold"><i className="pi pi-exclamation-triangle mr-1"></i>Sin Plantilla</span>
                  )} />
                  <Column header="Evaluador / Jefe" body={(r) => (
                    <Dropdown 
                      value={r.evaluatorId} 
                      options={allSupervisors} 
                      onChange={(e) => handleEvaluatorChange(r.workerId, e.value)} 
                      placeholder="Sin Evaluador Asignado" 
                      filter
                      className="w-full md:w-56"
                      pt={{ root: { className: !r.evaluatorId ? 'border-red-400' : '' } }}
                    />
                  )} />
                </DataTable>
              </div>

              <div className="flex justify-between mt-6">
                <Button label="Atrás" icon="pi pi-arrow-left" severity="secondary" outlined onClick={() => (stepperRef.current as any)?.prevCallback()} />
                <div className="flex gap-2">
                  <Button label="Guardar Borrador" icon="pi pi-save" severity="secondary" outlined onClick={() => handleSave('DRAFT')} disabled={isSaving || selectedWorkers.length === 0} tooltip="Permite editar después sin enviar nada aún." />
                  <Button label="Lanzar Evaluación" icon="pi pi-send" severity="success" onClick={() => handleSave('ACTIVE')} disabled={isSaving || selectedWorkers.length === 0} tooltip="Cierra la edición y genera los links de evaluación para enviar por correo/portal." />
                </div>
              </div>
            </div>
          </StepperPanel>
        </Stepper>
      </Dialog>
    </AppLayout>
  );
}
