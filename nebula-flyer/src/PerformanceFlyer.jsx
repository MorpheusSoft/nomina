import React from 'react';
import {
  CheckCircle2,
  BrainCircuit,
  Users,
  FileText,
  Cloud,
  Briefcase
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PerformanceFlyer = () => {
  return (
    <div className="w-[800px] bg-white font-sans text-slate-900 flex flex-col mx-auto shadow-2xl relative">

      {/* HEADER HERO SECTION */}
      <div className="bg-slate-900 text-white p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-8 bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <Cloud className="text-indigo-400" size={20} />
            <span className="text-sm font-black tracking-widest uppercase">Nebula Performance & Talent</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Mide y desarrolla a tu equipo con <span className="text-indigo-400">precisión</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            El Módulo de Desempeño que automatiza tus campañas de evaluación, elimina los sesgos y genera matrices de talento listas para la toma de decisiones directivas.
          </p>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div className="p-14 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Feature 1 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <FileText className="text-slate-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Plantillas Dinámicas</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Diseña formularios personalizados en base a competencias o KPIs, separando claramente las habilidades blandas de las operativas.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <Users className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Workflows de Consenso</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Autoevaluaciones, revisión de supervisores y reuniones de cierre integradas en una sola plataforma, eliminando por completo el uso de Excel.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-slate-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analítica 9-Box y Radar</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Clasifica visualmente a tus colaboradores en la matriz de talento y detecta brechas de rendimiento con gráficos de radar corporativos.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="text-emerald-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Reportes Ejecutivos</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Genera informes individuales listos para firma y archivo, estructurados con métricas claras y el feedback final consolidado.</p>
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
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Evalúa. Detecta. Retén.</h4>
            <p className="text-slate-500 text-sm max-w-sm">Escanea el código para conocer cómo Nebula transforma el ciclo de vida del empleado.</p>
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

export default PerformanceFlyer;
