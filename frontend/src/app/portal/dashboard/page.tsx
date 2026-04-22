"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export default function PortalDashboard() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState('');
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const workerId = localStorage.getItem('portal_worker_id');
    const name = localStorage.getItem('portal_worker_name');
    if (!workerId) {
      router.push('/portal/login');
      return;
    }
    setWorkerName(name || 'Trabajador');
    fetchReceipts(workerId);
  }, []);

  const fetchReceipts = async (workerId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/portal/receipts/worker/${workerId}`);
      setReceipts(res.data);
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar sus recibos' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_worker_id');
    localStorage.removeItem('portal_worker_name');
    router.push('/portal/login');
  };

  const statusTemplate = (r: any) => {
    if (r.signatureIp || r.signatureToken === null) {
      return <Tag severity="success" value="Firmado" icon="pi pi-check-circle" />;
    }
    return <Tag severity="warning" value="Firma Pendiente" icon="pi pi-exclamation-triangle" />;
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      
      {/* Bienvenida */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-800 to-indigo-900">
        <div>
           <h2 className="text-xl font-bold text-white mb-1">¡Hola, {workerName}! 👋</h2>
           <p className="text-indigo-200 text-sm">Bienvenido a su espacio personal. Aquí puede consultar sus pagos.</p>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="bg-white/10 hover:bg-white/20 border-none text-white transition-colors" onClick={handleLogout} />
      </div>

      {/* Recibos de Pago */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <i className="pi pi-wallet text-xl"></i>
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Caja de Recibos de Pago</h3>
             <p className="text-sm text-slate-500 font-medium">Consulte y firme sus recibos electrónicos históricamente.</p>
           </div>
        </div>

        <DataTable value={receipts} loading={loading} stripedRows emptyMessage="No hay recibos disponibles aún." className="p-datatable-sm">
          <Column field="payrollPeriod.name" header="Concepto / Nómina" className="font-bold text-slate-800" />
          <Column header="Periodo" body={(r) => `${new Date(r.payrollPeriod.startDate).toLocaleDateString('es-ES')} - ${new Date(r.payrollPeriod.endDate).toLocaleDateString('es-ES')}`} />
          <Column header="Ingreso Neto" body={(r) => <span className="text-emerald-600 font-black">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(Number(r.netPay))}</span>} />
          <Column header="Estatus Firma" body={statusTemplate} />
          <Column header="Fecha de Firma" body={(r) => r.viewedAt ? new Date(r.viewedAt).toLocaleDateString('es-ES') : '-'} />
          <Column body={(r) => (
            <Button 
               icon="pi pi-file-pdf" 
               label={r.signatureIp ? "Ver Recibo" : "Firmar Ahora"} 
               severity={r.signatureIp ? "secondary" : "info"} 
               outlined 
               size="small" 
               className={r.signatureIp ? "" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors font-bold"}
               onClick={() => router.push(`/portal/receipt/sign/${r.signatureToken || r.id}`)} 
            />
          )} align="right" />
        </DataTable>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div 
           className="bg-white border text-center p-8 border-slate-200 rounded-2xl flex flex-col items-center cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group"
           onClick={() => router.push('/portal/mis-requerimientos')}
         >
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
              <i className="pi pi-ticket text-2xl text-teal-600"></i>
            </div>
            <h4 className="font-bold text-slate-800">Taquilla de Requerimientos</h4>
            <p className="text-sm text-slate-500 mt-2">Emita tickets para permisos, reclamos, o gestiones de nómina.</p>
         </div>

         <div 
           className="bg-white border text-center p-8 border-slate-200 rounded-2xl flex flex-col items-center cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
           onClick={() => router.push('/portal/documents')}
         >
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <i className="pi pi-file-word text-2xl text-blue-600"></i>
            </div>
            <h4 className="font-bold text-slate-800">Autogestión Constancias</h4>
            <p className="text-sm text-slate-500 mt-2">Genere e imprima sus cartas de trabajo y documentos al instante.</p>
         </div>

         <div 
           className="bg-white border text-center p-8 border-slate-200 rounded-2xl flex flex-col items-center cursor-pointer hover:border-teal-400 hover:shadow-md transition-all group"
           onClick={() => router.push('/portal/loans')}
         >
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
              <i className="pi pi-credit-card text-2xl text-teal-600"></i>
            </div>
            <h4 className="font-bold text-slate-800">Estado de Préstamos</h4>
            <p className="text-sm text-slate-500 mt-2">Monitorice su saldo vivo y el histórico de sus amortizaciones.</p>
         </div>

         <div 
           className="bg-white border text-center p-8 border-slate-200 rounded-2xl flex flex-col items-center cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
           onClick={() => router.push('/portal/islr-ari')}
         >
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <i className="pi pi-file-export text-2xl text-indigo-600"></i>
            </div>
            <h4 className="font-bold text-slate-800">Declaración ISLR (AR-I)</h4>
            <p className="text-sm text-slate-500 mt-2">Declare electrónicamente sus variaciones y cargas fiscales.</p>
         </div>
      </div>
    </div>
  );
}
