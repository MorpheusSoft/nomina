"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import api from '@/lib/api';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  
  // States for closing the review
  const [interviewSummary, setInterviewSummary] = useState('');
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [submittingClose, setSubmittingClose] = useState(false);

  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/evaluation-campaigns/${campaignId}`);
      setCampaign(res.data);
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la campaña.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PENDING') return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">PENDIENTE</span>;
    if (status === 'COMPLETED') return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">COMPLETADA</span>;
    return <span>{status}</span>;
  };

  const openReport = (review: any) => {
    if (!review.aiConsensusFeedback) {
      toast.current?.show({ severity: 'info', summary: 'Reporte en Proceso', detail: 'La IA todavía no ha generado el feedback o aún faltan respuestas.' });
      return;
    }
    
    // Parse the AI feedback
    let parsedFeedback = review.aiConsensusFeedback;
    if (typeof parsedFeedback === 'string') {
      try {
        parsedFeedback = JSON.parse(parsedFeedback);
      } catch (e) {
        console.error("Error parsing AI feedback", e);
      }
    }
    setSelectedFeedback({ ...parsedFeedback, review });
    setInterviewSummary(review.interviewSummary || '');
    setFinalScore(review.finalScore ? Number(review.finalScore) : parsedFeedback.overallConsensusScore || 0);
    setShowReportModal(true);
  };

  const handleCloseReview = async () => {
    if (!selectedFeedback?.review?.id) return;
    if (!interviewSummary || finalScore === null) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Complete el resumen y la puntuación final.' });
      return;
    }
    
    try {
      setSubmittingClose(true);
      await api.patch(`/evaluation-campaigns/${campaignId}/reviews/${selectedFeedback.review.id}/close`, {
        interviewSummary,
        finalScore
      });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Evaluación cerrada correctamente.' });
      setShowReportModal(false);
      loadCampaign(); // Reload to update status
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la evaluación.' });
    } finally {
      setSubmittingClose(false);
    }
  };

  const handleCloseCampaign = async () => {
    if (confirm('¿Está seguro de finalizar la campaña? Esto generará el Dashboard Analítico de Cierre.')) {
      try {
        await api.patch(`/evaluation-campaigns/${campaignId}`, { status: 'COMPLETED' });
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Campaña Cerrada Exitosamente.' });
        loadCampaign();
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la campaña.' });
      }
    }
  };

  const copyToClipboard = (token: string, type: string) => {
    const url = `${window.location.origin}/evaluate/${token}`;
    navigator.clipboard.writeText(url);
    toast.current?.show({ severity: 'success', summary: 'Copiado', detail: `Link para ${type} copiado al portapapeles.` });
  };

  // Helper to get chart data
  const getChartData = (feedback: any) => {
    if (!feedback || !feedback.competencyScores) return null;
    
    const labels = feedback.competencyScores.map((c: any) => c.competency);
    const selfScores = feedback.competencyScores.map((c: any) => c.selfScore || 0);
    const supervisorScores = feedback.competencyScores.map((c: any) => c.supervisorScore || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Autoevaluación',
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo 500
          borderColor: 'rgb(99, 102, 241)',
          data: selfScores
        },
        {
          label: 'Evaluación de Jefatura',
          backgroundColor: 'rgba(14, 165, 233, 0.8)', // Sky 500
          borderColor: 'rgb(14, 165, 233)',
          data: supervisorScores
        }
      ]
    };
  };

  const renderClosureDashboard = () => {
    if (!campaign || campaign.status !== 'COMPLETED') return null;

    const reviews = campaign.performanceReviews || [];
    const closedReviews = reviews.filter((r: any) => r.status === 'COMPLETED' && r.finalScore);
    
    if (closedReviews.length === 0) {
      return <div className="mb-8 p-6 bg-yellow-50 text-yellow-800 rounded-xl">No hay evaluaciones completadas para generar el dashboard.</div>;
    }

    const sorted = [...closedReviews].sort((a: any, b: any) => Number(b.finalScore) - Number(a.finalScore));
    const top5 = sorted.slice(0, 5);
    const bottom5 = sorted.slice().reverse().slice(0, 5);

    // 9-Box Grid Logic
    // X (Desempeño) = finalScore
    // Y (Potencial) = Pseudo-random por ahora (largo del nombre % 3 + 1)
    const getGridBox = (r: any) => {
      const perfScore = Number(r.finalScore);
      let x = 1; if (perfScore >= 3.5) x = 2; if (perfScore >= 4.5) x = 3;
      let y = (r.evaluatee.firstName.length % 3) + 1; 
      return `${x}-${y}`; // "1-1" to "3-3"
    };

    const boxes: any = {
      '1-3': { name: 'Enigma', color: 'bg-yellow-100', users: [] },
      '2-3': { name: 'Alto Potencial', color: 'bg-green-100', users: [] },
      '3-3': { name: 'Súper Estrella', color: 'bg-green-200', users: [] },
      '1-2': { name: 'Dilema', color: 'bg-orange-100', users: [] },
      '2-2': { name: 'Empleado Clave', color: 'bg-blue-100', users: [] },
      '3-2': { name: 'Alto Desempeño', color: 'bg-green-100', users: [] },
      '1-1': { name: 'Riesgo', color: 'bg-red-100', users: [] },
      '2-1': { name: 'Efectivo', color: 'bg-yellow-100', users: [] },
      '3-1': { name: 'Profesional Confiable', color: 'bg-blue-100', users: [] },
    };

    closedReviews.forEach((r: any) => {
      const boxId = getGridBox(r);
      if (boxes[boxId]) boxes[boxId].users.push(r);
    });

    // Radar Global
    const globalCompetencies: any = {};
    closedReviews.forEach((r: any) => {
       let fb = r.aiConsensusFeedback;
       if (typeof fb === 'string') { try { fb = JSON.parse(fb); } catch(e){} }
       if (fb?.competencyScores) {
          fb.competencyScores.forEach((c: any) => {
             if (!globalCompetencies[c.competency]) globalCompetencies[c.competency] = { total: 0, count: 0 };
             globalCompetencies[c.competency].total += (c.selfScore + c.supervisorScore) / 2;
             globalCompetencies[c.competency].count += 1;
          });
       }
    });

    const radarLabels = Object.keys(globalCompetencies);
    const radarData = radarLabels.map(l => globalCompetencies[l].total / globalCompetencies[l].count);
    
    const globalRadarChartData = {
      labels: radarLabels,
      datasets: [{
        label: 'Promedio Global de la Empresa',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        pointBackgroundColor: 'rgb(99, 102, 241)',
        data: radarData
      }]
    };

    return (
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <i className="pi pi-chart-pie text-3xl text-indigo-600"></i>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Analítico de Cierre</h2>
            <p className="text-gray-500">Inteligencia de Negocios y Talentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 9-BOX GRID */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-center">Matriz de Talento (9-Box Grid)</h3>
            <div className="grid grid-cols-3 grid-rows-3 gap-2 h-96 relative">
              {/* Overlay labels */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-gray-400">POTENCIAL</div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400">DESEMPEÑO</div>

              {['1-3', '2-3', '3-3', '1-2', '2-2', '3-2', '1-1', '2-1', '3-1'].map(id => (
                <div key={id} className={`${boxes[id].color} p-2 rounded flex flex-col items-center justify-center text-center overflow-hidden border border-white`}>
                  <span className="text-[10px] font-bold text-gray-600 uppercase mb-1">{boxes[id].name}</span>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {boxes[id].users.map((u:any) => (
                      <div key={u.id} className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-800 shadow-sm tooltip-trigger" title={`${u.evaluatee.firstName} ${u.evaluatee.lastName}`}>
                        {u.evaluatee.firstName[0]}{u.evaluatee.lastName[0]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RADAR GLOBAL */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-4 text-center">Radar de Competencias de la Empresa</h3>
            <div className="w-full relative h-[350px]">
               <Chart 
                  type="radar" 
                  className="w-full h-full"
                  data={globalRadarChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, backdropColor: 'transparent' } } },
                  }} 
                />
            </div>
          </div>
        </div>

        {/* RANKINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-2">
              <i className="pi pi-star-fill text-green-600"></i>
              <h3 className="font-bold text-green-900">Top 5 Performers</h3>
            </div>
            <ul className="divide-y divide-gray-100 p-4">
              {top5.map((r: any, idx: number) => (
                <li key={r.id} className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-800">{idx+1}. {r.evaluatee.firstName} {r.evaluatee.lastName}</span>
                  <span className="font-bold text-green-600">{Number(r.finalScore).toFixed(1)} / 5</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
              <i className="pi pi-arrow-down text-red-600"></i>
              <h3 className="font-bold text-red-900">Bottom 5 (Áreas de Oportunidad)</h3>
            </div>
            <ul className="divide-y divide-gray-100 p-4">
              {bottom5.map((r: any, idx: number) => (
                <li key={r.id} className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-800">{idx+1}. {r.evaluatee.firstName} {r.evaluatee.lastName}</span>
                  <span className="font-bold text-red-600">{Number(r.finalScore).toFixed(1)} / 5</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <ProgressSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="p-6">Error: Campaña no encontrada</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button icon="pi pi-arrow-left" rounded text severity="secondary" onClick={() => router.push('/hr/evaluations/campaigns')} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">Dashboard de Avance y Resultados</p>
          </div>
          <div className="ml-auto flex gap-2">
            {campaign.status === 'DRAFT' && <span className="px-3 py-1 bg-gray-200 text-gray-700 font-bold rounded">BORRADOR</span>}
            {campaign.status === 'ACTIVE' && (
              <>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded flex items-center">ACTIVA</span>
                <Button label="Finalizar Campaña" severity="warning" onClick={handleCloseCampaign} className="ml-2" />
              </>
            )}
            {campaign.status === 'COMPLETED' && <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold rounded">CERRADA / FINALIZADA</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <i className="pi pi-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Trabajadores a Evaluar</p>
              <p className="text-2xl font-bold text-gray-800">{campaign.performanceReviews?.length || 0}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <i className="pi pi-check-circle text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Evaluaciones Completadas</p>
              <p className="text-2xl font-bold text-gray-800">
                {campaign.performanceReviews?.filter((r: any) => r.status === 'COMPLETED').length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard de Cierre */}
        {renderClosureDashboard()}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Seguimiento de Personal</h2>
          <DataTable value={campaign.performanceReviews} emptyMessage="No hay trabajadores en esta campaña." stripedRows>
            <Column header="Trabajador" body={(r) => `${r.evaluatee.firstName} ${r.evaluatee.lastName}`} className="font-medium" />
            <Column header="Evaluador (Supervisor)" body={(r) => `${r.supervisor.firstName} ${r.supervisor.lastName}`} />
            <Column header="Estado Global" body={(r) => getStatusBadge(r.status)} />
            
            <Column header="Avance (Tokens)" body={(r) => {
              const selfInst = r.instances?.find((i: any) => i.evaluatorType === 'SELF');
              const supInst = r.instances?.find((i: any) => i.evaluatorType === 'SUPERVISOR');
              
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-16 font-medium text-gray-500 text-xs">SELF:</span>
                    {selfInst?.status === 'COMPLETED' ? (
                      <i className="pi pi-check text-green-500 font-bold" title="Completada"></i>
                    ) : (
                      <Button 
                        icon="pi pi-link" 
                        size="small" 
                        rounded 
                        text 
                        tooltip="Copiar Link Trabajador"
                        onClick={() => copyToClipboard(selfInst?.token, 'Trabajador')}
                        disabled={!selfInst}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-16 font-medium text-gray-500 text-xs">SUPERVISOR:</span>
                    {supInst?.status === 'COMPLETED' ? (
                      <i className="pi pi-check text-green-500 font-bold" title="Completada"></i>
                    ) : (
                      <Button 
                        icon="pi pi-link" 
                        size="small" 
                        rounded 
                        text 
                        severity="secondary"
                        tooltip="Copiar Link Jefe"
                        onClick={() => copyToClipboard(supInst?.token, 'Jefe')}
                        disabled={!supInst}
                      />
                    )}
                  </div>
                </div>
              );
            }} />

            <Column header="Reporte IA" body={(r) => (
              <div className="flex gap-2">
                <Button 
                  label={r.aiConsensusFeedback ? "Ver" : "Pendiente"}
                  icon={r.aiConsensusFeedback ? "pi pi-chart-bar" : "pi pi-clock"} 
                  size="small"
                  severity={r.aiConsensusFeedback ? "info" : "secondary"}
                  outlined={!r.aiConsensusFeedback}
                  onClick={() => openReport(r)}
                  disabled={!r.aiConsensusFeedback}
                />
                {r.status === 'COMPLETED' && (
                  <Button 
                    icon="pi pi-file-pdf"
                    severity="danger"
                    size="small"
                    outlined
                    tooltip="Descargar PDF"
                    onClick={() => window.open(`/hr/evaluations/reports/${r.id}?campaignId=${campaignId}`, '_blank')}
                  />
                )}
              </div>
            )} />
          </DataTable>
        </div>
      </div>

      {/* Modal del Reporte IA */}
      <Dialog 
        header={<span className="text-xl font-bold text-indigo-900 flex items-center gap-2"><i className="pi pi-sparkles text-indigo-500"></i> Reporte de Consenso IA (Nebula Oracle)</span>} 
        visible={showReportModal} 
        style={{ width: '90vw', maxWidth: '1000px' }} 
        onHide={() => setShowReportModal(false)}
        maximizable
        className="backdrop-blur-sm"
      >
        {selectedFeedback && (
          <div className="flex flex-col gap-6 pt-4">
            
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">EVALUADO</p>
                <p className="text-xl font-bold text-gray-800">{selectedFeedback.review.evaluatee.firstName} {selectedFeedback.review.evaluatee.lastName}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Puntuación Promedio de Consenso</p>
                <div className="text-3xl font-extrabold text-indigo-600">
                  {selectedFeedback.overallConsensusScore ? selectedFeedback.overallConsensusScore.toFixed(1) : '-'} <span className="text-lg text-gray-400">/ 5.0</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart -> Now Bar Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-gray-800 mb-6 self-start w-full border-b pb-2">Gráfico de Brechas</h3>
                <div className="w-full relative h-[450px]">
                  {getChartData(selectedFeedback) && (
                    <Chart 
                      type="bar" 
                      className="w-full h-full"
                      data={getChartData(selectedFeedback) || {}} 
                      options={{ 
                        indexAxis: 'y',
                        responsive: true, 
                        maintainAspectRatio: false,
                        layout: { padding: 0 },
                        scales: { 
                          x: { 
                            min: 0, 
                            max: 5, 
                            ticks: { stepSize: 1 }
                          },
                          y: {
                            ticks: { 
                              font: { size: 11 },
                              autoSkip: false // Force show all labels
                            }
                          }
                        },
                        plugins: { legend: { position: 'bottom' } }
                      }} 
                    />
                  )}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="pi pi-align-left text-indigo-500"></i> Resumen Ejecutivo
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedFeedback.executiveSummary || 'Sin resumen disponible.'}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex-1">
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <i className="pi pi-thumbs-up-fill text-green-500"></i> Puntos Fuertes
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 mb-6">
                    {selectedFeedback.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No especificado</li>}
                  </ul>

                  <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2 mt-4">
                    <i className="pi pi-exclamation-triangle text-amber-500"></i> Áreas de Mejora
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1">
                    {selectedFeedback.areasForImprovement?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No especificado</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-2 mb-6">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <i className="pi pi-book text-indigo-600"></i> Recomendaciones de Desarrollo y Formación
              </h3>
              <div className="text-sm text-indigo-800 leading-relaxed">
                <ul className="list-disc list-inside">
                  {selectedFeedback.trainingRecommendations?.map((r: string, i: number) => <li key={i}>{r}</li>) || <li>No especificado</li>}
                </ul>
              </div>
            </div>

            {/* Formulario de Cierre de Evaluación */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="pi pi-check-square text-green-600"></i> Cierre de Evaluación y Entrevista
              </h3>
              <p className="text-sm text-gray-500 mb-4">Complete este formulario durante o después de la entrevista 1 a 1 con el trabajador para cerrar formalmente el ciclo de evaluación.</p>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Resumen y Acuerdos de la Entrevista</label>
                  <InputTextarea 
                    rows={4} 
                    className="w-full" 
                    value={interviewSummary}
                    onChange={(e) => setInterviewSummary(e.target.value)}
                    placeholder="Escriba los puntos clave discutidos, compromisos adquiridos y metas fijadas para el próximo ciclo..."
                    disabled={selectedFeedback.review.status === 'COMPLETED'}
                  />
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Puntuación Final Acordada (0.0 - 5.0)</label>
                    <InputNumber 
                      value={finalScore} 
                      onValueChange={(e) => setFinalScore(e.value ?? null)} 
                      min={0} max={5} maxFractionDigits={1} 
                      showButtons
                      inputClassName="w-24 text-center font-bold text-lg"
                      disabled={selectedFeedback.review.status === 'COMPLETED'}
                    />
                  </div>
                  
                  <div className="ml-auto mt-6">
                    {selectedFeedback.review.status === 'COMPLETED' ? (
                      <span className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                        <i className="pi pi-check-circle"></i> Evaluación Cerrada
                      </span>
                    ) : (
                      <Button 
                        label="Cerrar Evaluación" 
                        icon={submittingClose ? "pi pi-spin pi-spinner" : "pi pi-lock"} 
                        severity="success"
                        disabled={submittingClose}
                        onClick={handleCloseReview}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Dialog>

    </AppLayout>
  );
}
