"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

export default function PWALoginPage() {
  const [cedula, setCedula] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Login Logic for Phase 4
    setTimeout(() => {
      if (cedula && pin === '1234') {
        // Assume successful login as Supervisor
        localStorage.setItem('pwa_token', 'mock_jwt_token');
        router.push('/pwa/supervisor');
      } else {
        setError('Credenciales inválidas. Intente Cédula + PIN (1234).');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12">
      <div className="w-full text-center mb-8">
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
          <i className="pi pi-compass text-4xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nebula Asistencia</h1>
        <p className="text-gray-500 mt-2">Portal de Campo</p>
      </div>

      <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
        {error && <Message severity="error" text={error} className="w-full" />}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Cédula de Identidad</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-id-card" />
            <InputText value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ej. 15332211" className="w-full p-3 rounded-xl" keyfilter="int" />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">PIN de Acceso</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-lock" />
            <Password value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" className="w-full" inputClassName="w-full p-3 rounded-xl" feedback={false} toggleMask />
          </span>
        </div>

        <Button label="Ingresar al Sistema" icon="pi pi-arrow-right" iconPos="right" loading={loading} className="w-full p-3 mt-4 rounded-xl font-bold text-lg" type="submit" />
      </form>

      <div className="mt-auto pt-12 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} MorpheusSoft Nebula ERP</p>
      </div>
    </div>
  );
}
