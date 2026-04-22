"use client";

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function SignReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const unwrappedParams = use(params);
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    fetchReceipt();
  }, [unwrappedParams.token]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/portal/receipts/by-token/${unwrappedParams.token}`);
      setReceipt(res.data);
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'No se pudo cargar el recibo' });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    try {
      setSigning(true);
      await axios.post(`${BASE_URL}/portal/receipts/${receipt.id}/sign`);
      toast.current?.show({ severity: 'success', summary: 'Firma Exitosa', detail: 'El recibo ha sido firmado digitalmente.' });
      fetchReceipt(); // Refrescar para que aparezca firmado
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al firmar el recibo' });
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-indigo-800"><i className="pi pi-spin pi-spinner text-3xl"></i></div>;
  if (!receipt) return <div className="p-12 text-center text-red-500 font-bold">Recibo no encontrado o token inválido.</div>;

  const worker = receipt.worker;
  const period = receipt.payrollPeriod;
  const contract = worker.employmentRecords?.[0] || {};
  const isSigned = !!receipt.signatureIp;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Toast ref={toast} position="top-center" />

      <div className="flex items-center gap-2 text-indigo-600 cursor-pointer font-bold hover:underline mb-2 print:hidden" onClick={() => router.push('/portal/dashboard')}>
        <i className="pi pi-arrow-left"></i> Volver al Tablero
      </div>

      {/* CLASIC RECEIPT LAYOUT */}
      <div className="bg-white text-black font-sans border border-slate-900 p-8 shadow-sm relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">{worker.tenant?.name || 'Nómina Corporativa'}</h1>
            <h2 className="text-sm font-semibold mt-1 text-slate-700">COMPROBANTE DE PAGO DE NÓMINA</h2>
            <div className="text-xs text-slate-600 mt-3 space-y-1">
               <p>Período: {new Date(period.startDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })} al {new Date(period.endDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</p>
               <p>Nómina: {period.name}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold uppercase text-slate-900">{worker.firstName} {worker.lastName}</h2>
            <div className="text-xs text-slate-600 mt-2 space-y-1">
               <p>ID/CI: {worker.primaryIdentityNumber}</p>
               <p>Recibo Nro: {receipt.id.split('-')[0].toUpperCase()}</p>
               <p>Fecha Impresión: {new Date().toLocaleDateString('es-ES')}</p>
               <p>Cargo: {contract.position || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-500 ${!isSigned ? 'blur-md select-none pointer-events-none opacity-50 grayscale' : ''}`}>
          {/* Box Columns */}
          <div className="grid grid-cols-2 divide-x divide-slate-300 border-t-2 border-b-2 border-slate-800 min-h-[300px] mb-6">
             
             {/* Left Col - Earnings */}
             <div className="flex flex-col">
                <div className="text-center font-bold text-[11px] uppercase py-2 border-b border-slate-800 mb-3 tracking-wider">
                   Asignaciones / Ingresos
                </div>
                <div className="px-5 flex-1">
                   {receipt.details
                     .filter((d: any) => d.typeSnapshot === 'EARNING')
                     .map((d: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="uppercase tracking-tight">{d.conceptNameSnapshot || d.concept?.name}</span>
                        <span>{Number(d.amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between font-bold text-sm px-5 py-3 border-t border-slate-300">
                   <span>TOTAL ASIGNACIONES</span>
                   <span>{Number(receipt.totalEarnings).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>
             </div>

             {/* Right Col - Deductions */}
             <div className="flex flex-col">
                <div className="text-center font-bold text-[11px] uppercase py-2 border-b border-slate-800 mb-3 tracking-wider">
                   Deducciones / Retenciones
                </div>
                <div className="px-5 flex-1">
                   {receipt.details
                     .filter((d: any) => ['DEDUCTION', 'LOAN_DEDUCTION'].includes(d.typeSnapshot) && !d.isEmployerContribution && d.typeSnapshot !== 'EMPLOYER_CONTRIBUTION')
                     .map((d: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="uppercase tracking-tight">{d.conceptNameSnapshot || d.concept?.name}</span>
                        <span className="text-red-700">{Number(d.amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                   ))}
                </div>
                <div className="flex justify-between font-bold text-sm text-red-700 px-5 py-3 border-t border-slate-300">
                   <span>TOTAL DEDUCCIONES</span>
                   <span>{Number(receipt.totalDeductions).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>
             </div>
          </div>

          {/* NET TO PAY BOX */}
          <div className="border-2 border-slate-900 p-5 flex justify-between items-end">
             <div>
               <h3 className="font-bold text-[13px] tracking-wide mb-1 text-slate-800">NETO A RECIBIR</h3>
               <p className="text-[10px] text-slate-500 italic max-w-xs leading-tight">
                 Recibí conforme el monto exacto detallado en este comprobante por concepto de mis servicios.
               </p>
             </div>
             <div className="flex items-center gap-12">
               <span className="text-2xl font-black tracking-tighter">Bs. {Number(receipt.netPay).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
               <div className="text-center pt-2">
                  {isSigned ? (
                     <div className="text-emerald-700 font-bold border-b border-emerald-700 pb-1 mb-1 px-6 text-[10px] tracking-wider uppercase">
                        Válido y Firmado
                     </div>
                  ) : (
                     <div className="w-48 border-b border-slate-800 mb-1"></div>
                  )}
                  <span className="text-[10px] font-bold text-slate-700 tracking-wider">FIRMA DEL TRABAJADOR</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between print:hidden">
         <span className="text-slate-300 text-sm font-bold">
           <i className="pi pi-lock text-emerald-400 mr-2"></i> Conexión Cifrada SSL
         </span>
         {!isSigned ? (
            <Button 
               label="Validar y Firmar Recibo" 
               icon="pi pi-verified" 
               size="large" 
               loading={signing}
               className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/30 text-white font-bold" 
               onClick={handleSign} 
            />
         ) : (
            <Button 
               label="Descargar PDF" 
               icon="pi pi-download" 
               severity="secondary" 
               className="bg-slate-700 text-slate-200 hover:bg-slate-600 border-none"
               onClick={() => window.print()}
            />
         )}
      </div>
    </div>
  );
}
