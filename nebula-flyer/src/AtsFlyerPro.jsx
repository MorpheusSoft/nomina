import React from 'react';
import {
  CheckCircle2,
  BrainCircuit,
  Users,
  FileText,
  Cloud,
  Zap,
  Briefcase
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AtsFlyerPro = () => {
  return (
    <div className="w-[800px] bg-white font-sans text-slate-900 flex flex-col mx-auto shadow-2xl relative">

      {/* HEADER HERO SECTION */}
      <div className="bg-slate-900 text-white p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-8 bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <Cloud className="text-indigo-400" size={20} />
            <span className="text-sm font-black tracking-widest uppercase">Nebula Talent Acquisition</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Recluta el mejor talento con <span className="text-indigo-400">precisión</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            El Módulo ATS corporativo que centraliza tu embudo de contratación y utiliza Inteligencia Artificial para que tú tomes las mejores decisiones sin leer miles de hojas.
          </p>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="p-14 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Feature 1 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="text-slate-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Portal de Vacantes</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Publica vacantes con códigos QR o enlaces únicos. Los candidatos se postulan desde cualquier dispositivo al instante.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Análisis de Documentos</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Los candidatos cargan su CV y la IA extrae su experiencia, documento de identidad y habilidades de forma estructurada.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <Users className="text-slate-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Experiencia Premium</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Una plataforma privada e intuitiva para que los aplicantes presenten sus evaluaciones técnicas y psicométricas.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-emerald-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Selección de Shortlist</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Identifica a los candidatos más elegibles en un clic y conviértelos automáticamente en trabajadores activos.</p>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM CALL TO ACTION */}
      <div className="bg-slate-50 p-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG value="https://nebulapayrolls.com" size={90} fgColor="#0f172a" />
          </div>
          <div>
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-[0.15em] mb-1">Módulo Disponible</p>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Moderniza tu reclutamiento</h4>
            <p className="text-slate-500 text-sm max-w-sm">Escanea el código para conocer cómo Nebula optimiza la adquisición de talento.</p>
          </div>
        </div>

        <div className="text-right border-l-2 border-slate-200 pl-8">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1 font-bold">Contacto Corporativo</p>
          <p className="text-slate-800 font-bold">lzambrano@nebulapayrolls.com</p>
          <p className="text-slate-500 font-medium">+58 422 268 4691</p>
          <a href="https://nebulapayrolls.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-end space-x-1 text-indigo-600 hover:text-indigo-800 transition-colors duration-300 mt-2 font-bold text-sm">
            <Cloud size={14} />
            <span>nebulapayrolls.com</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default AtsFlyerPro;
