import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === user?.tenantId) return;
    try {
      const res = await api.post('/auth/switch-tenant', { targetTenantId: tenantId });
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard'; // Reload to clear react state context and go to app
    } catch (error) {
      console.error('Error switching tenant', error);
    }
  };

  const hasMultipleTenants = user?.availableTenants && user.availableTenants.length > 1;

  return (
    <header className="h-[72px] mt-4 mx-4 md:mx-8 bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 rounded-2xl flex items-center justify-between px-6 z-40 sticky top-4">
      <div className="flex items-center">
        <Button 
          icon="pi pi-bars" 
          text 
          rounded 
          aria-label="Menu" 
          onClick={onToggleSidebar} 
          className="mr-4 lg:hidden text-gray-500 hover:bg-gray-100" 
        />
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className={`hidden sm:flex items-center transition-colors ${hasMultipleTenants ? 'cursor-pointer hover:text-indigo-600' : ''}`}
            onClick={() => hasMultipleTenants && setShowDropdown(!showDropdown)}
          >
            <span className="font-bold text-slate-800 text-[15px]">{user?.tenantName || 'Nebula Payrolls SA'}</span>
            {hasMultipleTenants && <i className={`pi pi-chevron-${showDropdown ? 'up' : 'down'} ml-2 text-[10px] text-slate-500`}></i>}
          </div>
          
          {showDropdown && hasMultipleTenants && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-fadein">
              <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 uppercase border-b border-gray-100">
                Cambiar Espacio de Trabajo
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {user.availableTenants!.map((t: any) => (
                  <div 
                    key={t.tenantId} 
                    onClick={() => handleSwitchTenant(t.tenantId)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors flex flex-col ${t.tenantId === user?.tenantId ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <span className={`text-sm font-bold ${t.tenantId === user?.tenantId ? 'text-indigo-700' : 'text-slate-700'}`}>{t.tenantName}</span>
                    <span className="text-xs text-slate-500">{t.roleName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center text-[13px] text-slate-600 font-medium">
          <span>Hola, {(user as any)?.firstName || (user as any)?.name?.split(' ')[0] || 'User'}</span>
          <span className="mx-4 text-slate-300">|</span>
          <span>{new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).replace('.', '')}</span>
        </div>
        
        <div className="relative cursor-pointer">
          <i className="pi pi-bell text-slate-600 hover:text-indigo-600 transition-colors" style={{ fontSize: '1.2rem' }}></i>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-[#eaf0f6]"></span>
          </span>
        </div>
      </div>
    </header>
  );
}
