"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import api from '@/lib/api';

export default function PerformanceReportPdf() {
  const params = useParams();
  const reviewId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (reviewId) {
      loadReport();
    }
  }, [reviewId]);

  const loadReport = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const campaignId = searchParams.get('campaignId');
      if (!campaignId) throw new Error("No campaignId provided");

      const res = await api.get(`/evaluation-campaigns/${campaignId}/reviews/${reviewId}`);
      
      let fb = res.data.aiConsensusFeedback;
      if (typeof fb === 'string') {
        try { fb = JSON.parse(fb); } catch(e){}
      }
      setData({ ...res.data, feedback: fb });
      
      // Auto trigger print dialogue after 1 second to allow charts to render
      setTimeout(() => {
        window.print();
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><ProgressSpinner /></div>;
  }

  if (error || !data) {
    return <div className="p-10 text-red-500">Error cargando el reporte.</div>;
  }

  const { evaluatee, supervisor, campaign, feedback, interviewSummary, finalScore } = data;

  // Chart data
  let chartData = null;
  if (feedback?.competencyScores) {
    const labels = feedback.competencyScores.map((c: any) => c.competency);
    const selfScores = feedback.competencyScores.map((c: any) => c.selfScore || 0);
    const supervisorScores = feedback.competencyScores.map((c: any) => c.supervisorScore || 0);

    chartData = {
      labels,
      datasets: [
        { label: 'Autoevaluación', backgroundColor: 'rgba(99, 102, 241, 0.8)', data: selfScores },
        { label: 'Evaluación de Jefatura', backgroundColor: 'rgba(14, 165, 233, 0.8)', data: supervisorScores }
      ]
    };
  }

  return (
    <div className="bg-white min-h-screen text-gray-800 p-8 print:p-0 print:m-0" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .no-print { display: none; }
          .page-break { page-break-before: always; }
        }
      `}} />

      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-1">Informe de Desempeño 360</h1>
          <p className="text-gray-500 text-lg uppercase tracking-wider">{campaign?.name || 'Evaluación Anual'}</p>
        </div>
        <div className="text-right">
          <img src="/logo.png" alt="Nebula Logo" className="h-10 mb-2 opacity-80" onError={(e) => e.currentTarget.style.display = 'none'} />
          <p className="text-sm font-bold text-gray-400">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Info Block */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Trabajador Evaluado</p>
          <p className="text-xl font-bold text-gray-800">{evaluatee.firstName} {evaluatee.lastName}</p>
          <p className="text-sm text-gray-500">{evaluatee.documentNumber}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Supervisor / Jefatura</p>
          <p className="text-xl font-bold text-gray-800">{supervisor.firstName} {supervisor.lastName}</p>
        </div>
      </div>

      {/* Scores Block */}
      <div className="flex gap-6 mb-10">
        <div className="flex-1 bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-indigo-800 uppercase mb-1">Consenso Sugerido IA</p>
            <p className="text-xs text-indigo-600">Promedio general ponderado</p>
          </div>
          <div className="text-4xl font-extrabold text-indigo-600">
            {feedback?.overallConsensusScore ? feedback.overallConsensusScore.toFixed(1) : '-'} <span className="text-xl text-indigo-300">/ 5</span>
          </div>
        </div>

        <div className="flex-1 bg-green-50 border border-green-100 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-800 uppercase mb-1">Calificación Final</p>
            <p className="text-xs text-green-600">Acordada en Entrevista</p>
          </div>
          <div className="text-4xl font-extrabold text-green-600">
            {finalScore ? Number(finalScore).toFixed(1) : '-'} <span className="text-xl text-green-300">/ 5</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Análisis de Brechas (Autoevaluación vs Jefatura)</h2>
          <div className="w-full relative h-[450px]">
            <Chart 
              type="bar" 
              className="w-full h-full"
              data={chartData} 
              options={{ 
                indexAxis: 'y',
                responsive: true, 
                maintainAspectRatio: false,
                animation: false, // Turn off animation for print
                scales: { 
                  x: { min: 0, max: 5, ticks: { stepSize: 1 } },
                  y: { ticks: { font: { size: 10 }, autoSkip: false } }
                },
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>
      )}

      <div className="page-break"></div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Resumen Ejecutivo (Oráculo IA)</h2>
        <p className="text-gray-700 text-sm leading-relaxed text-justify">
          {feedback?.executiveSummary || 'Sin resumen disponible.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-bold text-green-700 mb-4 border-b pb-2 border-green-200">Puntos Fuertes</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 flex flex-col gap-2">
            {feedback?.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No especificado</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold text-amber-700 mb-4 border-b pb-2 border-amber-200">Áreas de Mejora</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 flex flex-col gap-2">
            {feedback?.areasForImprovement?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No especificado</li>}
          </ul>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-indigo-700 mb-4 border-b pb-2 border-indigo-200">Recomendaciones de Desarrollo</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 flex flex-col gap-2">
          {feedback?.trainingRecommendations?.map((r: string, i: number) => <li key={i}>{r}</li>) || <li>No especificado</li>}
        </ul>
      </div>

      {/* Interview Summary */}
      <div className="mb-16">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Acuerdos de la Entrevista</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[150px]">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {interviewSummary || 'No se registraron acuerdos en la entrevista.'}
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-10 mt-16 pt-8 border-t border-gray-200">
        <div className="text-center">
          <div className="h-16 border-b border-gray-400 mb-2 w-3/4 mx-auto"></div>
          <p className="font-bold text-gray-800">{evaluatee.firstName} {evaluatee.lastName}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Firma del Trabajador</p>
        </div>
        <div className="text-center">
          <div className="h-16 border-b border-gray-400 mb-2 w-3/4 mx-auto"></div>
          <p className="font-bold text-gray-800">{supervisor.firstName} {supervisor.lastName}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Firma de Jefatura</p>
        </div>
      </div>
      
      {/* Print button for screen only */}
      <div className="mt-20 text-center no-print">
        <button onClick={() => window.print()} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-indigo-700">
          Imprimir / Guardar PDF
        </button>
      </div>

    </div>
  );
}
