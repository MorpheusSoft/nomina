import React from 'react';
import {
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Cloud
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const App = () => {
  return (
    <div className="w-[800px] bg-white font-sans text-slate-900 flex flex-col mx-auto shadow-2xl relative">

      {/* HEADER HERO SECTION */}
      <div className="bg-slate-900 text-white p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-8 bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <Cloud className="text-indigo-400" size={20} />
            <span className="text-sm font-black tracking-widest uppercase">Nebula Payrolls</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Tu nómina, bajo control con <span className="text-indigo-400">precisión absoluta</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            La plataforma corporativa integral para automatizar la gestión humana. Cumplimiento legal estricto, cálculos exactos y control total, sin hojas de cálculo.
          </p>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="p-14 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Feature 1 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-slate-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Asistencia Geolocalizada</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Registro de asistencia basado en GPS con funcionamiento 100% offline. Captura ubicación y selfie probatoria incluso en zonas remotas sin cobertura.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <Clock className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gestión de Turnos Dinámicos</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Control centralizado para guardias rotativas, esquemas 24/7 y cuadrillas de campo. Adaptable de manera nativa a cualquier sector industrial.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Zap className="text-emerald-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cálculos con Inteligencia Artificial</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Olvídese de programar fórmulas complejas. Solicite conceptos salariales en lenguaje natural y el Oráculo generará la estructura con auditoría legal integrada.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Privacidad Salarial Jerárquica</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Sistema de permisos restrictivos por nivel. Garantiza que las nóminas gerenciales y directivas sean totalmente invisibles para analistas operativos.</p>
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
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-[0.15em] mb-1">Oportunidad Limitada</p>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Reserva tu Demo Gratis</h4>
            <p className="text-slate-500 text-sm max-w-sm">Escanea el código y descubre cómo reducir en un 70% tu carga administrativa.</p>
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

export default App;
