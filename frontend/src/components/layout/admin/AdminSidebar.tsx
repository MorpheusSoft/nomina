"use client";

import React from 'react';
import Link from 'next/link';
import { Ripple } from 'primereact/ripple';

export default function AdminSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside className={`fixed inset-y-0 left-0 bg-slate-900 text-white shadow-2xl w-64 transform transition-transform duration-300 z-50 select-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="h-16 flex items-center justify-center border-b border-white/10 relative">
        <span className="text-xl font-black text-white tracking-widest uppercase">Nómina <span className="text-indigo-400">Root</span></span>
      </div>
      
      <div className="py-6 overflow-y-auto h-[calc(100vh-4rem)] pb-20">
        <div className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Visión Global
        </div>
        <ul className="space-y-1 mb-8">
          <li>
            <Link href="/admin" className="flex items-center px-6 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition-colors p-ripple">
              <i className="pi pi-home mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Dashboard</span>
              <Ripple />
            </Link>
          </li>
        </ul>

        <div className="px-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Gestión de Clientes
        </div>
        <ul className="space-y-1">
          <li>
            <Link href="/admin/tenants" className="flex items-center px-6 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition-colors p-ripple border-l-2 border-transparent hover:border-indigo-400">
              <i className="pi pi-building mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Empresas (Tenants)</span>
              <Ripple />
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center px-6 py-3 text-slate-500 cursor-not-allowed transition-colors p-ripple">
              <i className="pi pi-credit-card mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Suscripciones <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded ml-2">Próximamente</span></span>
            </a>
          </li>
          <li>
            <Link href="/admin/consultants" className="flex items-center px-6 py-3 text-emerald-300 hover:bg-emerald-900/40 hover:text-emerald-200 transition-colors p-ripple border-l-2 border-transparent hover:border-emerald-400">
              <i className="pi pi-briefcase mr-3 text-lg opacity-80"></i>
              <span className="font-medium text-sm">Consultores Especialistas</span>
              <Ripple />
            </Link>
          </li>
        </ul>
        
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10 bg-slate-950/50 backdrop-blur-md">
           <Link href="/dashboard" className="flex items-center justify-center w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-sm font-semibold border border-white/5">
             <i className="pi pi-external-link mr-2 text-xs"></i> Ir a App Clientes
           </Link>
        </div>
      </div>
    </aside>
  );
}
