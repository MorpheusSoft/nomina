"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Ripple } from 'primereact/ripple';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { user } = useAuth();
  const [sections, setSections] = useState({
    config: false,
    personnel: false,
    operations: false,
    finance: false
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => {
      if (prev[section]) return { ...prev, [section]: false };
      return { config: false, personnel: false, operations: false, finance: false, [section]: true };
    });
  };

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white shadow-xl w-64 transform transition-transform duration-300 z-50 select-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-100 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-indigo-500/20">
            <i className="pi pi-cloud text-white text-base font-bold"></i>
          </div>
          <span className="text-xl font-black text-indigo-600 tracking-tight">Nebula Payrolls</span>
        </div>
      </div>
      <div className="py-6 overflow-y-auto h-[calc(100vh-4rem)] pb-20">
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-home mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Dashboard General</span>
              <Ripple />
            </Link>
          </li>
        </ul>

        {/* Root zone moved to /admin router */}

        <div 
          className="px-6 mt-6 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('config')}
        >
          <span>Configuración Inicial</span>
          <i className={`pi ${sections.config ? 'pi-chevron-down' : 'pi-chevron-right'} text-[10px]`}></i>
        </div>
        <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${sections.config ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <li>
            <Link href="/settings/organization" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-sitemap mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Empresa / Tenant</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/roles" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-shield mr-3 text-lg text-amber-500 opacity-90"></i>
              <span className="font-medium text-sm">Permisos y Roles</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-user-plus mr-3 text-lg text-blue-500 opacity-90"></i>
              <span className="font-medium text-sm">Cuentas y Accesos</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/payroll-groups" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-users mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Grupos y Convenios</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/concepts" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-tags mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Arquitectura de Conceptos</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/shifts" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-clock mr-3 text-lg opacity-80 text-teal-600"></i>
              <span className="font-medium text-sm">Matrices de Turnos</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/accumulators" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-database mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Acumuladores Dinámicos</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/global-variables" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-sliders-h mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Variables Globales</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/settings/holidays" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-calendar-plus mr-3 text-lg text-red-500 opacity-90"></i>
              <span className="font-medium text-sm">Calendario & Feriados</span>
              <Ripple />
            </Link>
          </li>
        </ul>

        <div 
          className="px-6 mt-8 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('personnel')}
        >
          <span>Gestión de Personal</span>
          <i className={`pi ${sections.personnel ? 'pi-chevron-down' : 'pi-chevron-right'} text-[10px]`}></i>
        </div>
        <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${sections.personnel ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <li>
            <Link href="/workers" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-id-card mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Fichas de Trabajadores</span>
              <Ripple />
            </Link>
          </li>
        </ul>

        <div 
          className="px-6 mt-8 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('operations')}
        >
          <span>Operaciones & Nómina</span>
          <i className={`pi ${sections.operations ? 'pi-chevron-down' : 'pi-chevron-right'} text-[10px]`}></i>
        </div>
        <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${sections.operations ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <li>
            <Link href="/payroll/attendance/import" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-file-excel mr-3 text-lg text-emerald-500 opacity-90"></i>
              <span className="font-medium text-sm">Importar Fichajes</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/attendance/punches" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-list mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Auditoría de Marcas</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/attendance" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-check-square mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Consolidación Asistencia</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/periods" className="flex items-center px-6 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors p-ripple">
              <i className="pi pi-bolt mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Motor de Nómina</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/vacations" className="flex items-center px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors p-ripple">
              <i className="pi pi-sun mr-3 text-lg text-orange-400 opacity-90"></i>
              <span className="font-medium text-sm">Calculadora de Vacaciones</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/liquidations" className="flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors p-ripple">
              <i className="pi pi-wallet mr-3 text-lg text-red-500 opacity-90"></i>
              <span className="font-medium text-sm">Simulador de Liquidaciones</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <Link href="/payroll/accounting-journals" className="flex items-center px-6 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors p-ripple">
              <i className="pi pi-book mr-3 text-lg text-emerald-500 opacity-90"></i>
              <span className="font-medium text-sm">Integración Contable</span>
              <Ripple />
            </Link>
          </li>
        </ul>

        <div 
          className="px-6 mt-8 mb-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => toggleSection('finance')}
        >
          <span>Finanzas y Control</span>
          <i className={`pi ${sections.finance ? 'pi-chevron-down' : 'pi-chevron-right'} text-[10px]`}></i>
        </div>
        <ul className={`space-y-1 overflow-hidden transition-all duration-300 ${sections.finance ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <li>
            <Link href="/finance/budgets" className="flex items-center px-6 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors p-ripple">
              <i className="pi pi-chart-bar mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Control Presupuestario</span>
              <Ripple />
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
