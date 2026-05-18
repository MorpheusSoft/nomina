"use client";

import { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import api from '@/lib/api';

interface CatalogItem {
  id: string;
  category: string;
  value: string;
}

export default function CatalogsSettingsPage() {
  const [nationalities, setNationalities] = useState<CatalogItem[]>([]);
  const [absenceReasons, setAbsenceReasons] = useState<CatalogItem[]>([]);
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [evaluationTemplates, setEvaluationTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('NATIONALITY');
  const [newValue, setNewValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Job Position States
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobCode, setJobCode] = useState('');
  const [editingJobId, setEditingJobId] = useState('');
  const [evaluationTemplateId, setEvaluationTemplateId] = useState<string | null>(null);

  const defaultJobTemplate = `1. Responsabilidades Principales:\n- \n- \n\n2. Habilidades Blandas:\n- \n- \n\n3. Indicadores Clave de Rendimiento (KPIs):\n- \n- `;

  const loadData = async () => {
    try {
      setLoading(true);
      const [resNat, resAbs, resJobs, resTemp] = await Promise.all([
        api.get('/general-catalogs?category=NATIONALITY'),
        api.get('/general-catalogs?category=ABSENCE_REASON'),
        api.get('/job-positions'),
        api.get('/evaluation-templates')
      ]);
      setNationalities(resNat.data);
      setAbsenceReasons(resAbs.data);
      setJobPositions(resJobs.data);
      setEvaluationTemplates(resTemp.data.map((t: any) => ({ label: t.name, value: t.id })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    try {
      await api.post('/general-catalogs', {
        category: activeCategory,
        value: newValue.trim()
      });
      setShowAddModal(false);
      setNewValue('');
      setErrorMsg('');
      loadData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al guardar el valor.');
    }
  };

  const handleSaveJob = async () => {
    if (!jobName.trim()) return;
    try {
      const payload = {
        name: jobName.trim(),
        description: jobDescription.trim(),
        externalCode: jobCode.trim(),
        evaluationTemplateId
      };

      if (editingJobId) {
        await api.patch(`/job-positions/${editingJobId}`, payload);
      } else {
        await api.post('/job-positions', payload);
      }
      
      setShowJobModal(false);
      setJobName('');
      setJobDescription('');
      setJobCode('');
      setEditingJobId('');
      setEvaluationTemplateId(null);
      loadData();
    } catch (error: any) {
      alert('Error al guardar el cargo');
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJobId(job.id);
    setJobName(job.name);
    setJobDescription(job.description || '');
    setJobCode(job.externalCode || '');
    setEvaluationTemplateId(job.evaluationTemplateId || null);
    setShowJobModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este valor del catálogo?')) {
      try {
        await api.delete(`/general-catalogs/${id}`);
        loadData();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este cargo?')) {
      try {
        await api.delete(`/job-positions/${id}`);
        loadData();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Catálogos Auxiliares</h1>
            <p className="text-gray-500 mt-1">Configuración y mantenimiento de listas de selección (Dropdowns).</p>
          </div>
        </div>

        <TabView className="mt-4">
          <TabPanel header="Cargos y Posiciones">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="pi pi-briefcase text-blue-500 mr-2"></i>
                  Catálogo de Cargos
                </h2>
                <Button 
                  label="Agregar Cargo" 
                  icon="pi pi-plus" 
                  className="p-button-outlined p-button-sm p-button-info"
                  onClick={() => { 
                    setEditingJobId('');
                    setJobName(''); 
                    setJobDescription(defaultJobTemplate); 
                    setJobCode(''); 
                    setEvaluationTemplateId(null);
                    setShowJobModal(true); 
                  }}
                />
              </div>

              <DataTable 
                value={jobPositions} 
                loading={loading} 
                emptyMessage="No hay cargos registrados. Ingrese el primero para la Inteligencia Artificial."
                stripedRows
              >
                <Column field="externalCode" header="Código" className="font-medium text-gray-500" style={{ width: '8rem' }} />
                <Column field="name" header="Nombre del Cargo" className="font-bold text-gray-800" />
                <Column field="description" header="Descripción (Perfil IA)" body={(r) => (
                  <span className="text-sm text-gray-600 line-clamp-1">{r.description || 'Sin descripción'}</span>
                )} />
                <Column header="Plantilla de Evaluación" body={(r) => r.evaluationTemplate ? <span className="text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold">{r.evaluationTemplate.name}</span> : <span className="text-sm text-gray-400 italic">No asignada</span>} />
                <Column header="Acciones" body={(r) => (
                  <div className="flex gap-1">
                    <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => handleEditJob(r)} />
                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteJob(r.id)} />
                  </div>
                )} style={{ width: '8rem' }} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Nacionalidades">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="pi pi-globe text-indigo-500 mr-2"></i>
                  Nacionalidades
                </h2>
                <Button 
                  label="Agregar Nacionalidad" 
                  icon="pi pi-plus" 
                  className="p-button-outlined p-button-sm"
                  onClick={() => { setActiveCategory('NATIONALITY'); setNewValue(''); setErrorMsg(''); setShowAddModal(true); }}
                />
              </div>

              <DataTable 
                value={nationalities} 
                loading={loading} 
                emptyMessage="No hay nacionalidades registradas."
                stripedRows
              >
                <Column field="value" header="Valor (Mostrado en Selector)" className="font-medium" />
                <Column header="Acciones" body={(r) => (
                  <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r.id)} />
                )} style={{ width: '6rem' }} />
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Motivos de Ausencia">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  <i className="pi pi-calendar-minus text-rose-500 mr-2"></i>
                  Motivos de Permisos y Faltas
                </h2>
                <Button 
                  label="Agregar Motivo" 
                  icon="pi pi-plus" 
                  className="p-button-outlined p-button-sm p-button-danger"
                  onClick={() => { setActiveCategory('ABSENCE_REASON'); setNewValue(''); setErrorMsg(''); setShowAddModal(true); }}
                />
              </div>

              <DataTable 
                value={absenceReasons} 
                loading={loading} 
                emptyMessage="El catálogo está vacío. El sistema proveerá opciones básicas por defecto si no agerega nada."
                stripedRows
              >
                <Column field="value" header="Valor (Mostrado en Formularios)" className="font-medium" />
                <Column header="Acciones" body={(r) => (
                  <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r.id)} />
                )} style={{ width: '6rem' }} />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>

      <Dialog 
        header={`Añadir al Catálogo: ${activeCategory === 'NATIONALITY' ? 'Nacionalidad' : 'Motivo de Ausencia'}`} 
        visible={showAddModal}  
        style={{ width: '400px' }} 
        onHide={() => setShowAddModal(false)}
      >
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-medium text-gray-700">Nombre / Valor</label>
          <InputText 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)} 
            placeholder={activeCategory === 'NATIONALITY' ? "Ej: Colombiano, Peruano..." : "Ej: Reposo Médico, Falta Injustificada..."} 
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          {errorMsg && <small className="text-red-500">{errorMsg}</small>}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" text onClick={() => setShowAddModal(false)} />
            <Button label="Guardar" onClick={handleAdd} />
          </div>
        </div>
      </Dialog>

      <Dialog 
        header={editingJobId ? "Editar Cargo" : "Añadir Nuevo Cargo"} 
        visible={showJobModal}  
        style={{ width: '700px' }} 
        onHide={() => setShowJobModal(false)}
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nombre del Cargo <span className="text-red-500">*</span></label>
              <InputText 
                value={jobName} 
                onChange={(e) => setJobName(e.target.value)} 
                placeholder="Ej: Desarrollador Senior" 
              />
            </div>
            <div className="w-1/3 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Código Externo</label>
              <InputText 
                value={jobCode} 
                onChange={(e) => setJobCode(e.target.value)} 
                placeholder="Ej: COD-123" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Plantilla de Evaluación (Por defecto)</label>
            <Dropdown 
              value={evaluationTemplateId} 
              onChange={(e) => setEvaluationTemplateId(e.value)} 
              options={evaluationTemplates} 
              placeholder="Seleccione la plantilla que se aplicará a este cargo" 
              showClear
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Descripción Funcional y Perfil (Leído por IA)</label>
            
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-start gap-3 mb-1">
              <i className="pi pi-lightbulb text-indigo-500 mt-1"></i>
              <div className="text-sm text-indigo-900">
                <p className="font-bold mb-1">Para que Oráculo genere evaluaciones perfectas:</p>
                <p>Estructura esta descripción en 3 bloques clave. Nosotros te hemos pre-cargado la plantilla sugerida abajo.</p>
                <ul className="list-disc ml-5 mt-1 space-y-1 text-xs">
                  <li><b>Responsabilidades Principales:</b> El "Qué hace"</li>
                  <li><b>Habilidades Blandas (Soft Skills):</b> El "Cómo lo hace" (ej: comunicación, liderazgo, presión)</li>
                  <li><b>KPIs o Indicadores:</b> Cómo medir su éxito cuantitativamente.</li>
                </ul>
              </div>
            </div>

            <InputTextarea 
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)} 
              rows={12} 
              className="font-mono text-sm leading-relaxed"
              placeholder="Describa las responsabilidades, habilidades blandas requeridas y KPIs." 
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" text onClick={() => setShowJobModal(false)} />
            <Button label="Guardar Cargo" onClick={handleSaveJob} />
          </div>
        </div>
      </Dialog>
    </AppLayout>
  );
}
