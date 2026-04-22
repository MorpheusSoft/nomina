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

export default function LiquidationsPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
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
        .filter((p: any) => p.type === 'SETTLEMENT' && p.status !== 'CLOSED')
        .map((p: any) => ({
           label: `${p.name} (${p.startDate.split('T')[0]})`,
           value: p.id
        }));
      setPeriods(pOpts);
    } catch (err) {}
  };

  const calculateLiquidation = async () => {
    if (!selectedPeriodId || !selectedWorkerId || !endDate) {
      toast.current?.show({ severity: 'warn', summary: 'Faltan datos', detail: 'Seleccione un Período de Nómina (Finiquito), el empleado y la fecha de cese' });
      return;
    }
    
    toast.current?.show({ severity: 'info', summary: 'Procesando', detail: 'Evaluando historial salarial, vacaciones pendientes y saldo de fideicomiso...' });

    try {
      const res = await api.post(`/payroll-engine/calculate/${selectedPeriodId}/worker/${selectedWorkerId}`);
      if (res.data) {
        const recRes = await api.get(`/payroll-engine/receipts/${selectedPeriodId}`);
        const workerReceipt = recRes.data.mappedData?.find((r: any) => r.workerId === selectedWorkerId);
        if (workerReceipt) {
           setReceipt(workerReceipt);
           setEngineReady(true);
        } else {
           toast.current?.show({ severity: 'error', summary: 'Error', detail: 'El motor no detectó un contrato activo aplicable para finiquito de este trabajador en este periodo.' });
        }
      }
    } catch (error: any) {
       toast.current?.show({ severity: 'error', summary: 'Fallo al Calcular', detail: error.response?.data?.message || 'Excepción interna en Engine' });
    }
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-6">
        <BreadCrumb model={[{ label: 'RRHH' }, { label: 'Liquidaciones (Finiquitos)' }]} home={{ icon: 'pi pi-home', url: '/' }} className="mb-6 border-none bg-transparent p-0" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card title="Cese de Relación Laboral" className="shadow-sm border border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-4">El Motor de Liquidación evaluará utilidades y vacaciones fraccionadas, sumando el saldo exacto ahorrado en el Fideicomiso de Prestaciones Sociales.</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-red-700 uppercase">Nómina Matriz (Cierre / Finiquito)</label>
                <Dropdown 
                  value={selectedPeriodId} 
                  options={periods} 
                  onChange={(e) => setSelectedPeriodId(e.value)} 
                  filter 
                  placeholder="Seleccione el Periodo de Nómina..." 
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs font-semibold text-gray-700 uppercase">Trabajador a Liquidar</label>
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

              <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase">Ini Cálculo (Opc)</label>
                    <Calendar value={startDate} onChange={(e: any) => setStartDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-red-600 uppercase">Fecha Cese *</label>
                    <Calendar value={endDate} onChange={(e: any) => setEndDate(e.value)} dateFormat="dd/mm/yy" showIcon className="w-full" />
                  </div>
              </div>

              <Button label="Construir Liquidación" icon="pi pi-cog" className="w-full bg-red-600 border-none hover:bg-red-700 shadow-md p-3" onClick={calculateLiquidation} />
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!engineReady ? (
              <div className="h-full min-h-[400px] border-2 border-dashed border-red-200 rounded-xl flex flex-col items-center justify-center bg-red-50/30 text-gray-400 p-8 text-center">
                <i className="pi pi-wallet text-6xl mb-4 text-red-300 opacity-80"></i>
                <h3 className="text-xl font-bold text-red-800 mb-2">Simulador de Finiquito Integrado</h3>
                <p className="max-w-md text-red-600">Al aprobar este recibo, los fondos de Fideicomiso serán retirados a $0 y el estatus laboral de la persona cambiará de forma irreversible a LIQUIDADO.</p>
              </div>
            ) : (
              <Card className="shadow-sm border border-red-100 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 -mt-5 -mx-5 px-6 py-4 mb-5 text-white flex justify-between items-center shadow-inner">
                  <div>
                    <h3 className="text-xl font-bold">Resumen de Cuenta de Liquidación</h3>
                    <p className="text-red-100 text-sm">Finiquito Laboral Definitivo</p>
                  </div>
                  <i className="pi pi-check-circle text-4xl opacity-80"></i>
                </div>
                
                {/* Aqui va la simulacion del recibo AST de nomina */}
                <div className="bg-gray-50 rounded p-4 font-mono text-xs text-gray-700 mb-4 border border-gray-200">
                  // Historial de Componentes Salariales Explotados por el AST
                  <br/>
                </div>

                <div className="flex flex-col mb-6 gap-2">
                  {receipt?.details?.map((d: any) => (
                    <div key={d.id} className={`flex justify-between p-3 border-b border-gray-100 items-center ${d.typeSnapshot === 'DEDUCTION' ? 'bg-red-50/30' : 'bg-emerald-50/10'}`}>
                       <div>
                         <div className="font-bold text-gray-800">{d.conceptSnapshot.name}</div>
                         <div className="text-xs text-gray-500">
                            {d.formulaRecord ? d.formulaRecord.split(';')[0] : 'Evaluado en Motor'}
                         </div>
                       </div>
                       <span className={`font-mono font-bold ${d.typeSnapshot === 'DEDUCTION' ? 'text-red-600' : 'text-emerald-600'}`}>
                         {d.typeSnapshot === 'DEDUCTION' ? '-' : '+'}{Number(d.amount).toFixed(2)} {receipt.currency}
                       </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-lg shadow-inner">
                  <span className="uppercase text-sm font-bold tracking-widest text-gray-300">Total Finiquito (Neto)</span>
                  <span className="text-3xl font-black font-mono text-emerald-400">
                     {(receipt?.details?.filter((d: any) => d.typeSnapshot === 'EARNING').reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) - receipt?.details?.filter((d: any) => d.typeSnapshot === 'DEDUCTION').reduce((acc: number, curr: any) => acc + Number(curr.amount), 0)).toFixed(2)} {receipt?.currency}
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button label="Imprimir Recibo de Cese" icon="pi pi-print" outlined severity="secondary" className="w-full" onClick={() => window.print()} />
                  <Button label="Liquidar (Ir a Cierre Matriz)" icon="pi pi-exclamation-triangle" className="w-full bg-red-600 hover:bg-red-700 border-none" onClick={() => window.location.href = '/payroll/periods'} />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
