"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';

// Usamos axios directo en lugar de api() porque este es un endpoint público sin token JWT
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002/api/v1';

export default function EvaluateTokenPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (token) {
      fetchInstance();
    }
  }, [token]);

  const fetchInstance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/evaluation-instances/token/${token}`);
      
      if (res.data.status === 'COMPLETED') {
        setCompleted(true);
        setData(res.data.instance);
      } else {
        setData(res.data);
        // Inicializar respuestas vacías (solo para preguntas reales)
        const initAns = res.data.template.questions
          .filter((q: any) => q.type !== 'SECTION')
          .map((q: any) => ({
            questionId: q.id,
            answerValue: null
          }));
        setAnswers(initAns);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la evaluación. El enlace puede ser inválido o haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (qId: string, val: number | null) => {
    setAnswers(prev => prev.map(a => a.questionId === qId ? { ...a, answerValue: val } : a));
  };

  const handleSubmit = async () => {
    // Validar que todas las preguntas fueron respondidas
    const pending = answers.filter(a => a.answerValue === null || a.answerValue === undefined);
    if (pending.length > 0) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe responder todas las preguntas antes de enviar.' });
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/evaluation-instances/token/${token}`, {
        answers
      });
      setCompleted(true);
    } catch (err: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Error al enviar la evaluación.' });
    } finally {
      setSubmitting(false);
    }
  };

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <i className="pi pi-exclamation-circle text-red-500 text-5xl mb-4"></i>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <i className="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Evaluación Completada</h1>
          <p className="text-gray-600">¡Gracias por tu participación! Tus respuestas han sido guardadas exitosamente y formarán parte del análisis de desempeño.</p>
        </div>
      </div>
    );
  }

  const { instance, campaign, performanceReview, template } = data;
  const isSelf = instance.evaluatorType === 'SELF';
  const evaluateeName = `${performanceReview.evaluatee.firstName} ${performanceReview.evaluatee.lastName}`;
  const evaluatorName = isSelf ? evaluateeName : `${performanceReview.supervisor.firstName} ${performanceReview.supervisor.lastName}`;
  const roleName = isSelf ? "Autoevaluación" : "Evaluación por parte del Jefe/Supervisor";

  // Agrupar preguntas por secciones
  const sections: { title: string, questions: any[] }[] = [];
  let currentSec = { title: 'Preguntas Generales', questions: [] as any[] };
  
  template.questions.forEach((q: any) => {
    if (q.type === 'SECTION') {
      if (currentSec.questions.length > 0) sections.push(currentSec);
      currentSec = { title: q.questionText, questions: [] };
    } else {
      currentSec.questions.push(q);
    }
  });
  if (currentSec.questions.length > 0) sections.push(currentSec);

  const activeSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Calcular número global de pregunta
  let globalQuestionCounter = 0;
  for (let i = 0; i < currentSectionIndex; i++) {
    globalQuestionCounter += sections[i].questions.length;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toast ref={toast} />
      
      {/* Encabezado Fijo (Sticky) */}
      <div className="sticky top-0 z-50 shadow-md">
        <div className="bg-indigo-600 p-6 text-white flex flex-col items-center text-center">
          <div className="uppercase tracking-wider text-[10px] sm:text-xs font-bold text-indigo-200 mb-1">
            {campaign.tenant.name} | Evaluación de Desempeño 360
          </div>
          <h1 className="text-xl sm:text-3xl font-bold mb-1">{campaign.name}</h1>
          <p className="text-indigo-100 text-sm sm:text-base">
            {roleName}
          </p>
        </div>
        <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex flex-row justify-between items-center px-4 sm:px-10">
          <div className="flex-1 text-left">
            <span className="block text-[10px] sm:text-xs font-bold text-indigo-400 uppercase">Trabajador a Evaluar</span>
            <span className="block text-sm sm:text-base font-semibold text-indigo-900 truncate">{evaluateeName}</span>
          </div>
          <div className="w-px h-8 bg-indigo-200 mx-2 sm:mx-4"></div>
          <div className="flex-1 text-right">
            <span className="block text-[10px] sm:text-xs font-bold text-indigo-400 uppercase">Cargo Desempeñado</span>
            <span className="block text-sm sm:text-base font-semibold text-indigo-900 truncate">
              {performanceReview.evaluatee.employmentRecords[0]?.jobPosition?.name || 'No definido'}
            </span>
          </div>
        </div>
        
        {/* Barra de progreso visual */}
        <div className="h-1.5 w-full bg-gray-200">
          <div 
            className="h-full bg-green-400 transition-all duration-300" 
            style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contenido (Diapositiva) */}
      <div className="max-w-3xl mx-auto mt-8 px-4">
        {isFirstSection && (
          <div className="mb-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Instrucciones</h2>
            <p className="text-gray-600 text-sm">
              Por favor, lee cuidadosamente cada pregunta y califica del 1 al 5 donde: <br/>
              <b>1</b> = Muy Deficiente, <b>2</b> = Deficiente, <b>3</b> = Regular, <b>4</b> = Bueno, <b>5</b> = Excelente.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-fade-in">
          {activeSection.title !== 'Preguntas Generales' && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
              <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <i className="pi pi-bookmark text-indigo-500"></i>
                {activeSection.title}
              </h3>
            </div>
          )}

          <div className="p-6 flex flex-col gap-6">
            {activeSection.questions.map((q: any, idx: number) => {
              const qNumber = globalQuestionCounter + idx + 1;
              const currentVal = answers.find(a => a.questionId === q.id)?.answerValue;
              
              return (
                <div key={q.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-colors">
                  <h3 className="font-medium text-gray-800 mb-4 sm:text-lg leading-relaxed">
                    <span className="text-indigo-500 font-bold mr-2">{qNumber}.</span>
                    {q.questionText}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Muy Deficiente</span>
                    <Rating 
                      value={currentVal || 0} 
                      onChange={(e) => handleRatingChange(q.id, e.value ?? null)} 
                      cancel={false} 
                      stars={5}
                      pt={{
                        onIcon: { className: 'text-indigo-500 text-2xl sm:text-3xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full' },
                        offIcon: { className: 'text-gray-200 text-2xl sm:text-3xl focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-full' }
                      }}
                    />
                    <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">Excelente</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controles de Navegación */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <Button 
            label="Anterior" 
            icon="pi pi-arrow-left" 
            severity="secondary" 
            outlined
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentSectionIndex(prev => prev - 1);
            }}
            disabled={isFirstSection}
          />
          
          <div className="text-sm font-bold text-gray-400">
            Sección {currentSectionIndex + 1} de {sections.length}
          </div>

          {!isLastSection ? (
            <Button 
              label="Siguiente" 
              iconPos="right"
              icon="pi pi-arrow-right" 
              className="p-button-primary bg-indigo-600 border-indigo-600"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentSectionIndex(prev => prev + 1);
              }}
            />
          ) : (
            <Button 
              label="Enviar Evaluación" 
              iconPos="right"
              icon={submitting ? "pi pi-spin pi-spinner" : "pi pi-send"} 
              className="p-button-success bg-green-500 border-green-500"
              onClick={handleSubmit}
              disabled={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
