"use client";

import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email,
        password
      });

      if (res.data.accessToken) {
        login(res.data.accessToken, res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error de conexión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
             <i className="pi pi-bolt text-5xl text-white drop-shadow-lg mb-3"></i>
             <h1 className="text-3xl font-extrabold text-white tracking-tight">Nebula Pay</h1>
             <p className="text-indigo-100 mt-2 text-sm font-medium tracking-wide">ENTERPRISE PAYROLL ENGINE</p>
          </div>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Inicia sesión en tu Espacio</h2>
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start">
               <i className="pi pi-exclamation-circle mt-0.5 mr-2"></i>
               <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
              <div className="relative w-full">
                <i className="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 text-lg" />
                <InputText 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full py-3 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium" 
                  style={{ paddingLeft: '3rem' }}
                  placeholder="admin@nebulapayrolls.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña Segura</label>
              <Password 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                feedback={false}
                toggleMask
                inputClassName="w-full py-3 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium" 
                className="w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              label={isLoading ? "Iniciando Enlace..." : "Acceder al Motor"} 
              icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl border-none shadow-lg shadow-indigo-200 transition-all mt-4" 
              disabled={isLoading || !email || !password}
            />
          </form>
          
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-300 font-medium tracking-wide mt-2">POWERED BY MORPHEUSSOFT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
