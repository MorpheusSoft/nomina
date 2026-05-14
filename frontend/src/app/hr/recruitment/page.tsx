'use client';

import { useState, useEffect } from 'react';
import { Star, Mail, Phone, ExternalLink, Search, Plus, QrCode, Copy, CheckCircle2, Minus } from 'lucide-react';
import api from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { QRCodeSVG } from 'qrcode.react';

export default function RecruitmentDashboard() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Process filters
  const [showClosedProcesses, setShowClosedProcesses] = useState(false);
  const [processSearchTerm, setProcessSearchTerm] = useState('');

  // Nuevo proceso form
  const [showNewProcess, setShowNewProcess] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [newProcessDescription, setNewProcessDescription] = useState('');
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  const [sendingExamTo, setSendingExamTo] = useState<string | null>(null);
  const [examTemplates, setExamTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // AI Feedback Modal
  const [viewingFeedback, setViewingFeedback] = useState<any | null>(null);
  const [loadingSummaryFor, setLoadingSummaryFor] = useState<string | null>(null);

  const handleViewHolisticSummary = async (applicationId: string) => {
    setLoadingSummaryFor(applicationId);
    try {
      const res = await api.get(`/job-applications/${applicationId}/holistic-summary`);
      if (res.data.error) {
        alert(res.data.error);
        return;
      }
      setViewingFeedback(res.data.data);
    } catch (e) {
      alert("Error al obtener el resumen. Es posible que el candidato no tenga exámenes completados aún.");
    } finally {
      setLoadingSummaryFor(null);
    }
  };

  // Hiring Modal
  const [hiringApp, setHiringApp] = useState<any | null>(null);
  const [closeVacancyOption, setCloseVacancyOption] = useState(true);
  const [hiringLoading, setHiringLoading] = useState(false);

  const executeHire = async () => {
    if (!hiringApp) return;
    setHiringLoading(true);
    try {
      await api.post(`/job-applications/${hiringApp.id}/hire`, { closeVacancy: closeVacancyOption });
      alert('¡Candidato contratado y ficha creada con éxito!');
      setHiringApp(null);
      fetchProcesses();
      fetchApplications(selectedProcessId!);
    } catch (e) {
      alert('Error al contratar al candidato.');
    } finally {
      setHiringLoading(false);
    }
  };

  // Interview Modal
  const [interviewingApp, setInterviewingApp] = useState<any | null>(null);
  const [interviewRating, setInterviewRating] = useState<number>(3);
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);

  const executeInterview = async () => {
    if (!interviewingApp) return;
    setInterviewLoading(true);
    try {
      await api.post(`/job-applications/${interviewingApp.id}/interviews`, {
        rating: interviewRating,
        feedback: interviewFeedback,
      });
      alert('Entrevista registrada con éxito.');
      setInterviewingApp(null);
      fetchApplications(selectedProcessId!);
    } catch (e) {
      alert('Error al registrar entrevista.');
    } finally {
      setInterviewLoading(false);
    }
  };

  // Cancel Vacancy
  const handleCancelProcess = async (id: string) => {
    const reason = prompt('¿Estás seguro de cancelar esta vacante? Ingresa el motivo (opcional):');
    if (reason === null) return; // User clicked Cancel
    try {
      await api.post(`/recruitment-processes/${id}/cancel`, { reason });
      alert('Vacante cancelada con éxito.');
      if (selectedProcessId === id) {
        setSelectedProcessId(null);
      }
      fetchProcesses();
    } catch (e) {
      alert('Error al cancelar la vacante.');
    }
  };

  // Reopen Vacancy
  const handleReopenProcess = async (id: string) => {
    if (!confirm('¿Estás seguro de reabrir esta vacante? Esto te permitirá contratar a un nuevo candidato.')) return;
    try {
      await api.post(`/recruitment-processes/${id}/reopen`);
      alert('Vacante reabierta exitosamente.');
      fetchProcesses();
    } catch (e) {
      alert('Error al reabrir la vacante.');
    }
  };

  // Reject Candidate
  const handleRejectCandidate = async (appId: string) => {
    if (!confirm('¿Estás seguro de descartar a este candidato? (Ej. rechazó la oferta o no cumple el perfil)')) return;
    try {
      await api.post(`/job-applications/${appId}/reject`);
      fetchApplications(selectedProcessId!);
    } catch (e) {
      alert('Error al descartar candidato.');
    }
  };

  // Restore Candidate
  const handleRestoreCandidate = async (appId: string) => {
    if (!confirm('¿Estás seguro de restaurar a este candidato? Volverá al estado "APLICADO"')) return;
    try {
      await api.post(`/job-applications/${appId}/restore`);
      fetchApplications(selectedProcessId!);
    } catch (e) {
      alert('Error al restaurar candidato.');
    }
  };

  // Candidate Profile Modal
  const [viewingCandidate, setViewingCandidate] = useState<any | null>(null);

  // QR Code Modal
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    fetchProcesses();
    fetchExamTemplates();
  }, []);

  const fetchExamTemplates = async () => {
    try {
      const res = await api.get('/exam-templates');
      setExamTemplates(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedProcessId) {
      fetchApplications(selectedProcessId);
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [selectedProcessId]);

  const fetchProcesses = async () => {
    try {
      const res = await api.get('/recruitment-processes');
      setProcesses(res.data);
      const openProcesses = res.data.filter((p: any) => p.status !== 'CLOSED');
      if (openProcesses.length > 0 && !selectedProcessId) {
        setSelectedProcessId(openProcesses[0].id);
      } else if (res.data.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching processes', error);
      setLoading(false);
    }
  };

  const fetchApplications = async (processId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/job-applications/process/${processId}`);
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications', error);
    } finally {
      setLoading(false);
    }
  };

  const [selectedExamsForNew, setSelectedExamsForNew] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const saveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProcessId) {
        const res = await api.put(`/recruitment-processes/${editingProcessId}`, {
          title: newProcessTitle,
          description: newProcessDescription,
          examTemplateIds: selectedExamsForNew
        });
        setProcesses(processes.map(p => p.id === editingProcessId ? { ...p, title: res.data.title, description: res.data.description, examTemplates: examTemplates.filter(t => selectedExamsForNew.includes(t.id)) } : p));
      } else {
        const res = await api.post('/recruitment-processes', { 
          title: newProcessTitle,
          description: newProcessDescription,
          examTemplateIds: selectedExamsForNew
        });
        setProcesses([res.data, ...processes]);
        setSelectedProcessId(res.data.id);
      }
      setShowNewProcess(false);
      setNewProcessTitle('');
      setNewProcessDescription('');
      setSelectedExamsForNew([]);
      setEditingProcessId(null);
    } catch (error) {
      console.error('Error saving process', error);
    }
  };

  const handleEditProcess = (p: any) => {
    setEditingProcessId(p.id);
    setNewProcessTitle(p.title);
    setNewProcessDescription(p.description || '');
    setSelectedExamsForNew(p.examTemplates ? p.examTemplates.map((t: any) => t.id) : []);
    setShowNewProcess(true);
    setSelectedProcessId(p.id);
  };

  const autoScreenCandidates = async () => {
    if (!selectedProcessId) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/job-applications/process/${selectedProcessId}/auto-screen`);
      alert(`Oráculo ha seleccionado a ${res.data.count} candidatos elegibles.`);
      fetchApplications(selectedProcessId);
    } catch (error) {
      console.error('Error auto screening', error);
      alert('Error en Oráculo.');
    } finally {
      setActionLoading(false);
    }
  };

  const bulkAssignExams = async () => {
    if (!selectedProcessId) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/job-applications/process/${selectedProcessId}/assign-exams`);
      alert(`Se asignaron exámenes y enlaces de portal a los candidatos elegibles (${res.data.assignedExamsCount} exámenes creados).`);
      fetchApplications(selectedProcessId);
    } catch (error) {
      console.error('Error assigning exams', error);
      alert('Error asignando exámenes.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStar = async (appId: string) => {
    try {
      const res = await api.put(`/job-applications/${appId}/star`);
      setApplications(applications.map(app => app.id === appId ? { ...app, isStarred: res.data.isStarred } : app));
    } catch (error) {
      console.error('Error toggling star', error);
    }
  };

  const toggleShortlist = async (appId: string, currentStatus: string) => {
    try {
      const isShortlisted = currentStatus !== 'SHORTLISTED';
      const res = await api.put(`/job-applications/${appId}/shortlist`, { isShortlisted });
      setApplications(applications.map(app => app.id === appId ? { ...app, status: res.data.status } : app));
    } catch (error) {
      console.error('Error toggling shortlist', error);
    }
  };

  const generateExamLink = async () => {
    if (!sendingExamTo || !selectedTemplateId) return;
    try {
      const res = await api.post('/candidate-exams/generate-link', {
        jobApplicationId: sendingExamTo,
        examTemplateId: selectedTemplateId
      });
      const link = `${window.location.origin}/exam/${res.data.token}`;
      setGeneratedLink(link);
    } catch (error) {
      console.error(error);
      alert('Error generando link');
    }
  };

  const visibleProcesses = processes
    .filter(p => showClosedProcesses ? true : p.status !== 'CLOSED')
    .filter(p => p.title.toLowerCase().includes(processSearchTerm.toLowerCase()));

  const isSelectedProcessVisible = visibleProcesses.some(p => p.id === selectedProcessId);

  const filteredApps = applications.filter(app => {
    const candidate = app.candidate;
    if (!candidate) return false;
    const term = searchTerm.toLowerCase();
    return (candidate.firstName && candidate.firstName.toLowerCase().includes(term)) ||
           (candidate.lastName && candidate.lastName.toLowerCase().includes(term)) ||
           (candidate.skills && Array.isArray(candidate.skills) && candidate.skills.some((s: string) => s.toLowerCase().includes(term)));
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reclutamiento (ATS)</h2>
            <p className="text-slate-500 mt-1">Gestiona vacantes y el embudo de contratación.</p>
          </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/hr/recruitment/exams'}
            className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg flex items-center hover:bg-indigo-50 transition shadow-sm font-medium"
          >
            Plantillas de Exámenes
          </button>
          <button 
            onClick={() => {
              setEditingProcessId(null);
              setNewProcessTitle('');
              setNewProcessDescription('');
              setSelectedExamsForNew([]);
              setShowNewProcess(!showNewProcess);
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Vacante
          </button>
        </div>
        </div>

      {showNewProcess && (
        <form onSubmit={saveProcess} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Vacante</label>
            <input 
              required 
              placeholder="Ej. Personal de Farmacia, Desarrollador Senior..." 
              value={newProcessTitle}
              onChange={(e) => setNewProcessTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción y Requisitos</label>
            <textarea 
              placeholder="Ej. Objetivo del cargo, responsabilidades, requisitos, experiencia necesaria..." 
              value={newProcessDescription}
              onChange={(e) => setNewProcessDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px]" 
            />
            <p className="text-xs text-slate-500 mt-1">Oráculo utilizará esta información para evaluar a los candidatos con mayor precisión.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Exámenes Obligatorios (Plantillas pre-asignadas)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {examTemplates.map(t => (
                <label key={t.id} className="flex items-center space-x-2 text-sm border p-2 rounded hover:bg-slate-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedExamsForNew.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedExamsForNew([...selectedExamsForNew, t.id]);
                      else setSelectedExamsForNew(selectedExamsForNew.filter(id => id !== t.id));
                    }}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="truncate">{t.name}</span>
                </label>
              ))}
              {examTemplates.length === 0 && <span className="text-sm text-slate-500">No hay plantillas creadas.</span>}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowNewProcess(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
              {editingProcessId ? 'Guardar Cambios' : 'Guardar Vacante'}
            </button>
          </div>
        </form>
      )}

      {processes.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar de Procesos */}
          <div className="w-full md:w-64 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wider">Vacantes</h3>
              <label className="flex items-center cursor-pointer text-xs text-slate-500">
                <span className="mr-2">Ver Cerradas</span>
                <input type="checkbox" checked={showClosedProcesses} onChange={(e) => setShowClosedProcesses(e.target.checked)} className="sr-only peer" />
                <div className="relative w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2" />
              <input 
                type="text"
                placeholder="Buscar vacante..." 
                value={processSearchTerm}
                onChange={(e) => setProcessSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {visibleProcesses.map(p => (
              <div key={p.id} className={`flex items-center w-full px-4 py-2 rounded-lg border transition-all ${selectedProcessId === p.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <button 
                  onClick={() => setSelectedProcessId(p.id)}
                  className="flex-1 text-left"
                >
                  <span className={`block font-bold ${p.status === 'CLOSED' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {p.title}
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-500">{p._count?.jobApplications || 0} candidatos</span>
                    {p.status === 'CLOSED' && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 rounded uppercase" title={p.closedReason || 'Cerrada'}>Cerrada</span>}
                  </div>
                  {p.closedReason && (
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 truncate" title={p.closedReason}>
                      {p.closedReason}
                    </div>
                  )}
                </button>
                <div className="flex flex-col gap-1 ml-2">
                  <button 
                    onClick={() => handleEditProcess(p)}
                    className="text-slate-400 hover:text-blue-600"
                    title="Editar"
                  >
                    <i className="pi pi-pencil text-xs"></i>
                  </button>
                  {p.status !== 'CLOSED' && (
                    <button 
                      onClick={() => handleCancelProcess(p.id)}
                      className="text-slate-400 hover:text-red-600"
                      title="Cancelar Vacante"
                    >
                      <i className="pi pi-times-circle text-xs"></i>
                    </button>
                  )}
                  {p.status === 'CLOSED' && (
                    <button 
                      onClick={() => handleReopenProcess(p.id)}
                      className="text-slate-400 hover:text-emerald-600"
                      title="Reabrir Vacante"
                    >
                      <i className="pi pi-refresh text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Área Principal de Candidatos */}
          <div className="flex-1 space-y-4">
            {selectedProcessId && isSelectedProcessVisible ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 px-5 py-4 rounded-xl border border-indigo-100 flex flex-col space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div>
                    <h4 className="text-indigo-900 font-bold text-lg flex items-center gap-2">
                      <QrCode className="w-5 h-5" /> Enlace de Postulación
                    </h4>
                    <p className="text-indigo-700 text-sm mt-1">
                      Comparte este enlace inteligente o escanea el QR.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <button 
                      onClick={() => {
                        const link = typeof window !== 'undefined' ? `${window.location.origin}/apply/${selectedProcessId}` : `/apply/${selectedProcessId}`;
                        navigator.clipboard.writeText(link);
                        alert('¡Enlace copiado al portapapeles!');
                      }}
                      className="flex items-center px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition shadow-sm font-medium text-sm"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copiar Link
                    </button>
                    <button 
                      onClick={() => setShowQrCode(true)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> Ver Código QR
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-200 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={autoScreenCandidates}
                    disabled={actionLoading}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                  >
                    ✨ Filtrar Top Candidatos con Oráculo
                  </button>
                  <button 
                    onClick={bulkAssignExams}
                    disabled={actionLoading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                  >
                    🚀 Enviar Exámenes a Candidatos Elegibles
                  </button>
                </div>
              </div>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <Search className="w-5 h-5 text-slate-400 ml-2" />
              <input 
                placeholder="Buscar por nombre o habilidad en esta vacante..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none shadow-none focus:outline-none text-lg text-slate-700 bg-transparent"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">Cargando candidatos del embudo...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <div key={app.id} className={`relative bg-white rounded-xl border-t-4 shadow-sm hover:shadow-md transition-shadow border border-slate-200 ${app.isStarred ? 'border-t-yellow-400' : 'border-t-slate-200'}`}>
                    <div className="absolute top-4 right-4 flex gap-2 items-center">
                      {app.status === 'HIRED' && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Contratado
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Descartado
                        </span>
                      )}
                      {app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                        <button onClick={() => toggleStar(app.id)} className="focus:outline-none transition-transform hover:scale-110">
                          <Star className={`w-6 h-6 ${app.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`} />
                        </button>
                      )}
                    </div>
                    
                    <div className="p-5 pb-3">
                      <h3 
                        className="text-xl font-semibold text-slate-900 pr-8 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => setViewingCandidate(app.candidate)}
                      >
                        {app.candidate?.firstName} {app.candidate?.lastName}
                      </h3>
                      <div className="text-sm text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">{app.candidate?.experienceYears} años</span> de experiencia
                      </div>
                    </div>
                    
                    <div className="p-5 pt-0 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {app.candidate?.skills && Array.isArray(app.candidate.skills) ? 
                          app.candidate.skills.slice(0, 4).map((skill: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {skill}
                            </span>
                          )) : null}
                        {app.candidate?.skills && app.candidate.skills.length > 4 && (
                           <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer" onClick={() => setViewingCandidate(app.candidate)}>
                             +{app.candidate.skills.length - 4} más
                           </span>
                        )}
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
                        <div className="flex items-center text-slate-600">
                          <Mail className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="truncate">{app.candidate?.email}</span>
                        </div>
                        {app.candidate?.phone && (
                          <div className="flex items-center text-slate-600">
                            <Phone className="w-4 h-4 mr-2 text-slate-400" />
                            {app.candidate.phone}
                          </div>
                        )}
                        {app.candidate?.resumeUrl && (
                          <div className="flex items-center text-blue-600 pt-1">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            <a href={app.candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                              Ver Currículum
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                        {app.status === 'SHORTLISTED' ? (
                          <button 
                            onClick={() => toggleShortlist(app.id, app.status)}
                            className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition text-xs font-bold px-2 py-1.5 rounded flex items-center justify-center w-full mb-1"
                          >
                            🌟 PRE-SELECCIONADO (Quitar)
                          </button>
                        ) : (
                          <div className="flex gap-2 mb-1">
                            {app.status !== 'REJECTED' && (
                              <button 
                                onClick={() => toggleShortlist(app.id, app.status)}
                                className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-bold px-2 py-1.5 rounded flex items-center justify-center"
                              >
                                Pre-seleccionar
                              </button>
                            )}
                            {app.status !== 'REJECTED' && (
                              <button 
                                onClick={() => handleRejectCandidate(app.id)}
                                className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 transition text-xs font-bold px-2 py-1.5 rounded flex items-center justify-center"
                                title="Descartar Candidato"
                              >
                                <i className="pi pi-ban mr-1"></i> Descartar
                              </button>
                            )}
                            {app.status === 'REJECTED' && (
                              <button 
                                onClick={() => handleRestoreCandidate(app.id)}
                                className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition text-xs font-bold px-2 py-1.5 rounded flex items-center justify-center"
                                title="Restaurar Candidato"
                              >
                                <i className="pi pi-refresh mr-1"></i> Restaurar
                              </button>
                            )}
                          </div>
                        )}
                        
                        {app.candidateExams && app.candidateExams.length > 0 ? (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-slate-700 uppercase">Exámenes Asignados</span>
                              <span className="text-sm font-black text-blue-700">{app.candidateExams.length}</span>
                            </div>
                            {app.candidateExams.some((ce: any) => ce.status === 'COMPLETED') && (
                              <button 
                                onClick={() => handleViewHolisticSummary(app.id)}
                                disabled={loadingSummaryFor === app.id}
                                className="w-full bg-indigo-600 text-white text-xs font-medium py-1.5 rounded-md hover:bg-indigo-700 flex justify-center items-center disabled:opacity-50"
                              >
                                {loadingSummaryFor === app.id ? 'Generando...' : '✨ Resumen Integral IA'}
                              </button>
                            )}
                          </div>
                        ) : null}

                        {app.status === 'SHORTLISTED' && (
                          <div className="flex gap-2 w-full mt-2">
                            <button 
                              onClick={() => {
                                setInterviewRating(3);
                                setInterviewFeedback('');
                                setInterviewingApp(app);
                              }}
                              className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 shadow-sm"
                            >
                              📝 Entrevista
                            </button>
                            <button 
                              onClick={() => setHiringApp(app)}
                              className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-md hover:bg-emerald-700 shadow-sm"
                            >
                              🎉 Contratar
                            </button>
                          </div>
                        )}

                        {app.portalToken ? (
                          <button 
                            onClick={() => {
                              const link = typeof window !== 'undefined' ? `${window.location.origin}/candidates/${app.portalToken}` : `/candidates/${app.portalToken}`;
                              navigator.clipboard.writeText(link);
                              alert('¡Enlace del Portal copiado al portapapeles!');
                            }}
                            className="w-full bg-slate-900 text-white font-medium hover:bg-slate-800 py-2 rounded-lg transition-colors text-sm"
                          >
                            Copiar Link de Portal
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSendingExamTo(app.id)}
                            className="w-full bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 py-2 rounded-lg transition-colors text-sm"
                          >
                            Asignar Individual
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredApps.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    No hay candidatos en este proceso aún.
                  </div>
                )}
              </div>
            )}
            </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
                <p>Selecciona una vacante de la barra lateral para ver sus candidatos.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
          <h3 className="text-xl font-medium text-slate-700 mb-2">No tienes vacantes abiertas</h3>
          <p className="text-slate-500">Crea tu primer proceso de reclutamiento para empezar a recibir candidatos.</p>
        </div>
      )}

      {/* Modal Enviar Examen */}
      {sendingExamTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Enviar Examen</h3>
            {generatedLink ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">¡Enlace generado exitosamente!</p>
                <div className="bg-slate-50 p-3 rounded border break-all text-sm font-mono text-slate-700">
                  {generatedLink}
                </div>
                <p className="text-sm text-slate-500">Copia este enlace y envíalo al candidato.</p>
                <button onClick={() => { setSendingExamTo(null); setGeneratedLink(''); }} className="w-full bg-slate-900 text-white py-2 rounded-lg">Cerrar</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 mb-4">Selecciona la plantilla de examen que deseas enviar a este candidato.</p>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  <option value="">-- Seleccionar Plantilla --</option>
                  {examTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setSendingExamTo(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button 
                    onClick={generateExamLink}
                    disabled={!selectedTemplateId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Generar Enlace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Análisis IA (Holístico) */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl max-w-3xl w-full shadow-2xl border border-indigo-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-3xl">✨</span> Resumen Integral Oráculo
              </h3>
              <div className="text-center px-4 py-2 bg-slate-100 rounded-lg">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cumplimiento</div>
                <div className={`text-2xl font-black ${viewingFeedback.porcentajeCumplimiento >= 80 ? 'text-green-600' : viewingFeedback.porcentajeCumplimiento >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {viewingFeedback.porcentajeCumplimiento}%
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl text-indigo-900 text-base leading-relaxed mb-6 font-medium">
              "{viewingFeedback.resumenParaAnalista}"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center"><Plus className="w-4 h-4 mr-1"/> Puntos Fuertes</h4>
                <ul className="space-y-2">
                  {viewingFeedback.puntosFuertes?.map((punto: string, i: number) => (
                    <li key={i} className="flex items-start text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center"><Minus className="w-4 h-4 mr-1"/> Áreas de Mejora</h4>
                <ul className="space-y-2">
                  {viewingFeedback.puntosDeMejora?.map((punto: string, i: number) => (
                    <li key={i} className="flex items-start text-sm text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"><span className="text-xs font-bold">-</span></div>
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <Star className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">Recomendación Final</div>
                  <div className="text-lg font-black text-slate-900">{viewingFeedback.recomendacionFinal}</div>
                </div>
              </div>
              <button 
                onClick={() => setViewingFeedback(null)} 
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg w-full md:w-auto"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contratar Candidato */}
      {hiringApp && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl border border-emerald-100">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
              🎉 ¡Contratar Candidato!
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Estás a punto de contratar a <strong className="text-slate-900">{hiringApp.candidate?.firstName} {hiringApp.candidate?.lastName}</strong>. 
              Esto creará automáticamente su Ficha de Trabajador preliminar en la base de datos de Nómina.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={closeVacancyOption} 
                  onChange={(e) => setCloseVacancyOption(e.target.checked)}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="block font-bold text-slate-800">Cerrar vacante y notificar</span>
                  <span className="block text-sm text-slate-500 mt-1">Marcará esta vacante como CERRADA y pasará al resto de los candidatos a estado RECHAZADO.</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setHiringApp(null)}
                disabled={hiringLoading}
                className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={executeHire}
                disabled={hiringLoading}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
              >
                {hiringLoading ? 'Procesando...' : 'Confirmar Contratación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Entrevista */}
      {interviewingApp && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl border border-blue-100">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
              📝 Registrar Entrevista
            </h3>
            <p className="text-slate-600 mb-4 text-sm">
              Ingresa el feedback de la entrevista para <strong>{interviewingApp.candidate?.firstName} {interviewingApp.candidate?.lastName}</strong>.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-1">Calificación (1-5)</label>
              <input 
                type="number" min="1" max="5" 
                value={interviewRating}
                onChange={(e) => setInterviewRating(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-1">Notas / Feedback</label>
              <textarea 
                rows={4}
                value={interviewFeedback}
                onChange={(e) => setInterviewFeedback(e.target.value)}
                placeholder="Observaciones de la entrevista..."
                className="w-full px-3 py-2 border rounded-md resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setInterviewingApp(null)}
                disabled={interviewLoading}
                className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={executeInterview}
                disabled={interviewLoading}
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50"
              >
                {interviewLoading ? 'Guardando...' : 'Guardar Entrevista'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Perfil del Candidato */}
      {viewingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{viewingCandidate.firstName} {viewingCandidate.lastName}</h3>
                <p className="text-slate-300 mt-1">{viewingCandidate.experienceYears} años de experiencia profesional</p>
              </div>
              <button onClick={() => setViewingCandidate(null)} className="text-slate-400 hover:text-white transition">
                <i className="pi pi-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {viewingCandidate.professionalSummary && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen Profesional (IA)</h4>
                  <p className="text-slate-700 leading-relaxed bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    {viewingCandidate.professionalSummary}
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Contacto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <Mail className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>{viewingCandidate.email}</span>
                  </div>
                  {viewingCandidate.phone && (
                    <div className="flex items-center text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <Phone className="w-5 h-5 mr-3 text-indigo-500" />
                      <span>{viewingCandidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Todas las Habilidades</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingCandidate.skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              {viewingCandidate.resumeUrl && (
                <a href={viewingCandidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center shadow-sm">
                  <ExternalLink className="w-4 h-4 mr-2" /> Ver PDF Original
                </a>
              )}
              <button onClick={() => setViewingCandidate(null)} className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code Vacante */}
      {showQrCode && selectedProcessId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-slate-800 text-center">Código QR de la Vacante</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Los candidatos pueden escanear esto para aplicar desde su celular.</p>
            <div className="p-4 bg-white border-4 border-indigo-50 rounded-xl mb-6">
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}/apply/${selectedProcessId}` : ''} 
                size={200}
                level="H"
                fgColor="#0f172a" 
                imageSettings={{
                  src: "/cloud-icon.svg",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
            <button 
              onClick={() => setShowQrCode(false)} 
              className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      </div>
    </AppLayout>
  );
}
