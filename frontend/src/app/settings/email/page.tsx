"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/tenants/my-status');
      if (res.data) {
        setSmtpEmail(res.data.smtpEmail || '');
        setSmtpPassword(res.data.smtpPassword || '');
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/tenants/my-settings', { smtpEmail, smtpPassword });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Configuración guardada correctamente' });
    } catch (error) {
      console.error(error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar configuración' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Toast ref={toast} />
      <div className="p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuración de Correo</h1>
        <p className="text-slate-600 mb-8">Personaliza la cuenta de correo electrónico utilizada para enviar notificaciones automáticas (ej. Portal del Candidato).</p>

        {loading ? (
          <div className="flex justify-center p-10"><i className="pi pi-spin pi-spinner text-3xl text-indigo-500"></i></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <i className="pi pi-envelope text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Servidor SMTP (Gmail)</h2>
                <p className="text-sm text-slate-500">Credenciales de aplicación para el envío de correos.</p>
              </div>
            </div>

            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico (Usuario SMTP)</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-at text-slate-400" />
                  <InputText 
                    value={smtpEmail} 
                    onChange={(e) => setSmtpEmail(e.target.value)} 
                    placeholder="ej. reclutamiento@miempresa.com" 
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña de Aplicación</label>
                <Password 
                  value={smtpPassword} 
                  onChange={(e) => setSmtpPassword(e.target.value)} 
                  toggleMask 
                  feedback={false}
                  placeholder="Ej. xxxx xxxx xxxx xxxx"
                  className="w-full"
                  inputClassName="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Si usas Gmail, asegúrate de utilizar una <a href="https://support.google.com/accounts/answer/185833" target="_blank" className="text-indigo-600 hover:underline font-medium">Contraseña de Aplicación</a>, no tu contraseña habitual.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button 
                  label="Guardar Configuración" 
                  icon="pi pi-save" 
                  onClick={handleSave} 
                  loading={saving}
                  className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
