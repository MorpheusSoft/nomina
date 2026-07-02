"use client";

import React from 'react';
import { Cloud, Download, MessageCircle, Mail, Globe, FileText, Users, BarChart3 } from 'lucide-react';

export default function VCardPage() {

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans selection:bg-cyan-500/30 flex justify-center">
      <div className="w-full max-w-md p-6 sm:p-8 flex flex-col items-center gap-8 pb-12">
        
        {/* Header - Nebula Brand */}
        <div className="flex flex-col items-center gap-2 mt-8 animate-fade-in">
          <div className="relative p-4 rounded-2xl bg-[#4b43f0] shadow-[0_0_30px_rgba(75,67,240,0.3)]">
            <Cloud className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div className="text-center mt-2">
            <h1 className="text-2xl font-bold tracking-widest text-white">NÉBULA</h1>
            <p className="text-xs text-cyan-200/60 font-light tracking-wide uppercase mt-1">Inteligencia Corporativa</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="text-center w-full mt-2">
          <h2 className="text-3xl font-semibold text-white mb-2">Lindbergh Zambrano</h2>
          <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">Director Ejecutivo</p>
        </div>

        {/* Primary CTA - Download VCard */}
        <a 
          href="/Lindbergh_Zambrano.vcf"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/25 border border-white/10 group block text-center"
        >
          <div className="flex items-center justify-center gap-3 w-full">
            <Download className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-semibold text-white text-base tracking-wide">Guardar en Contactos</span>
          </div>
        </a>

        {/* Direct Channels (Secondary CTAs) */}
        <div className="w-full flex flex-col gap-3">
          <a 
            href="https://wa.me/584222684691?text=Hola%20Lindbergh,%20me%20comunico%20contigo%20para..."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] backdrop-blur-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="p-2 rounded-xl bg-green-500/10">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-200">Enviar Mensaje por WhatsApp</span>
          </a>

          <a 
            href="mailto:lzambrano@nebulapayrolls.com"
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] backdrop-blur-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-200">Enviar Correo Electrónico</span>
          </a>

          <a 
            href="https://nebulapayrolls.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] backdrop-blur-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-200">Visitar Sitio Web</span>
          </a>
        </div>

        {/* Portfolio / Products */}
        <div className="w-full mt-4">
          <h3 className="text-[10px] font-bold text-gray-500 tracking-widest mb-4 uppercase ml-1">Soluciones Corporativas</h3>
          <div className="flex flex-col gap-3">
            
            <a href="/flyers/Nebula_Payrolls_Corporate_Flyer.pdf" target="_blank" rel="noopener noreferrer" className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] hover:border-cyan-500/30 transition-colors flex items-center gap-4 text-left group block cursor-pointer">
              <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                <FileText className="w-5 h-5 text-gray-300 group-hover:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">Nebula Payrolls</p>
                <p className="text-xs text-gray-500 mt-0.5">Gestión de Nómina y Turnos</p>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </a>

            <a href="/flyers/Nebula_ATS_Corporate_Flyer.pdf" target="_blank" rel="noopener noreferrer" className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] hover:border-cyan-500/30 transition-colors flex items-center gap-4 text-left group block cursor-pointer">
              <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                <Users className="w-5 h-5 text-gray-300 group-hover:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">Nebula Talent Acquisition</p>
                <p className="text-xs text-gray-500 mt-0.5">Ecosistema ATS Integral</p>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </a>

            <a href="/flyers/Nebula_Performance_Corporate_Flyer.pdf" target="_blank" rel="noopener noreferrer" className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] hover:border-cyan-500/30 transition-colors flex items-center gap-4 text-left group block cursor-pointer">
              <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-300 group-hover:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">Nebula Performance</p>
                <p className="text-xs text-gray-500 mt-0.5">Evaluación de Desempeño</p>
              </div>
              <Download className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </a>

            <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent border border-white/[0.05] opacity-40 flex items-center gap-4 text-left border-dashed">
              <div className="p-2.5 rounded-xl bg-white/5">
                <Cloud className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400">Próximamente</p>
                <p className="text-xs text-gray-600 mt-0.5">Nuevas soluciones IA</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-[10px] font-bold tracking-widest text-gray-600">POWERED BY NEBULA AI</p>
        </div>

      </div>
    </div>
  );
}
