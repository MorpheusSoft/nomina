import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import api from '@/lib/api';

interface ConceptSandboxDialogProps {
  visible: boolean;
  onHide: () => void;
}

export default function ConceptSandboxDialog({ visible, onHide }: ConceptSandboxDialogProps) {
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [showClosed, setShowClosed] = useState(false);
  
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const [simulationResult, setSimulationResult] = useState<any>(null);

  const [mockData, setMockData] = useState<any>({
    ordinary_night_hours: null,
    ordinary_day_hours: null,
    sundays_worked: null,
    shift_type: null
  });

  useEffect(() => {
    if (visible) {
      loadDependencies();
      setSimulationResult(null);
    }
  }, [visible]);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const [pRes, wRes] = await Promise.all([
        api.get('/payroll-periods'),
        api.get('/workers')
      ]);
      setPeriods(pRes.data);
      setWorkers(wRes.data.map((w: any) => ({
        label: `${w.firstName} ${w.lastName} (${w.primaryIdentityNumber})`,
        value: w.employmentRecords?.find((er: any) => er.isActive)?.id || ''
      })).filter((w: any) => w.value !== ''));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedPeriod || !selectedWorkerId) return;
    try {
      setLoading(true);
      const res = await api.post('/payroll-engine/dry-run', {
        payrollPeriodId: selectedPeriod.id,
        employmentRecordId: selectedWorkerId,
        mockData
      });
      setSimulationResult(res.data);
    } catch (e: any) {
      alert(`Error en Simulador: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Laboratorio de Pruebas (Sandbox)" style={{ width: '90vw', maxWidth: '1200px' }} maximizable>
      <div className="flex flex-col h-full bg-slate-50 p-4 rounded-xl space-y-4">
        
        {/* PANEL DE CONTROL */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-500">Período de Referencia</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">Ver Cerradas</span>
                <InputSwitch checked={showClosed} onChange={(e) => setShowClosed(e.value || false)} style={{ transform: 'scale(0.6)' }} />
              </div>
            </div>
            <Dropdown 
              value={selectedPeriod} 
              options={showClosed ? periods : periods.filter(p => !['CLOSED', 'APPROVED'].includes(p.status))} 
              onChange={(e) => setSelectedPeriod(e.value)} 
              optionLabel="name" 
              placeholder="Seleccione Quincena/Nómina" 
              className="w-full"
              filter
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 mb-1">Trabajador de Prueba</label>
            <Dropdown 
              value={selectedWorkerId} 
              options={workers} 
              onChange={(e) => setSelectedWorkerId(e.value)} 
              placeholder="Seleccione Empleado" 
              className="w-full"
              filter
            />
          </div>
          <div className="flex items-center">
            <Button 
              label="Ejecutar Simulador (Dry Run)" 
              icon="pi pi-bolt" 
              className="bg-indigo-600 hover:bg-indigo-700 w-full" 
              onClick={runSimulation} 
              loading={loading}
              disabled={!selectedPeriod || !selectedWorkerId}
            />
          </div>
        </div>

        {/* PANEL MOCK LOTT (SOBREESCRITURA) */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="flex flex-col">
              <label className="text-[10px] font-bold text-amber-900 mb-1">Horas Nocturnas Ordinarias (Test)</label>
              <InputNumber value={mockData.ordinary_night_hours} onValueChange={(e) => setMockData({...mockData, ordinary_night_hours: e.value})} size={1} placeholder="Ej: 14" className="w-full" />
           </div>
           <div className="flex flex-col">
              <label className="text-[10px] font-bold text-amber-900 mb-1">Horas Diurnas Ordinarias (Test)</label>
              <InputNumber value={mockData.ordinary_day_hours} onValueChange={(e) => setMockData({...mockData, ordinary_day_hours: e.value})} size={1} placeholder="Ej: 8" className="w-full" />
           </div>
           <div className="flex flex-col">
              <label className="text-[10px] font-bold text-amber-900 mb-1">Domingos Trabajados (Test)</label>
              <InputNumber value={mockData.sundays_worked} onValueChange={(e) => setMockData({...mockData, sundays_worked: e.value})} size={1} placeholder="Ej: 1" className="w-full" />
           </div>
           <div className="flex flex-col">
              <label className="text-[10px] font-bold text-amber-900 mb-1">Tipo de Turno (Test)</label>
              <Dropdown 
                value={mockData.shift_type} 
                options={[{label:'Diurno (DAY)', value:'DAY'}, {label:'Nocturno (NIGHT)', value:'NIGHT'}, {label:'Mixto (MIXED)', value:'MIXED'}, {label:'No forzar (Real)', value: null}]} 
                onChange={(e) => setMockData({...mockData, shift_type: e.value})} 
                placeholder="Real" 
                className="w-full"
              />
           </div>
        </div>

        {/* TABLEROS DE RESULTADO */}
        {simulationResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            
            {/* IZQUIERDA: EL RECIBO CALCULADO */}
            <div className="bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden">
               <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 m-0"><i className="pi pi-receipt mr-2 text-indigo-600"></i>Pre-visualización de Recibo</h3>
                 <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                   Neto: {formatCurrency(simulationResult.netPay)} {selectedPeriod?.currency || 'VES'}
                 </span>
               </div>
               <div className="p-0 overflow-y-auto" style={{ maxHeight: '600px' }}>
                 <DataTable value={simulationResult.receiptDetails} size="small" stripedRows rowHover emptyMessage="No surgieron conceptos matemáticos con montos.">
                   <Column field="conceptCode" header="Código" body={(r) => <span className="font-mono text-xs font-bold text-slate-700">{r.conceptCode}</span>} />
                   <Column field="conceptName" header="Concepto" className="font-semibold text-sm" />
                   <Column header="Fórmula (Fac x Rat)" body={(r) => <span className="text-slate-600 text-xs">{r.factor} x {r.rate}</span>} />
                   <Column header="Total" body={(r) => (
                      <span className={`font-bold ${['DEDUCCION','DEDUCTION'].includes(r.type) ? 'text-red-600' : 'text-emerald-600'}`}>
                        {['DEDUCCION','DEDUCTION'].includes(r.type) ? '-' : '+'}{formatCurrency(r.amount)}
                      </span>
                   )} align="right" />
                 </DataTable>
               </div>
            </div>

            {/* DERECHA: EL MAPA DE MEMORIA (RAYOS X) */}
            <div className="bg-zinc-900 rounded-lg shadow border border-zinc-800 flex flex-col overflow-hidden">
               <div className="bg-zinc-800 p-3 border-b border-zinc-700">
                 <h3 className="font-bold text-zinc-100 m-0"><i className="pi pi-code mr-2 text-sky-400"></i>Memoria Runtime de Variables</h3>
                 <p className="text-zinc-500 text-xs m-0 mt-1">Diccionario interno de valores evaluados durante el cálculo algorítmico.</p>
               </div>
               <div className="p-4 overflow-y-auto" style={{ maxHeight: '600px' }}>
                 <pre className="text-emerald-400 font-mono text-[11px] leading-tight m-0">
                    {JSON.stringify(simulationResult.memorySnapshot, null, 2)}
                 </pre>
               </div>
            </div>

          </div>
        )}
        
        {!simulationResult && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
             <i className="pi pi-wrench text-6xl mb-4 opacity-50"></i>
             <p className="font-semibold text-lg">Seleccione un período, trabjador y presione Ejecutar.</p>
             <p className="text-sm">El simulador no altera Base de Datos ni la Contabilidad, es totalmente seguro.</p>
          </div>
        )}

      </div>
    </Dialog>
  );
}
