"use client";

import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import OracleCopilotWidget from '../shared/OracleCopilotWidget';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hidden by default on mobile

  return (
    <div className="min-h-screen bg-[#eaf0f6] text-gray-900 font-sans flex text-sm relative">
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col transition-all duration-300 ml-0 lg:ml-[290px] min-h-screen">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
      
      {/* Global AI Copilot */}
      <OracleCopilotWidget />
    </div>
  );
}
