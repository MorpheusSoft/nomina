'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ExamRunner() {
  const { token } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{questionId: string, selectedText: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token]);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/candidate-exams/take/${token}`);
      const data = res.data;
      setExam(data);

      // Si ya estaba iniciado y tiene limite de tiempo, calcular tiempo restante real basándose en startedAt
      if (data.status === 'STARTED' && data.timeLimitMinutes && data.startedAt) {
        const startedTime = new Date(data.startedAt).getTime();
        const limitMs = data.timeLimitMinutes * 60 * 1000;
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((limitMs - (now - startedTime)) / 1000));
        
        if (remaining <= 0) {
          setError('El tiempo para este examen ha expirado.');
        } else {
          setTimeLeft(remaining);
          setStarted(true);
          startTimer(remaining);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (initialSeconds: number) => {
    let current = initialSeconds;
    timerRef.current = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(timerRef.current!);
        setTimeLeft(0);
        autoSubmit();
      } else {
        setTimeLeft(current);
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      if (exam.status === 'PENDING') {
        const res = await api.post(`/candidate-exams/take/${token}/start`);
        const data = res.data;
        // Update exam state with startedAt from server if needed
        setExam({ ...exam, status: 'STARTED', startedAt: data.startedAt });
        
        if (exam.timeLimitMinutes) {
          const limitSeconds = exam.timeLimitMinutes * 60;
          setTimeLeft(limitSeconds);
          startTimer(limitSeconds);
        }
      }
      setStarted(true);
      
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log('Fullscreen rejected', e));
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSelectAnswer = (questionId: string, selectedText: string, isMultiple: boolean = false) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      
      if (!isMultiple) {
        if (existing) {
          return prev.map(a => a.questionId === questionId ? { ...a, selectedText } : a);
        }
        return [...prev, { questionId, selectedText }];
      }

      // Handle multiple choice (checkbox)
      let currentArr = existing && existing.selectedText ? existing.selectedText.split(' | ') : [];
      if (currentArr.includes(selectedText)) {
        currentArr = currentArr.filter(t => t !== selectedText);
      } else {
        currentArr.push(selectedText);
      }
      const newText = currentArr.join(' | ');
      
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, selectedText: newText } : a);
      }
      return [...prev, { questionId, selectedText: newText }];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await api.post(`/candidate-exams/take/${token}/submit`, { answers });
      const data = res.data;
      setScore(data.score);
      
      // Salir de fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    } catch (err: any) {
      alert(err.message);
      // Restart timer if submission failed due to network error and there's time left
      if (timeLeft && timeLeft > 0) startTimer(timeLeft);
    } finally {
      setSubmitting(false);
    }
  };

  const autoSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/candidate-exams/take/${token}/submit`, { answers });
      const data = res.data;
      setScore(data.score);
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(e => console.log(e));
    } catch (err: any) {
      console.error('AutoSubmit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-slate-500 font-medium">Cargando evaluación...</p></div></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border-t-4 border-red-500">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Examen Bloqueado</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    </div>
  );

  if (score !== null) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md text-center border border-slate-100">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Evaluación Completada</h2>
        <p className="text-slate-600 mb-8 text-lg">Tus respuestas han sido registradas exitosamente y enviadas al equipo de RRHH.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Cerrar Pestaña
        </button>
      </div>
    </div>
  );

  if (!started) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 to-slate-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <span className="font-black text-2xl">N</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{exam.templateName}</h1>
        <p className="text-xl text-slate-600 mb-8 font-medium">Postulante: <span className="text-slate-900">{exam.candidateName}</span></p>
        
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-10 shadow-sm">
          <h3 className="text-amber-900 font-bold mb-3 text-lg flex items-center gap-2">
            ⚠️ Reglas de la Evaluación
          </h3>
          <ul className="text-amber-800 space-y-2 font-medium">
            <li className="flex items-start gap-2"><span className="text-amber-500">•</span> Al comenzar, entrarás en modo pantalla completa para evitar distracciones.</li>
            <li className="flex items-start gap-2"><span className="text-amber-500">•</span> No cierres esta pestaña. El progreso podría perderse.</li>
            {exam.timeLimitMinutes && (
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span> 
                <span>Tienes un límite estricto de <strong>{exam.timeLimitMinutes} minutos</strong>. Al agotarse, se enviará automáticamente.</span>
              </li>
            )}
          </ul>
        </div>

        <button 
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-3"
        >
          <PlayCircle className="w-6 h-6" /> Comenzar Ahora
        </button>
      </div>
    </div>
  );

  const q = exam.questions[currentIndex];
  const isLast = currentIndex === exam.questions.length - 1;
  const isFirst = currentIndex === 0;
  const progressPercentage = ((currentIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Fijo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pregunta {currentIndex + 1} de {exam.questions.length}</span>
            <div className="w-32 sm:w-64 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border shadow-sm transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </header>

      {/* Main Content (Diapositiva) */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all">
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 leading-tight">
              {q.questionText}
            </h2>
            
            {q.imageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                <img src={q.imageUrl} alt="Referencia visual" className="w-full h-auto object-contain max-h-96" />
              </div>
            )}

            {q.options && q.options.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const correctCount = q.options.filter((o: any) => o.isCorrect).length;
                  const isMultiple = correctCount > 1;
                  
                  return q.options.map((opt: any, oIdx: number) => {
                    const existingAnswer = answers.find(a => a.questionId === q.id)?.selectedText || '';
                    const isSelected = isMultiple ? existingAnswer.split(' | ').includes(opt.text) : existingAnswer === opt.text;
                    
                    return (
                      <label 
                        key={oIdx} 
                        className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-900/5 translate-x-1' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <input 
                          type={isMultiple ? "checkbox" : "radio"} 
                          name={`question-${q.id}${isMultiple ? `-${oIdx}` : ''}`} 
                          className={`w-6 h-6 text-blue-600 border-slate-300 ${isMultiple ? 'rounded-md' : ''} focus:ring-blue-500 focus:ring-offset-2`} 
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(q.id, opt.text, isMultiple)}
                        />
                        <span className={`ml-4 text-lg ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>{opt.text}</span>
                      </label>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="mt-4">
                <textarea 
                  className="w-full border-2 border-slate-200 rounded-2xl p-6 text-lg text-slate-800 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner bg-slate-50" 
                  rows={6} 
                  placeholder="Desarrolla tu respuesta aquí detalladamente..."
                  value={answers.find(a => a.questionId === q.id)?.selectedText || ''}
                  onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={isFirst}
              className="flex items-center px-4 py-2 text-slate-500 font-medium hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
            </button>
            
            {!isLast ? (
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
                className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
              >
                Siguiente <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all shadow-md hover:shadow-lg hover:shadow-green-600/20 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Finalizar y Enviar'} <CheckCircle2 className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
