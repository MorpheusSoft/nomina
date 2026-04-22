"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import Dropdown from '@/components/ui/Dropdown';
import axios from 'axios';

// Usamos Axios directo para evitar el interceptor JWT de api.ts que redirige al login administrativo
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

const prefixOptions = [
  { label: 'V', value: 'V' },
  { label: 'E', value: 'E' },
  { label: 'P', value: 'P' }
];

export default function PortalLoginPage() {
  const [docPrefix, setDocPrefix] = useState('V');
  const [docNumber, setDocNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber || !birthDate) {
      toast.current?.show({ severity: 'warn', summary: 'Atención', detail: 'Debe completar ambos campos' });
      return;
    }

    const identityNumber = `${docPrefix}-${docNumber}`;

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/portal/login`, { identityNumber, birthDate });
      
      if (res.data.success) {
        // Almacenamos credenciales temporales del trabajador
        localStorage.setItem('portal_worker_id', res.data.workerId);
        localStorage.setItem('portal_worker_name', `${res.data.firstName} ${res.data.lastName}`);
        
        toast.current?.show({ severity: 'success', summary: 'Bienvenido', detail: 'Accediendo a su portal...' });
        setTimeout(() => {
          router.push('/portal/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Acceso Denegado', 
        detail: error.response?.data?.message || 'Cédula o fecha de nacimiento incorrecta'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <Toast ref={toast} position="top-center" />
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-indigo-50 w-full max-w-md relative overflow-hidden">
        {/* Decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <i className="pi pi-id-card text-3xl text-indigo-600"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Acceso Seguro</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Ingrese sus datos para consultar sus recibos de pago y documentos laborales.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Cédula de Identidad</label>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon bg-transparent border-r-0 pl-4 py-3 shrink-0 rounded-l-xl border-slate-200">
                <i className="pi pi-user text-indigo-400" />
              </span>
              <Dropdown 
                value={docPrefix} 
                options={prefixOptions} 
                onChange={(e) => setDocPrefix(e.value)} 
                className="w-16 border-l-0 border-r-0 shadow-none hover:border-indigo-300"
                pt={{
                  root: { style: { borderLeft: 'none' } },
                  input: { className: 'pl-1 py-3 font-semibold text-slate-700' }
                }}
              />
              <InputText 
                value={docNumber} 
                onChange={(e) => setDocNumber(e.target.value)} 
                placeholder="12345678" 
                className="w-full py-3 pr-3 rounded-r-xl border-l-0 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 transition-colors font-medium text-slate-700" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Fecha de Nacimiento</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-calendar text-indigo-400 ml-2" />
              <input 
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full py-3 pr-3 rounded-xl border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 outline-none"
                style={{ paddingLeft: '3rem' }}
              />
            </span>
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-semibold"><i className="pi pi-info-circle mr-1"></i>Esta información valida su identidad.</p>
          </div>

          <Button 
            label="Ingresar al Portal" 
            icon="pi pi-arrow-right" 
            iconPos="right" 
            loading={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 border-none p-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all mt-2" 
            type="submit" 
          />
        </form>
      </div>
    </div>
  );
}
