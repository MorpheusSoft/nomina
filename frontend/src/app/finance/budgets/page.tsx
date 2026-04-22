"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import api from '@/lib/api';

export default function BudgetControlPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCurrency, setViewCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await api.get('/departments/metrics/budget');
      const sorted = res.data.metrics.sort((a: any, b: any) => b.percentage - a.percentage);
      setMetrics(sorted);
      setExchangeRate(res.data.currentExchangeRate || 1);
    } catch (error) {
      console.error('Error loading budget metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMultiplier = () => viewCurrency === 'USD' ? 1 : exchangeRate;

  const formatDynCurrency = (val: number) => {
    const finalVal = val * getMultiplier();
    return new Intl.NumberFormat(viewCurrency === 'VES' ? 'es-VE' : 'en-US', { 
      style: 'currency', 
      currency: viewCurrency 
    }).format(finalVal);
  };

  const statusTemplate = (rowData: any) => {
    if (rowData.budget === 0) return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Sin Límite</span>;
    if (rowData.percentage >= 100) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Excedido</span>;
    if (rowData.percentage >= 80) return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">En Peligro</span>;
    return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Saludable</span>;
  };

  const progressTemplate = (rowData: any) => {
    if (rowData.budget === 0) {
      return <div className="text-gray-400 text-sm italic">Gasto: {formatDynCurrency(rowData.spent)} (Sin límite fijado)</div>;
    }

    let color = '#10b981'; // emerald-500
    if (rowData.percentage >= 80) color = '#f59e0b'; // amber-500
    if (rowData.percentage >= 100) color = '#ef4444'; // red-500

    return (
      <div className="w-full">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-gray-600">Consumido: {formatDynCurrency(rowData.spent)}</span>
          <span className="text-gray-800 font-bold">Presupuesto: {formatDynCurrency(rowData.budget)}</span>
        </div>
        <ProgressBar value={Math.min(rowData.percentage, 100)} showValue={false} color={color} style={{ height: '8px' }} />
        <div className="text-right text-[10px] mt-1 text-gray-500">{rowData.percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Control Presupuestario</h1>
            <p className="text-gray-600">Monitorea el gasto salarial en tiempo real frente a los límites de cada departamento para el mes actual.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-gray-600 uppercase">Moneda:</span>
            <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-1">
              <button onClick={() => setViewCurrency('VES')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewCurrency === 'VES' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>VES</button>
              <button onClick={() => setViewCurrency('USD')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewCurrency === 'USD' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>USD</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Departamentos Totales</h3>
            <p className="text-4xl font-black text-indigo-600">{metrics.length}</p>
          </div>
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">En Riesgo / Excedidos</h3>
            <p className="text-4xl font-black text-rose-600">
              {metrics.filter(m => m.percentage >= 80 && m.budget > 0).length}
            </p>
          </div>
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Gasto de Nómina Restante</h3>
            <p className="text-4xl font-black text-emerald-600">
              {formatDynCurrency(metrics.reduce((acc, curr) => curr.budget > 0 ? acc + Math.max(0, curr.budget - curr.spent) : acc, 0))}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Desglose por Departamento</h2>
          </div>
          <DataTable key={viewCurrency} value={metrics} loading={loading} emptyMessage="No hay métricas disponibles" className="p-datatable-sm">
            <Column field="name" header="Departamento" className="font-bold text-gray-800" style={{ width: '25%' }} />
            <Column header="Estado Financiero" body={statusTemplate} style={{ width: '15%' }} />
            <Column header="Consumo de Presupuesto (Mes Actual)" body={progressTemplate} style={{ width: '60%' }} />
          </DataTable>
        </div>
      </div>
    </AppLayout>
  );
}
