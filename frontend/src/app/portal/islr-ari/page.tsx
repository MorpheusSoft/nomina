'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import axios from 'axios';
import { generateAriPdfOverlay } from '@/lib/ariPdfOverlay';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function PortalAriPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workerName, setWorkerName] = useState('');
  const [workerId, setWorkerId] = useState<string | null>(null);
  
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear());
  const [estimatedFloor, setEstimatedFloor] = useState<number>(0);
  const [existingFormId, setExistingFormId] = useState<string | null>(null);
  const [canGenerateVariation, setCanGenerateVariation] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [step, setStep] = useState(1);
  const [familyLoadCount, setFamilyLoadCount] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [estimatedRemuneration, setEstimatedRemuneration] = useState<number | null>(null);
  const [deductionType, setDeductionType] = useState<string>('UNIQUE');
  
  const [eduDeductionAmount, setEduDeductionAmount] = useState<number | null>(null);
  const [hcmDeductionAmount, setHcmDeductionAmount] = useState<number | null>(null);
  const [medDeductionAmount, setMedDeductionAmount] = useState<number | null>(null);
  const [housingDeductionAmount, setHousingDeductionAmount] = useState<number | null>(null);

  const detailedDeductionsAmount = (eduDeductionAmount || 0) + (hcmDeductionAmount || 0) + (medDeductionAmount || 0) + (housingDeductionAmount || 0);

  const router = useRouter();
  const toast = useRef<Toast>(null);

  const DEDUCTION_OPTIONS = [
    { label: 'Desgravamen Único (774 U.T.)', value: 'UNIQUE' },
    { label: 'Desgravamen Detallado (Declarar Monto)', value: 'DETAILED' }
  ];

  useEffect(() => {
    const wId = localStorage.getItem('portal_worker_id');
    const name = localStorage.getItem('portal_worker_name');
    if (!wId) {
      router.push('/portal/login');
      return;
    }
    setWorkerId(wId);
    setWorkerName(name || 'Trabajador');
    fetchInitialData(wId);
  }, []);

  const fetchInitialData = async (wId: string) => {
    try {
      setLoading(true);
      const tenantId = localStorage.getItem('portal_tenant_id');
      const res = await axios.get(`${BASE_URL}/ari-forms/floor/${wId}`, {
         headers: { 'x-tenant-id': tenantId || '' }
      });
      if (res.data) {
        if (res.data.floor) {
          setEstimatedFloor(res.data.floor);
          setEstimatedRemuneration(res.data.floor);
        }
        if (res.data.defaultFamilyLoad !== undefined) {
          setFamilyLoadCount(res.data.defaultFamilyLoad);
        }
        if (res.data.existingFormId) {
          setExistingFormId(res.data.existingFormId);
        }
        if (res.data.canGenerateVariation !== undefined) {
          setCanGenerateVariation(res.data.canGenerateVariation);
        }
      }
    } catch (e) {
      console.error(e);
      toast.current?.show({ severity: 'error', summary: 'Aviso', detail: 'No se pudo cargar su base financiera' });
    } finally {
      setLoading(false);
    }
  };

  const downloadPrintableForm = async () => {
    try {
      setIsPrinting(true);
      const res = await axios.get(`${BASE_URL}/ari-forms/details/${existingFormId}`, {
        headers: {
          'x-tenant-id': localStorage.getItem('portal_tenant_id') || '',
          'x-worker-id': workerId || ''
        }
      });
      await generateAriPdfOverlay(res.data);
      setIsPrinting(false);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron recuperar los datos de su planilla.' });
      setIsPrinting(false);
    }
  };

  const runSimulation = async () => {
    try {
      setIsSimulating(true);
      const res = await axios.post(`${BASE_URL}/ari-forms/simulate`, {
        estimatedRemuneration: estimatedRemuneration || 0,
        familyLoadCount,
        deductionType,
        detailedDeductionsAmount: deductionType === 'UNIQUE' ? 0 : detailedDeductionsAmount,
        eduDeductionAmount: deductionType === 'UNIQUE' ? 0 : (eduDeductionAmount || 0),
        hcmDeductionAmount: deductionType === 'UNIQUE' ? 0 : (hcmDeductionAmount || 0),
        medDeductionAmount: deductionType === 'UNIQUE' ? 0 : (medDeductionAmount || 0),
        housingDeductionAmount: deductionType === 'UNIQUE' ? 0 : (housingDeductionAmount || 0)
      }, {
        headers: {
          'x-tenant-id': localStorage.getItem('portal_tenant_id') || '',
          'x-worker-id': workerId || ''
        }
      });
      setSimulationResult(res.data);
      setStep(4);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo simular la matemática fiscal' });
    } finally {
      setIsSimulating(false);
    }
  };

  const submitForm = async () => {
    if ((estimatedRemuneration || 0) < estimatedFloor) {
      toast.current?.show({ severity: 'warn', summary: 'Validación Fallida', detail: `El ingreso anual no puede ser menor al cálculo estricto de nómina actual: ${estimatedFloor.toLocaleString()} Bs.`});
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${BASE_URL}/ari-forms/employee`, {
        fiscalYear,
        estimatedRemuneration: estimatedRemuneration || 0,
        familyLoadCount,
        deductionType,
        detailedDeductionsAmount: deductionType === 'UNIQUE' ? 0 : detailedDeductionsAmount,
        eduDeductionAmount: deductionType === 'UNIQUE' ? 0 : (eduDeductionAmount || 0),
        hcmDeductionAmount: deductionType === 'UNIQUE' ? 0 : (hcmDeductionAmount || 0),
        medDeductionAmount: deductionType === 'UNIQUE' ? 0 : (medDeductionAmount || 0),
        housingDeductionAmount: deductionType === 'UNIQUE' ? 0 : (housingDeductionAmount || 0)
      }, {
        // Need to pass worker simulation via headers because JWT typically does it, but portal uses simple auth
        headers: {
          'x-tenant-id': localStorage.getItem('portal_tenant_id') || '',
          'x-worker-id': workerId || ''
        }
      });
      
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Su Formato AR-I ha sido declarado legalmente y guardado exitosamente.' });
      setExistingFormId(res.data.id); // Assuming backend creation returns standard object with id
      fetchInitialData(workerId!); // Refresh to ensure backend ID is correct if response object structure varied
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Error del servidor al procesar la declaración' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil fiscal...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadein">
      <Toast ref={toast} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
            <i className="pi pi-file-export text-3xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Declaración ISLR (Formato AR-I)</h1>
            <p className="text-gray-500 mt-1">
              Rellene la variación de su declaración estimada para el Ejercicio Fiscal {fiscalYear}.
            </p>
          </div>
        </div>

        {existingFormId ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-fadein">
             <i className="pi pi-check-circle text-6xl text-emerald-500 mb-4"></i>
             <h2 className="text-xl font-bold text-emerald-900 mb-2">Declaración Vigente</h2>
             <p className="text-emerald-700 mb-6">Usted ya posee una declaración AR-I procesada y activa para el ejercicio fiscal {fiscalYear}.</p>
             <div className="flex justify-center gap-4">
                <Button label="Volver al Inicio" icon="pi pi-arrow-left" text onClick={() => router.push('/portal/dashboard')} />
                <Button label="Descargar Formato SENIAT PDF" icon="pi pi-file-pdf" onClick={downloadPrintableForm} loading={isPrinting} className="bg-emerald-600 border-none" />
             </div>
             {canGenerateVariation && (
                <div className="mt-8 pt-6 border-t border-emerald-200">
                   <p className="text-emerald-800 text-sm mb-4">Se encuentra en un período habilitado por el SENIAT para emitir en este mes una variación legal en su declaración.</p>
                   <Button label="Declarar Variación de Trimestre" icon="pi pi-chart-line" className="p-button-warning font-bold" onClick={() => { setExistingFormId(null); setStep(1); }} />
                </div>
             )}
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                    {s}
                  </div>
                ))}
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-fadein">
                <h2 className="text-xl font-bold text-gray-800">Paso 1: Estimación de Ingresos</h2>
                <Message severity="info" text="Su remuneración base (Sueldo, Utilidades y Bono Vacacional vigentes) ha sido pre-cargada como proyección legal anual. Usted puede declarar más ingresos si posee fuentes comprobables nominales extra (bonos y comisiones regulares mensuales), pero no puede declarar menos para su base tributaria." className="w-full justify-start text-sm" />
                <div className="field mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Estimación Anual de Ingresos (Bs.) <span className="text-rose-500">*</span></label>
                  <InputNumber value={estimatedRemuneration} onValueChange={(e) => setEstimatedRemuneration(e.value ?? null)} mode="decimal" locale="es-VE" minFractionDigits={2} min={estimatedFloor} className="w-full" inputClassName="font-mono text-xl font-bold text-blue-900 py-3" />
                  <small className="text-gray-500 mt-2 block"><i className="pi pi-info-circle mr-1"></i>Piso Legal Pre-calculado por RRHH: {estimatedFloor.toLocaleString('es-VE')} Bs.</small>
                </div>
                <div className="flex justify-end pt-6">
                  <Button label="Siguiente Paso" icon="pi pi-arrow-right" iconPos="right" onClick={() => setStep(2)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadein">
                <h2 className="text-xl font-bold text-gray-800">Paso 2: Cargas Familiares (Rebajas)</h2>
                <Message severity="info" text="Legalmente puede aprovechar las cargas para reducir su impuesto, pero recuerde: si su cónyuge trabaja, no pueden reclamar doblemente al mismo hijo de manera cruzada. Declare solo los que le correspondan aplicar según acuerdo familiar." className="w-full justify-start text-sm" />
                
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mt-6">
                   <label className="block text-sm font-bold text-gray-700 mb-2">Número de Cargas a Declarar (Ascendientes/Descendientes)</label>
                   <p className="text-sm text-gray-500 mb-4">Le sugerimos el número de familiares válidos actualmente en su expediente de Recursos Humanos. Puede bajar la cifra si lo considera legalmente necesario.</p>
                   <InputNumber value={familyLoadCount} onValueChange={(e) => setFamilyLoadCount(e.value ?? 0)} showButtons min={0} max={15} className="w-32" inputClassName="text-center font-bold text-lg" />
                </div>

                <div className="flex justify-between pt-6">
                  <Button label="Atrás" icon="pi pi-arrow-left" text severity="secondary" onClick={() => setStep(1)} />
                  <Button label="Siguiente Paso" icon="pi pi-arrow-right" iconPos="right" onClick={() => setStep(3)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadein">
                <h2 className="text-xl font-bold text-gray-800">Paso 3: Tipo de Desgravamen</h2>
                
                <div className="field">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seleccione su método de desgravamen</label>
                  <Dropdown value={deductionType} options={DEDUCTION_OPTIONS} onChange={(e) => setDeductionType(e.value)} className="w-full p-fluid" />
                </div>

                {deductionType === 'DETAILED' && (
                  <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mt-4 space-y-4">
                    <h3 className="block text-sm font-bold text-amber-900 mb-4 border-b border-amber-200 pb-2">Desglose Legal de Desgravámenes (Total Bs. {detailedDeductionsAmount.toLocaleString('es-VE')})</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="field flex flex-col justify-end h-full">
                        <label className="block text-xs font-bold text-amber-900 mb-1">1. Inst. Docentes (Educación propia y Descendientes menores a 25)</label>
                        <InputNumber value={eduDeductionAmount} onValueChange={(e) => setEduDeductionAmount(e.value ?? null)} mode="decimal" locale="es-VE" minFractionDigits={2} className="w-full mt-auto" />
                      </div>

                      <div className="field flex flex-col justify-end h-full">
                        <label className="block text-xs font-bold text-amber-900 mb-1">2. Primas de Seguros (HCM)</label>
                        <InputNumber value={hcmDeductionAmount} onValueChange={(e) => setHcmDeductionAmount(e.value ?? null)} mode="decimal" locale="es-VE" minFractionDigits={2} className="w-full mt-auto" />
                      </div>

                      <div className="field flex flex-col justify-end h-full">
                        <label className="block text-xs font-bold text-amber-900 mb-1">3. Servicios Médicos / Odontológicos (Incluye Carga Familiar)</label>
                        <InputNumber value={medDeductionAmount} onValueChange={(e) => setMedDeductionAmount(e.value ?? null)} mode="decimal" locale="es-VE" minFractionDigits={2} className="w-full mt-auto" />
                      </div>

                      <div className="field flex flex-col justify-end h-full">
                        <label className="block text-xs font-bold text-amber-900 mb-1">4. Vivienda Principal (Intereses o Alquiler)</label>
                        <InputNumber value={housingDeductionAmount} onValueChange={(e) => setHousingDeductionAmount(e.value ?? null)} mode="decimal" locale="es-VE" minFractionDigits={2} className="w-full mt-auto" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button label="Atrás" icon="pi pi-arrow-left" text severity="secondary" onClick={() => setStep(2)} />
                  <Button label="Simular y Ver Resumen" icon="pi pi-arrow-right" iconPos="right" onClick={runSimulation} loading={isSimulating} />
                </div>
               </div>
             )}

            {step === 4 && simulationResult && (
              <div className="space-y-6 animate-fadein">
                <div className="text-center">
                   <i className="pi pi-bolt text-5xl text-yellow-500 mb-4 drop-shadow-md"></i>
                   <h2 className="text-2xl font-bold text-gray-800">Cálculo Fiscal Estimado</h2>
                   <p className="text-gray-500">Por favor, confirme los siguientes datos simulados antes de someter legalmente esta planilla.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                   <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos Estimados (Ut)</div>
                      <div className="text-2xl font-black text-gray-900">{simulationResult.estimatedUt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-gray-500">U.T.</span></div>
                      <div className="text-sm text-gray-500 mt-1">Bs. {(estimatedRemuneration || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Desgravamen Aplicado ({deductionType === 'UNIQUE' ? 'Único' : 'Detallado'})</div>
                      <div className="text-2xl font-black text-amber-600">-{simulationResult.deductionUt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-amber-600/70">U.T.</span></div>
                      <div className="text-sm text-gray-500 mt-1">Valor U.T.: Bs. {simulationResult.taxUnitValue.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rebajas Adicionales (-{familyLoadCount} Cargas)</div>
                      <div className="text-2xl font-black text-emerald-600">-{simulationResult.rebatesUt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-emerald-600/70">U.T.</span></div>
                      <div className="text-sm text-gray-500 mt-1">10 U.T. Personal + 10 U.T. por Carga</div>
                   </div>
                   <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-4 shadow-lg text-white">
                      <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Porcentaje a Retener (ISLR)</div>
                      <div className="text-4xl font-black">{simulationResult.percentage}%</div>
                      <div className="text-sm text-indigo-100 mt-1">Impuesto a pagar: {simulationResult.finalTaxUt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} U.T.</div>
                   </div>
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                  <Button label="Ajustar y Recalcular" icon="pi pi-arrow-left" text severity="secondary" onClick={() => setStep(3)} />
                  <Button label="Firmar y Entregar Formato" icon="pi pi-check-circle" severity="success" size="large" onClick={submitForm} loading={submitting} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
