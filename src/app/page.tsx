'use client';

import Link from 'next/link';
import { 
  ClipboardList, 
  Search, 
  ShoppingCart, 
  BellRing, 
  ArrowRight, 
  Pill, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Heart,
  Zap
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import ModalTomaRapida from '@/components/ModalTomaRapida';

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
  const [modalTomaAbierto, setModalTomaAbierto] = useState(false);

  const cargarResumen = useCallback(() => {
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

  useEffect(() => {
    cargarResumen();

    // Escuchar si se registra una toma desde cualquier componente
    const handleTomaGlobal = () => cargarResumen();
    window.addEventListener('dosisalert:toma-registrada', handleTomaGlobal);
    return () => window.removeEventListener('dosisalert:toma-registrada', handleTomaGlobal);
  }, [cargarResumen]);

  const modulos = [
    {
      titulo: 'Mis Medicamentos',
      subtitulo: 'Ver y agregar remedios',
      descripcion: 'Revisa cuántas pastillas te quedan y anota nuevos medicamentos en tu botiquín.',
      href: '/medicamentos',
      icon: ClipboardList,
      colorIcon: 'bg-emerald-600 text-white',
      colorHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      badge: 'Mi Botiquín',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      titulo: 'Buscar un Remedio',
      subtitulo: 'Encuentra rápido por nombre',
      descripcion: 'Busca cualquier medicamento anotado para ver cómo se toma y cuántos tienes.',
      href: '/buscar',
      icon: Search,
      colorIcon: 'bg-blue-600 text-white',
      colorHover: 'hover:border-blue-400 hover:shadow-blue-500/10',
      badge: 'Búsqueda Fácil',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      titulo: '¿Qué debo comprar?',
      subtitulo: 'Avisos para la farmacia',
      descripcion: 'Mira una lista clara con los medicamentos que se están terminando para reponerlos.',
      href: '/reportes',
      icon: ShoppingCart,
      colorIcon: 'bg-purple-600 text-white',
      colorHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      badge: 'Lista de Compras',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      titulo: 'Tomar mi Remedio',
      subtitulo: 'Horario y control de pastillas',
      descripcion: 'Presiona "Ya me lo tomé" para descontar tu dosis y mantener tu pastillero al día.',
      href: '/alarmas',
      icon: BellRing,
      colorIcon: 'bg-amber-500 text-white',
      colorHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      badge: 'Hora de la Toma',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Saludo Cálido y Humano al Paciente */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-sm font-bold mb-1">
              <Heart className="w-4 h-4 fill-emerald-300 text-emerald-300" />
              <span>DosisAlert • Tu Asistente de Salud</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              ¡Hola, <span className="text-emerald-200">Juan Pérez</span>!
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg mt-2 max-w-xl">
              Aquí puedes ver tus remedios de forma clara, sencilla y sin complicaciones.
            </p>
          </div>

          {/* Estado Rápido y Amigable */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center sm:text-right shrink-0">
            <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Tu Botiquín Hoy</p>
            <p className="text-3xl font-black text-white mt-1">
              {cargando ? '...' : `${resumen.total} remedios`}
            </p>
            <p className="text-xs text-emerald-100 mt-1">
              {resumen.pocasUnidades + resumen.agotados > 0 
                ? `⚠️ Hay ${resumen.pocasUnidades + resumen.agotados} por reponer` 
                : '✅ Todo en orden'}
            </p>
          </div>
        </div>

        {/* Aviso Amable si hay remedios por terminar */}
        {!cargando && (resumen.pocasUnidades > 0 || resumen.agotados > 0) && (
          <div className="pt-3 border-t border-emerald-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-200 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <span>Tienes medicamentos con pocas pastillas. Recuerda anotarlos para la farmacia.</span>
            </div>
            <Link
              href="/reportes"
              className="text-xs font-black text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-xl transition-colors hidden sm:block"
            >
              Ver cuáles son &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Botón de Acción Rápida: ¡Me tomé un remedio! */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-300 shadow-md shadow-emerald-500/5 flex flex-col md:flex-row items-center justify-between gap-5 transition-all">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
            <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
              <span>⚡ Botón de Acción Rápida</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ¿Te tomaste un medicamento recién?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-0.5">
              Presiona aquí para elegir cuál tomaste y descontarlo automáticamente del botiquín.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalTomaAbierto(true)}
          className="w-full md:w-auto px-7 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 shrink-0 cursor-pointer"
        >
          <Pill className="w-6 h-6 -rotate-45" />
          <span>¡Ya me lo tomé!</span>
        </button>
      </div>

      {/* Pregunta Clara y Directa */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ¿Qué deseas hacer hoy?
        </h2>
        <p className="text-base text-slate-600">
          Selecciona una opción para gestionar tus medicamentos y horarios:
        </p>
      </div>

      {/* 4 BOTONES / TARJETAS GRANDES CON LENGUAJE SIMPLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulos.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.titulo}
              href={item.href}
              className={`bg-white rounded-3xl p-7 border-2 border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-6 cursor-pointer ${item.colorHover}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${item.colorIcon}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {item.titulo}
                  </h3>
                  <p className="text-sm font-bold text-slate-500 mt-0.5">{item.subtitulo}</p>
                  <p className="text-base text-slate-600 mt-2.5 leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>
              </div>

              {/* Botón inferior claro */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-base font-black text-slate-800">
                <span>Presiona para entrar</span>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-700" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Modal de Acción Rápida para registrar toma */}
      <ModalTomaRapida
        isOpen={modalTomaAbierto}
        onClose={() => setModalTomaAbierto(false)}
        onTomaExitosa={cargarResumen}
      />

    </div>
  );
}
