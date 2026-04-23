"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ripple } from 'primereact/ripple';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import api from '@/lib/api';
import { useRef } from 'react';

const NavLink = ({ href, icon, label, specialColorType = 'indigo', pathname, exact = false }: { href: string, icon: string, label: string, specialColorType?: string, pathname: string, exact?: boolean }) => {
  const isActive = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'));

  // Light Mode Color Map mapping
  const activeColorMap: Record<string, any> = {
    'indigo': {
      bg: 'bg-indigo-100/80 rounded-2xl',
      text: 'text-indigo-800',
      indicator: 'bg-indigo-600',
      iconText: 'text-indigo-700',
    },
    'emerald': {
      bg: 'bg-emerald-50 border border-emerald-100/50 rounded-xl',
      text: 'text-emerald-700',
      indicator: 'bg-emerald-500',
      iconText: 'text-emerald-600',
    },
    'orange': {
      bg: 'bg-orange-50 border border-orange-100/50 rounded-xl',
      text: 'text-orange-700',
      indicator: 'bg-orange-500',
      iconText: 'text-orange-500',
    },
    'red': {
      bg: 'bg-rose-50 border border-rose-100/50 rounded-xl',
      text: 'text-rose-700',
      indicator: 'bg-rose-500',
      iconText: 'text-rose-600',
    }
  };

  const style = activeColorMap[specialColorType] || activeColorMap['indigo'];

  if (isActive) {
    return (
      <li className="relative py-1">
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 ${style.indicator} rounded-r-full shadow-md z-10`}></div>
        <div className="px-5">
          <Link href={href} className={`flex items-center px-4 py-[10px] ${style.bg} ${style.text} shadow-none transition-all p-ripple`}>
            <i className={`pi ${icon} mr-3 text-lg ${style.iconText}`}></i>
            <span className="font-bold tracking-wide text-[13px]">{label}</span>
            <Ripple />
          </Link>
        </div>
      </li>
    );
  }
  
  return (
    <li className="py-1">
      <div className="px-5">
        <Link href={href} className="flex items-center px-4 py-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all p-ripple group">
          <i className={`pi ${icon} mr-3 text-lg opacity-70 group-hover:opacity-100 transition-opacity`}></i>
          <span className="font-medium tracking-wide text-[13px]">{label}</span>
          <Ripple />
        </Link>
      </div>
    </li>
  );
};

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const toast = useRef<Toast>(null);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.trim() === '') {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Escribe una nueva contraseña.' });
      return;
    }
    try {
      setLoadingPassword(true);
      await api.patch('/users/me/password', { newPassword });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tu contraseña fue modificada.' });
      setPasswordDialogVisible(false);
      setNewPassword('');
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Falló el cambio de contraseña.' });
    } finally {
      setLoadingPassword(false);
    }
  };
  
  const [sections, setSections] = useState({
    config: pathname.startsWith('/settings'),
    personnel: pathname.startsWith('/workers') || pathname.startsWith('/hr/tickets'),
    operations: pathname.startsWith('/payroll'),
    finance: pathname.startsWith('/finance') || pathname.startsWith('/reports') || pathname.startsWith('/hr/islr') || pathname.startsWith('/portal/islr-ari')
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => {
      if (prev[section]) return { ...prev, [section]: false };
      return { config: false, personnel: false, operations: false, finance: false, [section]: true };
    });
  };

  return (
    <aside className={`fixed top-4 bottom-4 left-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] w-[260px] transform transition-transform duration-300 z-50 select-none overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-24 flex items-center px-8 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 border border-indigo-500/20">
            <i className="pi pi-cloud text-white text-xl font-bold drop-shadow-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[24px] leading-none font-black text-slate-900 tracking-tight">Nebula</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-500 mt-1">Payrolls</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto modern-scrollbar pt-6 pb-4">
        <ul className="space-y-1 mb-8">
          <NavLink href="/dashboard" icon="pi-home" label="Dashboard General" pathname={pathname} exact={true} />
          <NavLink href="/dashboard/oracle" icon="pi-sparkles" label="Oráculo Analítico" specialColorType="indigo" pathname={pathname} />
        </ul>

        <div 
          className="px-8 mt-2 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('config')}
        >
          <span>Configuración Inicial</span>
          <i className={`pi ${sections.config ? 'pi-chevron-down' : 'pi-chevron-right'} text-[9px]`}></i>
        </div>
        <ul className={`space-y-0.5 overflow-hidden transition-all duration-300 ${sections.config ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <NavLink href="/settings/organization" icon="pi-sitemap" label="Empresa / Tenant" pathname={pathname} />
          {(user?.permissions?.includes('ALL_ACCESS') || (user as any)?.email === 'admin@nebulapayrolls.com') && (
            <>
              <NavLink href="/settings/roles" icon="pi-shield" label="Permisos y Roles" pathname={pathname} />
              <NavLink href="/settings/users" icon="pi-user-plus" label="Cuentas y Accesos" pathname={pathname} />
            </>
          )}
          <NavLink href="/settings/payroll-groups" icon="pi-users" label="Grupos y Convenios" pathname={pathname} />
          <NavLink href="/settings/concepts" icon="pi-tags" label="Arquitectura de Conceptos" pathname={pathname} />
          <NavLink href="/settings/shifts" icon="pi-clock" label="Matrices de Turnos Fijos" pathname={pathname} />
          <NavLink href="/settings/shift-patterns" icon="pi-sync" label="Rotaciones y Patrones" pathname={pathname} />
          <NavLink href="/settings/accumulators" icon="pi-database" label="Acumuladores Dinámicos" pathname={pathname} />
          <NavLink href="/settings/global-variables" icon="pi-sliders-h" label="Variables Globales" pathname={pathname} />
          <NavLink href="/settings/holidays" icon="pi-calendar-plus" label="Calendario & Feriados" pathname={pathname} />
          <NavLink href="/settings/catalogs" icon="pi-list" label="Catálogos y Listas" pathname={pathname} />
          <NavLink href="/settings/templates" icon="pi-file-edit" label="Plantillas de Documentos" pathname={pathname} />
        </ul>

        <div 
          className="px-8 mt-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('personnel')}
        >
          <span>Gestión de Personal</span>
          <i className={`pi ${sections.personnel ? 'pi-chevron-down' : 'pi-chevron-right'} text-[9px]`}></i>
        </div>
        <ul className={`space-y-0.5 overflow-hidden transition-all duration-300 ${sections.personnel ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <NavLink href="/workers" icon="pi-id-card" label="Fichas de Trabajadores" pathname={pathname} exact={true} />
          <NavLink href="/workers/absences" icon="pi-calendar-minus" label="Control de Ausencias" pathname={pathname} />
          <NavLink href="/hr/tickets" icon="pi-inbox" label="Taquilla VIP Tickets" pathname={pathname} />
        </ul>

        <div 
          className="px-8 mt-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('operations')}
        >
          <span>Operaciones & Nómina</span>
          <i className={`pi ${sections.operations ? 'pi-chevron-down' : 'pi-chevron-right'} text-[9px]`}></i>
        </div>
        <ul className={`space-y-0.5 overflow-hidden transition-all duration-300 ${sections.operations ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <NavLink href="/payroll/attendance/import" icon="pi-file-excel" label="Importar Fichajes" pathname={pathname} />
          <NavLink href="/payroll/attendance/punches" icon="pi-list" label="Auditoría de Marcas" pathname={pathname} />
          <NavLink href="/payroll/novelties" icon="pi-inbox" label="Bandeja de Novedades" pathname={pathname} />
          <NavLink href="/payroll/attendance" icon="pi-check-square" label="Consolidación Asistencia" pathname={pathname} exact={true} />
          <NavLink href="/payroll/periods" icon="pi-bolt" label="Motor de Nómina" pathname={pathname} />
          <NavLink href="/payroll/vacations" icon="pi-sun" label="Calculadora Vacaciones" specialColorType="orange" pathname={pathname} />
          <NavLink href="/payroll/liquidations" icon="pi-wallet" label="Simulador Liquidaciones" specialColorType="red" pathname={pathname} />
          <NavLink href="/payroll/accounting-journals" icon="pi-book" label="Integración Contable" specialColorType="emerald" pathname={pathname} />
        </ul>

        <div 
          className="px-8 mt-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('finance')}
        >
          <span>Finanzas y Control</span>
          <i className={`pi ${sections.finance ? 'pi-chevron-down' : 'pi-chevron-right'} text-[9px]`}></i>
        </div>
        <ul className={`space-y-0.5 overflow-hidden transition-all duration-300 ${sections.finance ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <NavLink href="/finance/budgets" icon="pi-chart-bar" label="Control Presupuestario" specialColorType="emerald" pathname={pathname} />
          <NavLink href="/reports/concepts" icon="pi-chart-pie" label="Sabana de Conceptos" pathname={pathname} />
          <NavLink href="/reports/payroll-approval" icon="pi-check-circle" label="Aprobación de Nóminas" pathname={pathname} />
          <NavLink href="/reports/loans" icon="pi-money-bill" label="Préstamos y Anticipos" pathname={pathname} />
          <NavLink href="/hr/islr" icon="pi-file-export" label="Retenciones ISLR (AR-I)" specialColorType="purple" pathname={pathname} />
        </ul>
      </div>
        
      {/* User Card at Bottom */}
      {user && (
        <div className="w-full bg-white z-20 pb-4 pt-2 shrink-0 mt-auto">
            {(user as any)?.email === 'admin@nebulapayrolls.com' && (
              <div className="px-5 mb-3">
                <button 
                  onClick={async () => {
                    try {
                      // Regresamos al contexto de la matriz forzosamente
                      const res = await api.post('/auth/return-to-root');
                      localStorage.setItem('access_token', res.data.accessToken);
                      localStorage.setItem('user', JSON.stringify(res.data.user));
                      window.location.href = '/admin'; // Refresca recargando todo el state en /admin
                    } catch (e) {
                      console.error(e);
                      window.location.href = '/admin';
                    }
                  }}
                  className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 transition-all text-xs font-bold border border-indigo-200 shadow-sm">
                  <i className="pi pi-shield mr-2"></i> Consola Administrativa
                </button>
              </div>
            )}
            <div className="mx-6 border-t border-slate-200 mb-4"></div>
            <div className="px-6 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {(user as any)?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-sm font-bold text-slate-800 leading-tight truncate">{(user as any)?.name?.split(' ')[0] || (user as any)?.email || 'User'}</span>
                  <span className="text-[11px] text-slate-500 truncate">{(user as any)?.role || 'Admin'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 shrink-0 pr-1">
                <i onClick={() => setPasswordDialogVisible(true)} className="pi pi-cog hover:text-slate-700 cursor-pointer transition-colors p-1" style={{ fontSize: '1.2rem' }} title="Cambiar Contraseña"></i>
                <i onClick={() => logout && logout()} className="pi pi-sign-out hover:text-rose-500 cursor-pointer transition-colors p-1" style={{ fontSize: '1.2rem' }} title="Cerrar Sesión"></i>
              </div>
            </div>
        </div>
      )}

      <Toast ref={toast} position="bottom-right" />
      <Dialog visible={passwordDialogVisible} style={{ width: '400px' }} header="Cambiar Contraseña" modal className="p-fluid" onHide={() => setPasswordDialogVisible(false)}>
         <div className="pt-2">
            <label className="font-bold text-gray-700 mb-2 block text-sm">Nueva Contraseña</label>
            <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} toggleMask feedback={false} className="w-full" inputClassName="w-full" />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
               <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setPasswordDialogVisible(false)} type="button" severity="secondary" />
               <Button label="Actualizar" icon="pi pi-check" onClick={handleChangePassword} loading={loadingPassword} className="bg-indigo-600 border-none" />
            </div>
         </div>
      </Dialog>
      
      <style dangerouslySetInnerHTML={{__html: `
        .modern-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .modern-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(226, 232, 240, 0.8); /* slate-200 */
          border-radius: 10px;
        }
        .modern-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.8); /* slate-300 */
        }
      `}} />
    </aside>
  );
}
