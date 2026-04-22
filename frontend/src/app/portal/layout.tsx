"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/portal/login';

  const LogoContent = (
    <>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
         <i className="pi pi-box text-white text-xl"></i>
      </div>
      <div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500 tracking-tight leading-none">Nebula Payrolls</h1>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Portal del Trabajador</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar simplificado */}
      <header className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {isLoginPage ? (
            <div className="flex items-center gap-3">
              {LogoContent}
            </div>
          ) : (
            <Link href="/portal/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              {LogoContent}
            </Link>
          )}
          <div className="flex items-center text-sm font-semibold text-gray-400">
            <i className="pi pi-shield mr-2 text-indigo-400"></i> Entorno Seguro
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Nebula ERP. Todos los derechos reservados.<br/>
          Tecnología de firma electrónica auditada.
        </div>
      </footer>
    </div>
  );
}
