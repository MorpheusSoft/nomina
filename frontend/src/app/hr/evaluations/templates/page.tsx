"use client";

import { useState, useEffect, useRef } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import api from '@/lib/api';

export default function EvaluationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [oracleFocus, setOracleFocus] = useState('');
  const [oracleCount, setOracleCount] = useState<number | null>(5);
  const [editingTemplateId, setEditingTemplateId] = useState('');
  
  // States for Oracle Flow
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<any[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<any[]>([]);

  // States for Import Flow
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportTemplateId, setSelectedImportTemplateId] = useState('');
  const [importableQuestions, setImportableQuestions] = useState<any[]>([]);
  const [selectedImports, setSelectedImports] = useState<any[]>([]);
  
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resTemp, resJobs] = await Promise.all([
        api.get('/evaluation-templates'),
        api.get('/job-positions')
      ]);
      setTemplates(resTemp.data);
      setJobPositions(resJobs.data.map((j: any) => ({ label: j.name, value: j.id })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      // Pide la generación y muestra las tarjetas en el modal
      const focusText = oracleFocus || name || 'Habilidades generales';
      const res = await api.post('/oracle/generate-evaluation', { 
        jobPositionId: selectedJobId || undefined,
        focus: focusText,
        count: oracleCount || 5
      });
      setSuggestedQuestions(res.data);
      setSelectedSuggestions([...res.data]); // Select all by default
      toast.current?.show({ severity: 'success', summary: 'IA Oráculo', detail: 'Sugerencias generadas.' });
    } catch (error: any) {
      toast.current?.show({ severity: 'error', summary: 'Error IA', detail: error.response?.data?.message || 'Fallo de conexión.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmOracleSuggestions = () => {
    if (selectedSuggestions.length === 0) return;
    setQuestions([...questions, ...selectedSuggestions]);
    setShowOracleModal(false);
    setSuggestedQuestions([]);
    setSelectedSuggestions([]);
  };

  const loadImportableQuestions = async (templateId: string) => {
    setSelectedImportTemplateId(templateId);
    if (!templateId) {
      setImportableQuestions([]);
      return;
    }
    try {
      const res = await api.get(`/evaluation-templates/${templateId}`);
      setImportableQuestions(res.data.questions || []);
      setSelectedImports([]);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la plantilla seleccionada.' });
    }
  };

  const confirmImports = () => {
    if (selectedImports.length === 0) return;
    setQuestions([...questions, ...selectedImports]);
    setShowImportModal(false);
    setImportableQuestions([]);
    setSelectedImports([]);
    setSelectedImportTemplateId('');
  };

  const handleSave = async () => {
    if (!name.trim() || questions.length === 0) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe indicar un nombre y generar al menos una pregunta.' });
      return;
    }
    
    try {
      setIsSaving(true);
      const payload = {
        name,
        description,
        questions: questions.map(q => ({ questionText: q.questionText, type: q.type || 'RATING' }))
      };

      if (editingTemplateId) {
        await api.patch(`/evaluation-templates/${editingTemplateId}`, payload);
      } else {
        await api.post('/evaluation-templates', payload);
      }
      
      setShowModal(false);
      setName('');
      setDescription('');
      setQuestions([]);
      setSelectedJobId('');
      setEditingTemplateId('');
      loadData();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla guardada.' });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la plantilla.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      try {
        await api.delete(`/evaluation-templates/${id}`);
        loadData();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar.' });
      }
    }
  };

  const handleEditTemplate = async (template: any) => {
    try {
      setLoading(true);
      // Fetch full template with questions
      const res = await api.get(`/evaluation-templates/${template.id}`);
      const fullTemplate = res.data;
      
      setEditingTemplateId(fullTemplate.id);
      setName(fullTemplate.name);
      setDescription(fullTemplate.description || '');
      setQuestions(fullTemplate.questions || []);
      setSelectedJobId('');
      setShowModal(true);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la plantilla.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/evaluation-templates/${id}/duplicate`);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Plantilla duplicada correctamente.' });
      loadData();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo duplicar la plantilla.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Constructor de Evaluaciones</h1>
            <p className="text-gray-500 mt-1">Plantillas base para las evaluaciones 360.</p>
          </div>
          <Button 
            label="Nueva Plantilla" 
            icon="pi pi-plus" 
            className="p-button-primary bg-indigo-600 border-indigo-600"
            onClick={() => {
              setEditingTemplateId('');
              setName('');
              setDescription('');
              setQuestions([]);
              setSelectedJobId('');
              setShowModal(true);
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DataTable value={templates} loading={loading} emptyMessage="No hay plantillas registradas." stripedRows>
            <Column field="name" header="Nombre de la Plantilla" className="font-bold text-gray-800" />
            <Column field="description" header="Descripción" />
            <Column header="Nro. Preguntas" body={(r) => r._count?.questions || 0} />
            <Column header="Acciones" body={(r) => (
              <div className="flex gap-1">
                <Button icon="pi pi-pencil" rounded text severity="info" tooltip="Editar" onClick={() => handleEditTemplate(r)} />
                <Button icon="pi pi-copy" rounded text severity="secondary" tooltip="Duplicar" onClick={() => handleDuplicate(r.id)} />
                <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Eliminar" onClick={() => handleDelete(r.id)} />
              </div>
            )} style={{ width: '8rem' }} />
          </DataTable>
        </div>
      </div>

      <Dialog 
        header={editingTemplateId ? "Editar Plantilla" : "Diseñador de Plantilla"} 
        visible={showModal}  
        style={{ width: '800px' }} 
        onHide={() => setShowModal(false)}
      >
        <div className="flex flex-col gap-4 pt-2">
          


          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nombre de la Plantilla <span className="text-red-500">*</span></label>
            <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Evaluación Anual Frontend" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Preguntas de la Evaluación</h3>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button 
                  label="✨ Sugerir con Oráculo" 
                  size="small" 
                  severity="help"
                  onClick={() => {
                    setSuggestedQuestions([]);
                    setSelectedSuggestions([]);
                    setSelectedJobId('');
                    setShowOracleModal(true);
                  }}
                />
                <Button 
                  label="📥 Importar" 
                  size="small" 
                  severity="secondary"
                  outlined
                  onClick={() => setShowImportModal(true)}
                />
                <Button 
                  label="Añadir Sección" 
                  icon="pi pi-bookmark" 
                  size="small" 
                  outlined 
                  severity="secondary"
                  onClick={() => setQuestions([...questions, { questionText: 'Nueva Área / Sección', type: 'SECTION' }])}
                />
                <Button 
                  label="Añadir Pregunta" 
                  icon="pi pi-plus" 
                  size="small" 
                  outlined 
                  onClick={() => setQuestions([...questions, { questionText: '', type: 'RATING' }])}
                />
              </div>
            </div>
            
            {questions.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                No hay preguntas. Añade una manualmente o utiliza el asistente IA arriba.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(() => {
                  let qNumber = 0;
                  return questions.map((q, i) => {
                    if (q.type !== 'SECTION') qNumber++;
                    return (
                      <div key={i} className={`p-3 border rounded-lg flex gap-3 items-start shadow-sm ${q.type === 'SECTION' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                        {q.type !== 'SECTION' && <span className="font-bold text-indigo-400 mt-2">{qNumber}.</span>}
                        {q.type === 'SECTION' && <i className="pi pi-bookmark text-indigo-500 mt-2"></i>}
                    
                    <div className="flex-1">
                      {q.type === 'SECTION' ? (
                        <InputText 
                          value={q.questionText} 
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[i].questionText = e.target.value;
                            setQuestions(newQ);
                          }} 
                          className="w-full font-bold text-indigo-900 border-indigo-100"
                          placeholder="Nombre de la Sección (Ej: Habilidades Blandas)"
                        />
                      ) : (
                        <InputTextarea 
                          value={q.questionText} 
                          onChange={(e) => {
                            const newQ = [...questions];
                            newQ[i].questionText = e.target.value;
                            setQuestions(newQ);
                          }} 
                          className="w-full text-sm"
                          placeholder="Escriba la pregunta aquí..."
                          autoResize 
                          rows={1}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex gap-1">
                        <Button 
                          icon="pi pi-arrow-up" 
                          rounded 
                          text 
                          size="small"
                          severity="secondary" 
                          disabled={i === 0}
                          tooltip="Subir"
                          onClick={() => {
                            const newQ = [...questions];
                            const temp = newQ[i];
                            newQ[i] = newQ[i-1];
                            newQ[i-1] = temp;
                            setQuestions(newQ);
                          }}
                        />
                        <Button 
                          icon="pi pi-arrow-down" 
                          rounded 
                          text 
                          size="small"
                          severity="secondary" 
                          disabled={i === questions.length - 1}
                          tooltip="Bajar"
                          onClick={() => {
                            const newQ = [...questions];
                            const temp = newQ[i];
                            newQ[i] = newQ[i+1];
                            newQ[i+1] = temp;
                            setQuestions(newQ);
                          }}
                        />
                        <Button 
                          icon="pi pi-trash" 
                          rounded 
                          text 
                          size="small"
                          severity="danger" 
                          tooltip="Eliminar"
                          onClick={() => {
                            const newQ = [...questions];
                            newQ.splice(i, 1);
                            setQuestions(newQ);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button label="Cancelar" text onClick={() => setShowModal(false)} />
            <Button label="Guardar Plantilla" onClick={handleSave} disabled={isSaving || questions.length === 0} />
          </div>
        </div>
      </Dialog>
      {/* Oracle Suggestions Modal */}
      <Dialog 
        header={<div className="flex items-center gap-2"><i className="pi pi-sparkles text-indigo-500"></i> Oráculo: Sugerencia de Preguntas</div>} 
        visible={showOracleModal} 
        style={{ width: '600px' }} 
        onHide={() => setShowOracleModal(false)}
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-gray-600">
            Oráculo puede analizar el cargo seleccionado para generar preguntas automáticamente.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700">Cargo a Evaluar <span className="text-red-500">*</span></label>
            <Dropdown 
              options={jobPositions} 
              value={selectedJobId} 
              onChange={(e) => setSelectedJobId(e.value)} 
              placeholder="Seleccione un cargo para dar contexto a la IA..." 
              filter
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Enfoque (Opcional)</label>
              <InputText 
                value={oracleFocus} 
                onChange={(e) => setOracleFocus(e.target.value)} 
                placeholder="Ej: Liderazgo, SQL Avanzado..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700">Cant. Preguntas</label>
              <InputNumber 
                value={oracleCount} 
                onValueChange={(e) => setOracleCount(e.value)} 
                min={1} 
                max={15}
              />
            </div>
          </div>
          
          <Button 
            label="Generar Sugerencias" 
            icon={isGenerating ? "pi pi-spin pi-spinner" : "pi pi-bolt"} 
            severity="help"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedJobId}
          />

          {suggestedQuestions.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="font-bold text-sm text-gray-800 mb-3">Sugerencias (Selecciona las que desees añadir)</h4>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                {suggestedQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Checkbox 
                      inputId={`sug-${idx}`} 
                      checked={selectedSuggestions.some(sq => sq.questionText === q.questionText)} 
                      onChange={(e) => {
                        let _sel = [...selectedSuggestions];
                        if (e.checked) _sel.push(q);
                        else _sel = _sel.filter(sq => sq.questionText !== q.questionText);
                        setSelectedSuggestions(_sel);
                      }} 
                    />
                    <label htmlFor={`sug-${idx}`} className="text-sm cursor-pointer flex-1">
                      <span className="font-medium text-gray-800 block mb-1">{q.questionText}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">{q.type === 'RATING' ? 'Calificación (1-5)' : 'Texto Libre'}</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button label={`Añadir ${selectedSuggestions.length} preguntas`} onClick={confirmOracleSuggestions} disabled={selectedSuggestions.length === 0} />
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Import Modal */}
      <Dialog 
        header={<div className="flex items-center gap-2"><i className="pi pi-download text-gray-500"></i> Importar Banco de Preguntas</div>} 
        visible={showImportModal} 
        style={{ width: '600px' }} 
        onHide={() => setShowImportModal(false)}
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-gray-600">
            Selecciona otra plantilla existente para copiar sus preguntas hacia la plantilla actual.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-700">Plantilla Origen</label>
            <Dropdown 
              options={templates.map(t => ({ label: t.name, value: t.id }))} 
              value={selectedImportTemplateId} 
              onChange={(e) => loadImportableQuestions(e.value)} 
              placeholder="Seleccione plantilla..." 
              filter
            />
          </div>

          {importableQuestions.length > 0 && (
            <div className="mt-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-gray-800">Preguntas Disponibles</h4>
                <Button 
                  label="Seleccionar Todas" 
                  text 
                  size="small" 
                  onClick={() => setSelectedImports([...importableQuestions])} 
                />
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                {importableQuestions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Checkbox 
                      inputId={`imp-${idx}`} 
                      checked={selectedImports.some(iq => iq.id ? iq.id === q.id : iq.questionText === q.questionText)} 
                      onChange={(e) => {
                        let _sel = [...selectedImports];
                        if (e.checked) _sel.push(q);
                        else _sel = _sel.filter(iq => iq.id ? iq.id !== q.id : iq.questionText !== q.questionText);
                        setSelectedImports(_sel);
                      }} 
                    />
                    <label htmlFor={`imp-${idx}`} className="text-sm cursor-pointer flex-1">
                      <span className="font-medium text-gray-800 block mb-1">{q.questionText}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">{q.type === 'SECTION' ? 'Separador / Área' : (q.type === 'RATING' ? 'Calificación (1-5)' : 'Texto Libre')}</span>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button label={`Importar ${selectedImports.length} preguntas`} onClick={confirmImports} disabled={selectedImports.length === 0} />
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </AppLayout>
  );
}
