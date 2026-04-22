"use client";

import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalWorkers: 0,
    activePeriods: 0,
  });

  useEffect(() => {
    // In a real scenario, this would call a /api/v1/admin/stats endpoint
    // For now we'll fetch tenants to get a count
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tenants');
      if (res.data) {
        setStats({
          ...stats,
          totalTenants: res.data.length
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const chartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        label: 'Crecimiento de Empleados Procesados (Miles)',
        data: [12, 19, 31, 45, 62, 85],
        fill: true,
        borderColor: '#4f46e5',
        tension: 0.4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
      }
    ]
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 animate-fadein">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control Global</h1>
          <p className="text-slate-500 mt-1">SaaS Master Node • Monitoreo en tiempo real del ecosistema Nebula.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Empresas Activas</div>
            <div className="text-4xl font-black text-slate-800">{stats.totalTenants}</div>
          </div>
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
            <i className="pi pi-building text-2xl text-indigo-500"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Volumen RRHH</div>
            <div className="text-4xl font-black text-slate-800">12,450</div>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <i className="pi pi-users text-2xl text-emerald-500"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Salud del Servidor</div>
            <div className="text-3xl font-black text-emerald-500 flex items-center gap-2">
              <i className="pi pi-check-circle"></i> Óptimo 99.9%
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <i className="pi pi-server text-2xl text-slate-400"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Tráfico de Procesamiento de Nómina</h2>
          <Chart type="line" data={chartData} options={{ maintainAspectRatio: false }} className="h-80" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Registro de Auditoría</h2>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                <div>
                  <div className="text-sm font-bold text-slate-700">Nuevo Tenant Registrado</div>
                  <div className="text-xs text-slate-500">Empresa Demo CA ha sido creada por el administrador.</div>
                  <div className="text-[10px] text-slate-400 mt-1">Hace {i * 2} horas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
