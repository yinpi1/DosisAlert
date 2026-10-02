'use client';

import Link from 'next/link';
import { 
  ClipboardList, 
  Search, 
  FileBarChart, 
  BellRing, 
  ArrowRight, 
  Pill, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResumenBotiquin {
  total: number;
  disponibles: number;
  pocasUnidades: number;
  agotados: number;
}

export default function HomePage() {
  const [resumen, setResumen] = useState<ResumenBotiquin>({
    total: 0,
    disponibles: 0,
    pocasUnidades: 0,
    agotados: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/medicamentos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const list = data.data;
          setResumen({
            total: list.length,
            disponibles: list.filter((m: { estado: string }) => m.estado === 'Disponible').length,
            pocasUnidades: list.filter((m: { estado: string }) => m.estado === 'Pocas unidades').length,
            agotados: list.filter((m: { estado: string }) => m.estado === 'Agotado').length,
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setCargando(false));
  }, []);

  const modulos = [
    {
      titulo: 'Mis medicamentos',
      subtitulo: 'Mantenedor CRUD de inventario',
      descripcion: 'Registra, edita, elimina y revisa el stock disponible con cálculo automatizado de estado.',
      href: '/medicamentos',
      icon: ClipboardList,
      colorIcon: 'bg-emerald-600 text-white',
      colorHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      badge: 'CRUD Principal',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      titulo: 'Buscar medicamentos',
      subtitulo: 'Filtros y consultas rápidas',
      descripcion: 'Encuentra medicamentos por nombre y filtra por estado: Disponibles, Pocas unidades o Agotados.',
      href: '/buscar',
      icon: Search,
      colorIcon: 'bg-blue-600 text-white',
      colorHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      badge: 'Búsqueda Avanzada',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      titulo: 'Reportes de medicamentos',
      subtitulo: 'Balance y necesidad de reposición',
      descripcion: 'Genera el informe de auditoría de existencias y detecta automáticamente los medicamentos que requieren reposición.',
      href: '/reportes',
      icon: FileBarChart,
      colorIcon: 'bg-purple-600 text-white',
      colorHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      badge: 'Alerta Automática',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      titulo: 'Recordatorios y control de stock',
      subtitulo: 'Simulador de alarma y toma de dosis',
      descripcion: 'Confirma la toma de tus dosis ("Ya lo tomé"), descuenta del inventario en PostgreSQL y verifica alertas de stock.',
      href: '/alarmas',
      icon: BellRing,
      colorIcon: 'bg-amber-500 text-white',
      colorHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      badge: 'Transacción Crítica',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner de Bienvenida del Paciente */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/60 border border-emerald-400/30 text-emerald-100 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Farmacia Personal Digital • DosisAlert</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Hola, <span className="text-emerald-200">Juan Pérez</span>.
          </h1>

          <p className="text-emerald-100 text-base sm:text-lg max-w-2xl leading-relaxed">
            Bienvenido a tu panel de control farmacéutico personal. Administra tus medicamentos, monitorea las alertas de reposición y confirma tus tomas a tiempo.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium block">Total Fármacos</span>
              <span className="text-2xl font-black text-white">{cargando ? '...' : resumen.total}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium block">Disponibles</span>
              <span className="text-2xl font-black text-emerald-300">{cargando ? '...' : resumen.disponibles}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium block">Pocas Unidades</span>
              <span className="text-2xl font-black text-amber-300">{cargando ? '...' : resumen.pocasUnidades}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs text-emerald-200 font-medium block">Agotados</span>
              <span className="text-2xl font-black text-rose-300">{cargando ? '...' : resumen.agotados}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Título de los 4 accesos */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Menú Principal</h2>
            <p className="text-sm text-slate-500 mt-1">Selecciona una de las 4 funciones principales del sistema</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            4 Módulos
          </span>
        </div>
      </div>

      {/* 4 BOTONES / TARJETAS DE ACCESO GRANDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulos.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.titulo}
              href={item.href}
              className={`group bg-white rounded-3xl p-7 border-2 border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-6 cursor-pointer ${item.colorHover}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${item.colorIcon}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{item.subtitulo}</p>
                  <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>
              </div>

              {/* Botón inferior con flecha */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                <span>Ingresar al módulo</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tarjeta Informativa sobre el Modelo de Datos y PostgreSQL */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Arquitectura Relacional Activa (7 Entidades)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Conectado a PostgreSQL en localhost:5432 con modelos para Usuarios, Medicamentos, Horarios, Recordatorios, Tomas, Alertas y Reportes.
            </p>
          </div>
        </div>
        <Link
          href="/medicamentos"
          className="shrink-0 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors"
        >
          Ir al CRUD de Medicamentos
        </Link>
      </div>

    </div>
  );
}
