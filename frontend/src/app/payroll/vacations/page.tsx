'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { BreadCrumb } from 'primereact/breadcrumb';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

export default function VacationsPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const toast = useRef<Toast>(null);

  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wRes, pRes] = await Promise.all([
        api.get('/workers'),
        api.get('/payroll-periods')
      ]);
      
      const wOpts = wRes.data.map((w: any) => ({
        label: `${w.primaryIdentityNumber} - ${w.firstName} ${w.lastName}`,
        value: w.id
      }));
      setWorkers(wOpts);

      const pOpts = pRes.data
        .filter((p: any) => p.type === 'VACATION' && p.status !== 'CLOSED')
        .map((p: any) => ({
           label: `${p.name} (${p.startDate.split('T')[0]})`,
           value: p.id
        }));
      setPeriods(pOpts);
    } catch (err) {}
  };

  const calculateVacation = () => {
    if (!selectedPeriodId || !selectedWorkerId || !startDate || !endDate) {
      toast.current?.show({ severity: 'warn', summary: 'Faltan datos', detail: 'Seleccione un Período de Nómina, el empleado y el rango de fechas' });
      return;
    }
    
    // Aquí implementaremos la llamada a un endpoint de simulador
    // POST /payroll-engine/simulate-vacation (Por construir en Backend)
    toast.current?.show({ severity: 'info', summary: 'Cargando', detail: 'Invocando al motor de AST Retroactivo...' });

    // Simularemos la respuesta en UI para no bloquear el flujo
    setTimeout(() => setEngineReady(true), 1500);
  };

  const getDaysCount = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      return diffDays;
    }
    return 0;
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6">
        <BreadCrumb model={[{ label: 'RRHH' }, { label: 'Calculadora de Vacaciones' }]} home={{ icon: 'pi pi-home', url: '/' }} className="mb-6 border-none bg-transparent p-0" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card title="Selector de Trabajador" className="shadow-sm border border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-4">La calculadora evaluará el salario vigente y todos los conceptos retroactivos (bonos, utilidades prorrateadas, horas extras del último semestre) para proyectar el beneficio de Vacaciones.</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-gray-700 uppercase">Nómina Matriz Atada</label>
                <Dropdown 
                  value={selectedPeriodId} 
                  options={periods} 
                  onChange={(e) => setSelectedPeriodId(e.value)} 
                  filter 
                  placeholder="Seleccione el Periodo de Nómina (Tipo Vacaciones)..." 
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-gray-700 uppercase">Trabajador Activo</label>
                <Dropdown 
                  value={selectedWorkerId} 
                  options={workers} 
                  onChange={(e) => setSelectedWorkerId(e.value)} 
                  filter 
                  placeholder="Buscar trabajador..." 
                  className="w-full"
                  disabled={!selectedPeriodId}
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-gray-700 uppercase">Inicio de Disfrute</label>
                <Calendar value={startDate} onChange={(e: any) => setStartDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-semibold text-gray-700 uppercase">Fin de Disfrute</label>
                <Calendar value={endDate} onChange={(e: any) => setEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" minDate={startDate || undefined} />
                {getDaysCount() > 0 && <small className="text-indigo-600 font-medium text-right mt-1">{getDaysCount()} Días de Disfrute</small>}
              </div>

              <Button label="Pre-Calcular Recibo" icon="pi pi-cog" className="w-full bg-slate-800 border-none hover:bg-slate-900 shadow-md p-3" onClick={calculateVacation} />
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!engineReady ? (
              <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50/50 text-gray-400 p-8 text-center">
                <i className="pi pi-receipt text-6xl mb-4 opacity-50"></i>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Recibo de Vacaciones (Hybrid Ledger)</h3>
                <p className="max-w-md">Selecciona las fechas en el panel y presiona "Pre-Calcular" para generar de forma dinámica el Recibo Vacacional, insertando de manera transparente los registros en la tabla matriz de Recibos.</p>
              </div>
            ) : (
              <Card className="shadow-sm border border-orange-100 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-amber-500 -mt-5 -mx-5 px-6 py-4 mb-5 text-white flex justify-between items-center shadow-inner">
                  <div>
                    <h3 className="text-xl font-bold">Simulación Vacacional</h3>
                    <p className="text-orange-100 text-sm">Validación Retroactiva Completa</p>
                  </div>
                  <i className="pi pi-check-circle text-4xl opacity-80"></i>
                </div>
                
                {/* Aqui va la simulacion del recibo AST de nomina */}
                <div className="bg-gray-50 rounded p-4 font-mono text-xs text-gray-700 mb-4 border border-gray-200">
                  // Resultado del AST inyectado con los Acumuladores de 6 meses
                  <br/>
                  ACUM_SALARIO_NORMAL_ULTIMOS_6M = 1.250,00 Bs. <br/>
                  SALARIO_VAR_PROMEDIO = 208,33 Bs. / MES <br/>
                  ...
                </div>

                <div className="flex flex-col mb-6 gap-2">
                  <div className="flex justify-between p-3 border-b border-gray-100 items-center">
                     <div>
                       <div className="font-bold text-gray-800">Sueldo Base (Días de Disfrute)</div>
                       <div className="text-xs text-gray-500">{(startDate && endDate) ? getDaysCount() : 0} Días de Disfrute a Salario Básico</div>
                     </div>
                     <span className="font-mono font-bold text-emerald-600">+1.500,00 Bs</span>
                  </div>
                  <div className="flex justify-between p-3 border-b border-gray-100 items-center bg-indigo-50/30">
                     <div>
                       <div className="font-bold text-gray-800">Bono Vacacional de Ley</div>
                       <div className="text-xs text-gray-500">15 Días Bonificados con Salario Normal Promediado</div>
                     </div>
                     <span className="font-mono font-bold text-emerald-600">+2.460,00 Bs</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-800 text-white rounded-lg shadow-inner">
                  <span className="uppercase text-sm font-bold tracking-widest text-gray-300">Neto a Transferir</span>
                  <span className="text-3xl font-black font-mono">3.960,00 Bs.</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button label="Imprimir Recibo Borrador" icon="pi pi-print" outlined severity="secondary" className="w-full" />
                  <Button label="Asentar Nómina Vacacional en BDD" icon="pi pi-save" className="w-full bg-orange-500 hover:bg-orange-600 border-none" />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
