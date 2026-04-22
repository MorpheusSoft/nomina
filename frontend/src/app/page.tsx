"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cloud, 
  Users, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Database, 
  LayoutDashboard, 
  Zap, 
  CheckCircle2,
  Globe,
  ArrowRight,
  Wallet,
  PieChart,
  Building2,
  UserSquare2
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: "Control de Asistencia y Horarios Inteligentes",
      icon: <Clock className="w-6 h-6" />,
      color: "bg-emerald-600",
      description: "Olvídese de calcular a mano quién vino, quién faltó o a quién le toca guardia.",
      details: [
        "Maestro de Turnos: Defina sus horarios base.",
        "Rotaciones Automáticas: Programe ciclos complejos (ej. 3 semanas trabajo, 1 descanso).",
        "Control de Faltas y Permisos: Gestión de vacaciones y ausencias injustificadas."
      ],
      screenshotDesc: "Módulo de Auditoría de Marcas y Patrones Cíclicos.",
      imageSrc: "/images/asistencia.png"
    },
    {
      title: "El Motor de Nómina (Cálculos Mágicos)",
      icon: <Calculator className="w-6 h-6" />,
      color: "bg-indigo-600",
      description: "¿Reglas de pago complejas? Nebula las automatiza. Flexibilidad total en asignaciones y deducciones.",
      details: [
        "Arquitectura de conceptos con fórmulas matemáticas libres.",
        "Novedades en Tiempo Real: Bonos o faltas inyectadas automáticamente.",
        "Consola de Ejecución: Corra y audite la nómina en segundos."
      ],
      screenshotDesc: "Consola de Ejecución de Nómina con recálculo en vivo.",
      imageSrc: "/images/calculo.png"
    },
    {
      title: "Finanzas: Préstamos y Fideicomisos",
      icon: <Wallet className="w-6 h-6" />,
      color: "bg-amber-600",
      description: "Mantenga las finanzas y cuentas de su personal claras y sin enredos de Excel.",
      details: [
        "Gestión de Préstamos manual o automatizada con cuotas.",
        "Caja de Fideicomiso / Prestaciones con cálculo de intereses.",
        "Manejo de Anticipos de prestaciones sociales."
      ],
      screenshotDesc: "Tablero de estado de cuentas de fideicomiso y préstamos.",
      imageSrc: "/images/finanzas.png"
    },
    {
      title: "Reportes y Analíticas Gerenciales",
      icon: <PieChart className="w-6 h-6" />,
      color: "bg-rose-600",
      description: "Información visual y valiosa para tomar decisiones estratégicas de negocio.",
      details: [
        "Panel Gerencial con masa salarial mensual.",
        "KPIs: Índices de inasistencia, pasivo laboral y personal activo.",
        "Exportación de asientos e informes detallados."
      ],
      screenshotDesc: "Gráficas gerenciales de costo de nómina mensual.",
      imageSrc: "/images/reportes.png"
    },
    {
      title: "Organización Multi-Nivel",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-blue-600",
      description: "Ecosistema diseñado a la medida de empresas en crecimiento o firmas de contadores.",
      details: [
        "Multi-Tenant: Gestione múltiples empresas en una cuenta.",
        "Organización por Sedes, Departamentos y Cuadrillas.",
        "Esquema de Tabuladores Salariales por Cargo."
      ],
      screenshotDesc: "Vista de árbol organizacional y control multi-empresa.",
      imageSrc: "/images/organizacion.png"
    },
    {
      title: "El Portal del Trabajador",
      icon: <UserSquare2 className="w-6 h-6" />,
      color: "bg-teal-600",
      description: "Empodere a su plantilla proporcionando un acceso privado de autogestión (Self-Service).",
      details: [
        "Visualización y descarga de Recibos de Pago.",
        "Consulta de saldo de Fideicomiso y Prestaciones en línea.",
        "Solicitud automatizada de Vacaciones y Cartas de Trabajo."
      ],
      screenshotDesc: "Portal Privado del Trabajador mostrando saldo y recibos.",
      imageSrc: "/images/portal.png"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Cloud className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                Nebula Payrolls
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#inicio" className="hover:text-indigo-600 transition-colors">Inicio</a>
              <a href="#funcionalidades" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
              <a href="#seguridad" className="hover:text-indigo-600 transition-colors">Seguridad</a>
              <Link href="/portal/login" className="flex items-center gap-2 text-indigo-600 font-bold border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all">
                <UserSquare2 className="w-4 h-4" />
                Portal Empleado
              </Link>
              <Link href="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 mb-6">
                <Zap className="w-4 h-4 mr-2" /> La Evolución de la Gestión Salarial
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Gestión Humana y Nómina en la <span className="text-indigo-600">Nube</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                No es solo software; es un motor inteligente diseñado para empresas que buscan agilidad, automatización y cero errores. Centralice asistencia, contratos y leyes laborales en un solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                  Comenzar ahora <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                  Agendar Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Decorative background for UI mockup */}
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
              
              {/* UI Mockup Placeholder */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 overflow-hidden transform lg:rotate-2 transition-transform hover:rotate-0 duration-500">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-8 w-24 bg-indigo-100 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-100 rounded-xl p-3">
                      <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                      <div className="h-6 w-3/4 bg-indigo-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-100 rounded-xl p-3">
                      <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                      <div className="h-6 w-3/4 bg-blue-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-100 rounded-xl p-3">
                      <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                      <div className="h-6 w-3/4 bg-emerald-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-48 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
                    <img 
                      src="/images/hero-dashboard.png" 
                      alt="Dashboard General" 
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-medium">
                      [Colocar hero-dashboard.png en public/images]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-2">100%</p>
              <p className="text-slate-400 text-sm">Basado en la Nube</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">0</p>
              <p className="text-slate-400 text-sm">Hojas de Cálculo</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">Real-Time</p>
              <p className="text-slate-400 text-sm">Control de Asistencia</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">Multi</p>
              <p className="text-slate-400 text-sm">Tenant Architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Funcionalidades Estrella</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Diseñado desde cero para resolver los problemas reales de los departamentos de RRHH y Nómina.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Tabs Selector */}
            <div className="lg:col-span-4 space-y-3">
              {features.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all text-left ${
                    activeTab === idx 
                      ? 'bg-indigo-50 border-l-4 border-indigo-600 shadow-sm' 
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeTab === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${activeTab === idx ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{feature.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature Content */}
            <div className="lg:col-span-8">
              <div className="bg-slate-50 rounded-3xl p-8 h-full border border-slate-100 shadow-inner">
                <div className="flex flex-col md:flex-row gap-8 items-start h-full">
                  <div className="flex-1 space-y-6">
                    <div className={`inline-block p-4 rounded-2xl ${features[activeTab].color} text-white shadow-lg`}>
                      {features[activeTab].icon}
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">{features[activeTab].title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {features[activeTab].description}
                    </p>
                    <ul className="space-y-3">
                      {features[activeTab].details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 w-full bg-white rounded-2xl p-4 shadow-xl border border-slate-200">
                    {/* Renderizamos la imagen real si existe en la carpeta, si no, mostramos el placeholder elegante */}
                    <img 
                      src={features[activeTab].imageSrc} 
                      alt={features[activeTab].title}
                      className="w-full h-auto rounded-xl shadow-sm border border-slate-100 object-cover border-slate-200 bg-slate-100"
                      onError={(e) => {
                        // Si la imagen no se encuentra, ocultamos el img tag y mostramos el placeholder
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    
                    {/* Placeholder de Respaldo */}
                    <div className="hidden aspect-[4/3] rounded-xl bg-slate-100 flex-col items-center justify-center p-6 text-center">
                      <LayoutDashboard className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">{features[activeTab].screenshotDesc}</p>
                      <div className="mt-4 w-full space-y-2">
                        <div className="h-2 bg-slate-200 rounded w-full"></div>
                        <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Infrastructure */}
      <section id="seguridad" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Seguridad y Tecnología de Clase Empresarial</h2>
                <p className="text-lg text-slate-600">
                  A diferencia de los sistemas tradicionales instalables, Nebula Payrolls vive en una Arquitectura de Nube Escalable y Segura.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-indigo-600 mb-4" />
                  <h4 className="font-bold mb-2">Cero Instalaciones</h4>
                  <p className="text-sm text-slate-500">Acceda desde Windows, Mac, iPads o móviles sin complicaciones.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <Database className="w-10 h-10 text-blue-600 mb-4" />
                  <h4 className="font-bold mb-2">Backups Automáticos</h4>
                  <p className="text-sm text-slate-500">Sus datos respaldados continuamente con tecnologías de vanguardia.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <Zap className="w-10 h-10 text-emerald-600 mb-4" />
                  <h4 className="font-bold mb-2">Auditoría Estricta</h4>
                  <p className="text-sm text-slate-500">Marcas de reloj inalterables que identifican quién, cuándo y cómo.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <LayoutDashboard className="w-10 h-10 text-orange-600 mb-4" />
                  <h4 className="font-bold mb-2">Control Presupuestario</h4>
                  <p className="text-sm text-slate-500">Monitoreo en tiempo real del gasto salarial frente a los límites.</p>
                </div>
              </div>
            </div>
            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-600 rounded-3xl rotate-3 group-hover:rotate-0 transition-transform"></div>
               <div className="relative bg-slate-900 rounded-3xl p-10 text-white space-y-6">
                  <h3 className="text-2xl font-bold">¿Listo para el cambio?</h3>
                  <p className="text-slate-400">
                    Nebula Payrolls es la pieza final que faltaba entre la llegada del empleado y su pago final.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-indigo-400" />
                      </div>
                      <span>Migración asistida desde Excel o SAP</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="text-indigo-400" />
                      </div>
                      <span>Soporte técnico especializado 24/7</span>
                    </div>
                  </div>
                  <Link href="/login" className="block text-center w-full py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                    Solicitar Propuesta Comercial
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Cloud className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Nebula Payrolls</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Transformando la gestión corporativa humana y salarial con inteligencia de nube.
          </p>
          <div className="flex justify-center gap-6 text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer">LinkedIn</span>
            <span className="hover:text-indigo-600 cursor-pointer">Twitter</span>
            <span className="hover:text-indigo-600 cursor-pointer">Blog</span>
            <span className="hover:text-indigo-600 cursor-pointer">Contacto</span>
          </div>
          <p className="mt-8 text-xs text-slate-400">
            © 2026 Nebula Payrolls. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
