'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, PlayCircle, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function CandidatePortal() {
  const { portalToken } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (portalToken) {
      fetchPortalData();
    }
  }, [portalToken]);

  const fetchPortalData = async () => {
    try {
      const res = await api.get(`/candidates/portal/${portalToken}`);
      setData(res.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Portal no encontrado o expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Cargando portal...</div>;
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-slate-600">{errorMsg || 'Acceso denegado. Verifica el enlace.'}</p>
        </div>
      </div>
    );
  }

  const { candidate, recruitmentProcess, candidateExams } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Portal del Candidato</span>
          </div>
          <div className="flex items-center text-sm font-medium text-slate-600">
            <span className="mr-4 hidden sm:inline-block">Hola, {candidate.firstName}</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
              <span className="text-slate-500 font-bold">{candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Banner de Bienvenida */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Bienvenido a tu proceso de selección</h1>
            <p className="text-slate-300 max-w-2xl text-lg">
              Estás postulando para la posición de <span className="font-semibold text-white">{recruitmentProcess.name}</span>. 
              A continuación encontrarás las evaluaciones necesarias para continuar.
            </p>
          </div>
        </div>

        {/* Evaluaciones */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            Tus Evaluaciones Asignadas
          </h2>
          
          <div className="grid gap-4">
            {candidateExams && candidateExams.length > 0 ? (
              candidateExams.map((exam: any, idx: number) => {
                const isCompleted = exam.status === 'COMPLETED';
                const isPending = exam.status === 'PENDING' || exam.status === 'STARTED';
                
                return (
                  <div key={exam.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {exam.examTemplate?.name || `Evaluación #${idx + 1}`}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {exam.examTemplate?.description || 'Por favor, completa esta evaluación para avanzar en el proceso.'}
                        </p>
                        {exam.examTemplate?.timeLimitMinutes && (
                          <div className="mt-2 inline-flex items-center text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" /> Límite: {exam.examTemplate.timeLimitMinutes} minutos
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200 flex items-center justify-center w-full sm:w-auto">
                          Completado
                        </div>
                      ) : (
                        <button 
                          onClick={() => router.push(`/exam/${exam.token}`)}
                          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center w-full sm:w-auto"
                        >
                          <PlayCircle className="w-5 h-5 mr-2" /> 
                          {exam.status === 'STARTED' ? 'Continuar' : 'Iniciar Evaluación'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
                Aún no tienes evaluaciones asignadas. RRHH te notificará cuando estén listas.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
