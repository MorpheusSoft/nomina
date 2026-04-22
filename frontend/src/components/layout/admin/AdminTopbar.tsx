"use client";

import React from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export default function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-40 sticky top-0 border-b border-slate-200">
      <div className="flex items-center">
        <Button 
          icon="pi pi-bars" 
          text 
          rounded 
          aria-label="Menu" 
          onClick={onToggleSidebar} 
          className="mr-4 lg:hidden text-slate-500 hover:bg-slate-100" 
        />
        
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 font-semibold text-sm">
          <i className="pi pi-server text-xs"></i> Entorno de Súper Administrador
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2 border-l pl-4 ml-2 border-slate-200">
          <div className="flex flex-col text-right hidden md:flex">
             <span className="text-sm font-bold text-slate-800">Admin General</span>
             <span className="text-xs text-indigo-500 font-semibold">Root SaaS</span>
          </div>
          <Avatar 
            label="R"
            shape="circle" 
            className="bg-indigo-900 text-white cursor-pointer font-bold shadow-md" 
          />
          <Button 
            icon="pi pi-sign-out" 
            text 
            rounded 
            severity="danger" 
            tooltip="Cerrar Sesión Segura"
            tooltipOptions={{ position: 'bottom' }}
            onClick={logout} 
            className="ml-1" 
          />
        </div>
      </div>
    </header>
  );
}
