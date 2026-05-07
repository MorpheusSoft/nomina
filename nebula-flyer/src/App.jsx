import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Calculator, 
  Users,
  Settings2,
  Globe,
  Zap,
  Cloud
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-12 font-sans">
      {/* Contenedor Principal con efecto de elevación */}
      <div className="max-w-5xl w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* LADO IZQUIERDO: Branding y Propuesta de Valor Central */}
        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Elementos decorativos abstractos */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500 rounded-full blur-[100px] opacity-10 -ml-30 -mb-30"></div>
          
          <div className="relative z-10">
            {/* Logo Area */}
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400">
                <Cloud className="text-white" size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none">NEBULA</span>
                <span className="text-blue-400 text-xs font-bold tracking-[0.2em]">PAYROLLS</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-8">
              Tu nómina, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 print:text-emerald-400 print:bg-none">bajo control.</span>
            </h1>
            
            <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium">
              La solución inteligente para empresas venezolanas que buscan eficiencia y cumplimiento legal sin complicaciones.
            </p>

            {/* Puntos clave mejorados */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                  <CheckCircle2 className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Adaptación Legal Total</p>
                  <p className="text-slate-400 text-xs">Cumplimiento estricto con la LOTTT vigente.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
                  <Settings2 className="text-emerald-400" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Convenios Personalizados</p>
                  <p className="text-slate-400 text-xs">Crea tus propios esquemas de pago según tus necesidades.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                  <Zap className="text-blue-400" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Multimoneda Real</p>
                  <p className="text-slate-400 text-xs">Gestión fluida en Bolívares y Divisas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1 bg-purple-500/20 p-1 rounded-full">
                  <Smartphone className="text-purple-400" size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Portal de Autogestión</p>
                  <p className="text-slate-400 text-xs">Mucho más que recibos 24/7. Un ecosistema completo para las solicitudes de tus empleados.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 pt-8 border-t border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1 font-bold">Consultoría Especializada</p>
                <p className="text-lg font-bold">lzambrano@nebulapayrolls.com</p>
                <p className="text-blue-400 font-bold">+58 422 268 4691</p>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Soluciones y Llamado a la Acción */}
        <div className="md:w-7/12 p-10 md:p-16 bg-white flex flex-col">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
              ¿Perdiendo días en cálculos de nómina?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed border-l-4 border-blue-500 pl-6">
              Automatiza la complejidad. Nebula transforma procesos manuales tediosos en un par de clics, dándote visibilidad total de tu equipo.
            </p>
          </div>

          {/* Grid de Soluciones de Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Asistencia Geolocalizada</h3>
              <p className="text-sm text-slate-500 leading-snug">Marcaje de asistencia basado en GPS que funciona 100% Offline. Valida la ubicación exacta y captura una selfie probatoria desde zonas remotas, sin importar la señal.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Turnos Dinámicos</h3>
              <p className="text-sm text-slate-500 leading-snug">Gestión impecable de guardias rotativas, horarios 24/7 y cuadrillas de campo. Adaptable a cualquier industria.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Oráculo con IA</h3>
              <p className="text-sm text-slate-500 leading-snug">Olvida programar. Pide fórmulas en lenguaje natural y la Inteligencia Artificial las creará con auditoría legal automática.</p>
            </div>

            <div className="group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Privacidad Salarial</h3>
              <p className="text-sm text-slate-500 leading-snug">Gestión estricta de permisos jerárquicos. Asegura que las nóminas gerenciales y directivas sean invisibles para analistas.</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-auto">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-center sm:text-left">
                  <p className="text-blue-400 font-black text-sm uppercase tracking-[0.2em] mb-2">Oportunidad Limitada</p>
                  <h4 className="text-2xl font-bold">Reserva tu Demo Gratis</h4>
                  <p className="text-slate-400 text-sm mt-1">Descubre cómo ahorrar hasta un 70% en tiempo administrativo.</p>
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

export default App;
