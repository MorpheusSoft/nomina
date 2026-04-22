"use client";

import React, { useState } from 'react';
import AdminTopbar from './AdminTopbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex text-sm">
      <AdminSidebar isOpen={sidebarOpen} />
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col transition-all duration-300 ml-0 lg:ml-64 min-h-screen">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
