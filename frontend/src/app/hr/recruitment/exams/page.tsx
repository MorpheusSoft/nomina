'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, ArrowLeft, Image as ImageIcon, Type, ListChecks, CheckCircle2, Upload, Clock } from 'lucide-react';
import api from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';

export default function ExamBuilder() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  
  // AI State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/exam-templates');
      setTemplates(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      name: 'Nuevo Examen Técnico',
      description: '',
      timeLimitMinutes: 30,
      questions: [
        {
          questionText: '¿Cuál es la función principal de React?',
          type: 'MULTIPLE',
          imageContext: '',
          options: [
            { text: 'Estilos CSS', isCorrect: false },
            { text: 'Construir UI', isCorrect: true },
            { text: 'Base de Datos', isCorrect: false },
            { text: 'Servidor', isCorrect: false },
          ]
        }
      ]
    });
  };

  const handleSave = async () => {
    try {
      if (editingTemplate.id) {
        await api.put(`/exam-templates/${editingTemplate.id}`, editingTemplate);
      } else {
        await api.post('/exam-templates', editingTemplate);
      }
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error(error);
      alert('Error guardando plantilla');
    }
  };

  const addQuestion = () => {
    setEditingTemplate({
      ...editingTemplate,
      questions: [
        ...editingTemplate.questions,
        {
          questionText: '',
          type: 'MULTIPLE',
          imageContext: '',
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]
        }
      ]
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, qIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/exam-templates/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newQ = [...editingTemplate.questions];
      newQ[qIdx].imageUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + res.data.url;
      setEditingTemplate({...editingTemplate, questions: newQ});
    } catch (error) {
      console.error(error);
      alert('Error al subir la imagen');
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic) return;
    setGeneratingAI(true);
    try {
      const res = await api.post('/exam-templates/generate-ai', {
        topic: aiTopic,
        numQuestions: aiCount
      });
      
      setEditingTemplate({
        ...editingTemplate,
        questions: res.data // Mapea directo porque devolvimos el array limpio
      });
      
      setShowAIModal(false);
      setAiTopic('');
    } catch (error) {
      console.error(error);
      alert('Error generando examen con IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <AppLayout>
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => window.location.href = '/hr/recruitment'} 
            className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Reclutamiento
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Plantillas de Exámenes</h1>
          <p className="text-slate-500 mt-2">Crea exámenes técnicos para enviar a los candidatos preseleccionados.</p>
        </div>
        {!editingTemplate && (
          <button onClick={handleCreateNew} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" /> Crear Plantilla
          </button>
        )}
      </div>

      {editingTemplate ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Nombre del Examen</label>
                <input 
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="w-full px-4 py-2.5 text-lg font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:font-normal"
                  placeholder="Ej. Evaluación Psicométrica de Ventas"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Descripción / Instrucciones</label>
                <textarea 
                  value={editingTemplate.description}
                  onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700"
                  placeholder="Instrucciones que el candidato leerá antes de iniciar..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b border-slate-200 pb-3">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" /> Configuración
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Límite de Tiempo</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={editingTemplate.timeLimitMinutes || ''}
                      onChange={e => setEditingTemplate({...editingTemplate, timeLimitMinutes: parseInt(e.target.value) || null})}
                      placeholder="Sin límite"
                      className="w-full pl-4 pr-12 py-2.5 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="absolute right-4 top-3 text-slate-400 font-medium text-sm select-none">min</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Establece los minutos disponibles para completar la evaluación. Déjalo en blanco para omitir el límite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Preguntas</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAIModal(true)} 
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded text-sm font-medium flex items-center border border-indigo-200"
                >
                  ✨ Autogenerar con Oráculo
                </button>
                <button onClick={addQuestion} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Añadir Pregunta
                </button>
              </div>
            </div>

            {editingTemplate.questions.map((q: any, qIdx: number) => (
              <div key={qIdx} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4 relative">
                <button 
                  onClick={() => {
                    const newQ = [...editingTemplate.questions];
                    newQ.splice(qIdx, 1);
                    setEditingTemplate({...editingTemplate, questions: newQ});
                  }}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pregunta {qIdx + 1}</label>
                    <input 
                      value={q.questionText}
                      onChange={e => {
                        const newQ = [...editingTemplate.questions];
                        newQ[qIdx].questionText = e.target.value;
                        setEditingTemplate({...editingTemplate, questions: newQ});
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1 md:max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Imagen (URL o Subir)</label>
                    <div className="flex items-center gap-2">
                      <div className="relative cursor-pointer bg-slate-100 hover:bg-slate-200 p-2 rounded-md transition-colors border border-slate-300">
                        <Upload className="w-5 h-5 text-slate-600" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, qIdx)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="Subir imagen desde tu PC"
                        />
                      </div>
                      <input 
                        value={q.imageUrl || ''}
                        placeholder="O pega una URL..."
                        onChange={e => {
                          const newQ = [...editingTemplate.questions];
                          newQ[qIdx].imageUrl = e.target.value;
                          setEditingTemplate({...editingTemplate, questions: newQ});
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button 
                    onClick={() => {
                      const newQ = [...editingTemplate.questions];
                      newQ[qIdx].type = 'SINGLE';
                      if (!newQ[qIdx].options || newQ[qIdx].options.length === 0) {
                        newQ[qIdx].options = [
                          { text: 'Opción 1', isCorrect: true },
                          { text: 'Opción 2', isCorrect: false }
                        ];
                      } else {
                        // Enforce only one correct
                        let foundCorrect = false;
                        newQ[qIdx].options.forEach((o:any) => {
                          if (o.isCorrect && !foundCorrect) foundCorrect = true;
                          else o.isCorrect = false;
                        });
                        if (!foundCorrect && newQ[qIdx].options.length > 0) newQ[qIdx].options[0].isCorrect = true;
                      }
                      setEditingTemplate({...editingTemplate, questions: newQ});
                    }}
                    className={`flex items-center text-sm px-3 py-1.5 rounded-md border transition-colors ${q.type === 'SINGLE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Selección Simple
                  </button>
                  <button 
                    onClick={() => {
                      const newQ = [...editingTemplate.questions];
                      newQ[qIdx].type = 'MULTIPLE';
                      if (!newQ[qIdx].options || newQ[qIdx].options.length === 0) {
                        newQ[qIdx].options = [
                          { text: 'Opción 1', isCorrect: true },
                          { text: 'Opción 2', isCorrect: false }
                        ];
                      }
                      setEditingTemplate({...editingTemplate, questions: newQ});
                    }}
                    className={`flex items-center text-sm px-3 py-1.5 rounded-md border transition-colors ${q.type === 'MULTIPLE' || (!q.type && q.options?.length > 0) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <ListChecks className="w-4 h-4 mr-2" /> Selección Múltiple
                  </button>
                  <button 
                    onClick={() => {
                      const newQ = [...editingTemplate.questions];
                      newQ[qIdx].type = 'OPEN';
                      newQ[qIdx].options = [];
                      setEditingTemplate({...editingTemplate, questions: newQ});
                    }}
                    className={`flex items-center text-sm px-3 py-1.5 rounded-md border transition-colors ${q.type === 'OPEN' || (!q.type && (!q.options || q.options.length === 0)) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Type className="w-4 h-4 mr-2" /> Desarrollo Abierto
                  </button>
                </div>

                {q.imageUrl && (
                  <div className="pl-4 space-y-3">
                    <img src={q.imageUrl} alt="Referencia visual" className="h-32 object-contain border rounded bg-white p-1 shadow-sm" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contexto Oculto (IA)</label>
                      <textarea 
                        value={q.imageContext || ''}
                        placeholder="Describe lo que expresa la imagen o la respuesta esperada. El candidato NO verá esto, pero Oráculo lo usará para evaluar su respuesta."
                        onChange={e => {
                          const newQ = [...editingTemplate.questions];
                          newQ[qIdx].imageContext = e.target.value;
                          setEditingTemplate({...editingTemplate, questions: newQ});
                        }}
                        className="w-full md:w-3/4 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-600 bg-amber-50/30"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                
                {q.options && q.options.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-300">
                    {q.options.map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex items-center space-x-2">
                        <input 
                          type={q.type === 'SINGLE' ? 'radio' : 'checkbox'} 
                          name={`question-${qIdx}`}
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const newQ = [...editingTemplate.questions];
                            if (q.type === 'SINGLE') {
                              newQ[qIdx].options.forEach((o:any) => o.isCorrect = false);
                            }
                            newQ[qIdx].options[oIdx].isCorrect = e.target.checked;
                            setEditingTemplate({...editingTemplate, questions: newQ});
                          }}
                          className={`text-green-600 focus:ring-green-500 ${q.type === 'SINGLE' ? '' : 'rounded'}`}
                        />
                        <input 
                          value={opt.text}
                          placeholder={`Opción ${oIdx + 1}`}
                          onChange={e => {
                            const newQ = [...editingTemplate.questions];
                            newQ[qIdx].options[oIdx].text = e.target.value;
                            setEditingTemplate({...editingTemplate, questions: newQ});
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-4 border-l-2 border-indigo-300">
                    <p className="text-sm font-medium text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded">
                      ✎ Pregunta de Desarrollo Abierto (Se evaluará cualitativamente)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6">
            <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Save className="w-4 h-4 mr-2" /> Guardar Plantilla
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <p>Cargando plantillas...</p>
          ) : templates.map(t => (
            <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg text-slate-900">{t.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.description || 'Sin descripción'}</p>
              <div className="mt-4 flex items-center text-sm text-slate-600">
                <span className="font-medium bg-slate-100 px-2 py-1 rounded">{t.questions?.length || 0} preguntas</span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setEditingTemplate(t)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </button>
              </div>
            </div>
          ))}
          {!loading && templates.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              No has creado ninguna plantilla de examen.
            </div>
          )}
        </div>
      )}

      {/* Modal IA */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl border border-indigo-100">
            <h3 className="text-2xl font-bold mb-2 text-slate-900 flex items-center">
              ✨ Oráculo IA
            </h3>
            <p className="text-slate-500 mb-6 text-sm">Describe el rol, los conocimientos esperados y el tono del examen.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instrucciones (Tema, Nivel, Estilo)</label>
                <textarea 
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Ej: Examen psicotécnico situacional para evaluar capacidad de liderazgo y manejo de crisis."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cantidad de Preguntas</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  value={aiCount}
                  onChange={e => setAiCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAIModal(false)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                disabled={generatingAI}
              >
                Cancelar
              </button>
              <button 
                onClick={handleAIGenerate}
                disabled={generatingAI || !aiTopic}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center font-medium"
              >
                {generatingAI ? 'Generando Magia...' : 'Generar Examen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}
