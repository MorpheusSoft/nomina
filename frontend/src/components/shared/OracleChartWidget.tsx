import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

export default function OracleChartWidget({ data, type }: { data: any[], type: 'bar' | 'pie' | 'line' }) {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Colores corporativos (Indigo, Emerald, Sky, Violet, Rose, Amber, Slate)
    const backgroundColors = [
      'rgba(79, 70, 229, 0.8)', // Indigo 600
      'rgba(16, 185, 129, 0.8)', // Emerald 500
      'rgba(14, 165, 233, 0.8)', // Sky 500
      'rgba(139, 92, 246, 0.8)', // Violet 500
      'rgba(244, 63, 94, 0.8)', // Rose 500
      'rgba(245, 158, 11, 0.8)', // Amber 500
      'rgba(100, 116, 139, 0.8)' // Slate 500
    ];
    
    const borderColors = backgroundColors.map(c => c.replace('0.8', '1'));

    const labels = data.map((d: any) => String(d.label || 'N/A'));
    const values = data.map((d: any) => Number(d.value || 0));

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const config = {
      labels: labels,
      datasets: [
        {
          label: 'Monto / Cantidad',
          data: values,
          backgroundColor: type === 'pie' ? backgroundColors.slice(0, data.length) : backgroundColors[0],
          borderColor: type === 'pie' ? borderColors.slice(0, data.length) : borderColors[0],
          borderWidth: type === 'line' ? 2 : 1,
          fill: type === 'line' ? false : undefined,
          tension: type === 'line' ? 0.4 : undefined
        }
      ]
    };

    const options = {
      plugins: {
        legend: {
          display: type === 'pie',
          position: 'bottom',
          labels: { color: textColor, font: { size: 10 } }
        }
      },
      scales: (type === 'bar' || type === 'line') ? {
        x: {
          ticks: { color: textColorSecondary, font: { size: 10 } },
          grid: { color: surfaceBorder, display: false }
        },
        y: {
          ticks: { color: textColorSecondary, font: { size: 10 } },
          grid: { color: surfaceBorder }
        }
      } : undefined,
      maintainAspectRatio: false,
      responsive: true
    };

    setChartData(config);
    setChartOptions(options);
  }, [data, type]);

  if (!data || data.length === 0) {
    return <div className="text-xs text-slate-500 italic p-4 text-center border border-slate-200 rounded-md bg-slate-50">No hay datos suficientes para graficar.</div>;
  }

  return (
    <div className="mt-3 p-4 border border-slate-200 rounded-xl bg-white/80 shadow-sm backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
      <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Visualización de Datos</h4>
      <div style={{ position: 'relative', height: '200px', width: '100%' }}>
         <Chart type={type} data={chartData} options={chartOptions} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
