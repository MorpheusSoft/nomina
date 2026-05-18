import React from 'react';
import { 
  CheckCircle2, 
  BrainCircuit, 
  Users, 
  FileText, 
  Target, 
  Star, 
  Cloud,
  Zap,
  Briefcase
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AtsFlyer = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-12 font-sans">
      {/* Contenedor Principal con efecto de elevación */}
      <div className="max-w-5xl w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* LADO IZQUIERDO: Branding y Propuesta de Valor Central */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Elementos decorativos abstractos */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500 rounded-full blur-[100px] opacity-10 -ml-30 -mb-30"></div>
          
          <div className="relative z-10">
            {/* Logo Area */}
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400">
                <Cloud className="text-white" size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none">NEBULA</span>
                <span className="text-purple-300 text-xs font-bold tracking-[0.2em]">TALENT ACQUISITION</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-8">
              Contrataciones <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 print:text-purple-400 print:bg-none">potenciadas por IA.</span>
            </h1>
            
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-medium">
              Transforma semanas de selección manual en decisiones instantáneas y precisas con el nuevo módulo ATS de Nebula.
            </p>

            {/* Puntos clave mejorados */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-purple-500/20 p-1 rounded-full">
                  <FileText className="text-purple-300" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Carga de CV Automática</p>
                  <p className="text-indigo-200 text-xs">El Oráculo extrae datos vitales de los PDFs al instante.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                  <Zap className="text-blue-300" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Exámenes Generados por IA</p>
                  <p className="text-indigo-200 text-xs">Cuestionarios técnicos y psicométricos únicos en segundos.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-amber-500/20 p-1 rounded-full">
                  <Star className="text-amber-400" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Resumen Ejecutivo Inteligente</p>
                  <p className="text-indigo-200 text-xs">Análisis cualitativo del candidato redactado por IA.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 pt-8 border-t border-indigo-700/50">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] mb-1 font-bold">Agenda tu Demostración</p>
                <p className="text-lg font-bold">lzambrano@nebulapayrolls.com</p>
                <p className="text-purple-300 font-bold">+58 422 268 4691</p>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Soluciones y Llamado a la Acción */}
        <div className="md:w-7/12 p-10 md:p-16 bg-white flex flex-col">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Recluta el mejor talento, <br /> sin leer miles de hojas.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed border-l-4 border-purple-500 pl-6">
              El Módulo ATS de Nebula centraliza tu embudo de contratación. El Oráculo actúa como tu copiloto inteligente, agilizando drásticamente el proceso operativo para que tú tomes las mejores decisiones.
            </p>
          </div>

          {/* Grid de Soluciones de Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Briefcase size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Portal de Vacantes</h3>
              <p className="text-sm text-slate-500 leading-snug">Publica vacantes con códigos QR o enlaces únicos. Los candidatos se postulan desde cualquier dispositivo al instante.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <BrainCircuit size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Lectura de PDF (IA)</h3>
              <p className="text-sm text-slate-500 leading-snug">Los candidatos cargan su CV y la IA extrae su experiencia, documento de identidad, habilidades y datos de contacto automáticamente.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Portal del Candidato</h3>
              <p className="text-sm text-slate-500 leading-snug">Experiencia premium para el aplicante. Una plataforma privada para presentar exámenes técnicos y psicométricos.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Filtro Top 5 (Shortlist)</h3>
              <p className="text-sm text-slate-500 leading-snug">Selecciona a los candidatos más elegibles en un clic y conviértelos automáticamente en trabajadores sin duplicar datos.</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-auto">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center sm:text-left">
                  <p className="text-purple-400 font-black text-sm uppercase tracking-[0.2em] mb-2">Prueba la Beta</p>
                  <h4 className="text-2xl font-bold">Experimenta el Oráculo</h4>
                  <p className="text-slate-400 text-sm mt-1">Escanea el código y descubre el futuro de la gestión del talento.</p>
                </div>
                
                <div className="bg-white p-2 rounded-xl shadow-xl flex-shrink-0">
                  <QRCodeSVG 
                    value="https://nebulapayrolls.com" 
                    size={80}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center">
               <a href="https://nebulapayrolls.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                 <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded flex items-center justify-center shadow-sm">
                   <Cloud className="text-white" size={12} />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-500">nebulapayrolls.com</span>
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsFlyer;
