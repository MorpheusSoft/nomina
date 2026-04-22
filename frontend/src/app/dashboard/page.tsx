"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "primereact/card";
import { Skeleton } from 'primereact/skeleton';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardSummary {
  totalWorkers: number;
  budgetExecution: {
    budget: number;
    executed: number;
    percentage: number;
  };
  expiringContracts: number;
  absenteeism: {
    rate: number;
    absences: number;
    totalExpected: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const todayStr = new Intl.DateTimeFormat('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard General</h1>
          <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 capitalize">
            <i className="pi pi-calendar mr-2 text-indigo-500"></i>
            {todayStr}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Card 1: Trabajadores Activos */}
          <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trabajadores Activos</span>
                <div className="text-3xl font-black text-gray-800 mt-2">
                  {loading ? <Skeleton width="4rem" height="2rem" /> : data?.totalWorkers}
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <i className="pi pi-users text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-5 text-sm font-medium text-indigo-600 flex items-center bg-indigo-50 w-fit px-2 py-1 rounded-md">
              <i className="pi pi-check-circle text-[10px] mr-1"></i>
              <span>En nómina</span>
            </div>
          </Card>

          {/* Card 2: Ejecución Presupuestaria */}
          <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ejecución Presupuestaria</span>
                <div className="text-3xl font-black text-gray-800 mt-2">
                  {loading ? <Skeleton width="4rem" height="2rem" /> : `${data?.budgetExecution.percentage.toFixed(1)}%`}
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <i className="pi pi-chart-pie text-emerald-600 text-xl"></i>
              </div>
            </div>
            <div className={`mt-5 text-sm font-medium flex items-center w-fit px-2 py-1 rounded-md ${(data?.budgetExecution.percentage || 0) > 100 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
              <i className={`pi pi-arrow-${(data?.budgetExecution.percentage || 0) > 100 ? 'up' : 'down'} text-[10px] mr-1`}></i>
              <span>${data?.budgetExecution.executed.toLocaleString(undefined, { minimumFractionDigits: 2 })} consumidos de ${data?.budgetExecution.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>

          {/* Card 3: Contratos por Vencer */}
          <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contratos por Vencer</span>
                <div className="text-3xl font-black text-gray-800 mt-2">
                  {loading ? <Skeleton width="4rem" height="2rem" /> : data?.expiringContracts}
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <i className="pi pi-file-edit text-amber-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-5 text-sm font-medium text-amber-600 flex items-center bg-amber-50 w-fit px-2 py-1 rounded-md">
              <i className="pi pi-exclamation-triangle text-[10px] mr-1"></i>
              <span>Próximos 60 días</span>
            </div>
          </Card>

          {/* Card 4: Índice de Ausentismo */}
          <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ausentismo Mensual</span>
                <div className="text-3xl font-black text-gray-800 mt-2">
                  {loading ? <Skeleton width="4rem" height="2rem" /> : `${data?.absenteeism.rate.toFixed(1)}%`}
                </div>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <i className="pi pi-calendar-times text-rose-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-5 text-sm font-medium text-rose-600 flex items-center bg-rose-50 w-fit px-2 py-1 rounded-md">
              <i className="pi pi-minus-circle text-[10px] mr-1"></i>
              <span>{data?.absenteeism.absences} incidencias de {data?.absenteeism.totalExpected} días laborales</span>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button 
              onClick={() => router.push('/hr/tickets')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="bg-purple-50 p-4 rounded-full mb-3 group-hover:bg-purple-100 transition-colors">
                <i className="pi pi-inbox text-2xl text-purple-600"></i>
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">Taquilla VIP Tickets</span>
            </button>
            <button 
              onClick={() => router.push('/workers/new')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="bg-indigo-50 p-4 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors">
                <i className="pi pi-user-plus text-2xl text-indigo-600"></i>
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">Nuevo Trabajador</span>
            </button>
            <button 
              onClick={() => router.push('/payroll/periods')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-teal-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="bg-teal-50 p-4 rounded-full mb-3 group-hover:bg-teal-100 transition-colors">
                <i className="pi pi-calculator text-2xl text-teal-600"></i>
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">Nóminas y Períodos</span>
            </button>
            <button 
              onClick={() => router.push('/payroll/vacations')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="bg-orange-50 p-4 rounded-full mb-3 group-hover:bg-orange-100 transition-colors">
                <i className="pi pi-sun text-2xl text-orange-600"></i>
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">Gestionar Vacaciones</span>
            </button>
            <button 
              onClick={() => router.push('/payroll/attendance/import')}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
              <div className="bg-blue-50 p-4 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                <i className="pi pi-clock text-2xl text-blue-600"></i>
              </div>
              <span className="font-semibold text-gray-700 text-sm text-center">Consolidar Asistencia</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
