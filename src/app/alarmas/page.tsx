'use client';

import { useState, useEffect } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Pill, 
  RotateCcw, 
  ArrowRight, 
  Volume2, 
  Sparkles,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

interface Medicamento {
  id: number;
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  estado: string;
}

interface ResumenTomaExito {
  medicamentoId: number;
  nombre: string;
  presentacion: string;
  cantidadAnterior: number;
  cantidadTomada: number;
  cantidadRestante: number;
  cantidadMinima: number;
  nuevoEstado: string;
  alertaMinimaDisparada: boolean;
  horaConfirmacion: string;
}

export default function AlarmasPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [medSeleccionadoId, setMedSeleccionadoId] = useState<number | null>(null);

  // Estados de simulación de alarma
  const [horaSimulada, setHoraSimulada] = useState('08:00');
  const [dosisSimulada, setDosisSimulada] = useState(1);
  const [procesandoToma, setProcesandoToma] = useState(false);
  const [pospuestoMensaje, setPospuestoMensaje] = useState<string | null>(null);

  // Pantalla de éxito con el resumen exigido
  const [resumenExito, setResumenExito] = useState<ResumenTomaExito | null>(null);

  const cargarMedicamentos = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/medicamentos');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMedicamentos(data.data);
        if (data.data.length > 0 && !medSeleccionadoId) {
          // Seleccionar el primero por defecto
          setMedSeleccionadoId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const medActual = medicamentos.find((m) => m.id === medSeleccionadoId) || medicamentos[0];

  // Acción: "Recordarme más tarde"
  const handleRecordarMasTarde = () => {
    setPospuestoMensaje('Alarma pospuesta por 15 minutos. Te volveremos a avisar a las 08:15 hrs.');
    setTimeout(() => setPospuestoMensaje(null), 5000);
  };

  // LÓGICA CRÍTICA: "Ya lo tomé"
  const handleYaLoTome = async () => {
    if (!medActual) return;
    setProcesandoToma(true);
    setPospuestoMensaje(null);

    try {
      const res = await fetch('/api/tomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicamentoId: medActual.id,
          dosis: dosisSimulada,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo procesar la toma.');
      }

      // Guardar el resumen de éxito para renderizar la pantalla
      setResumenExito(data.data);

      // Recargar lista actualizada desde PostgreSQL
      cargarMedicamentos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al registrar toma: ${msg}`);
    } finally {
      setProcesandoToma(false);
    }
  };

  // Reiniciar simulación para probar otra toma
  const handleNuevaSimulacion = () => {
    setResumenExito(null);
    setPospuestoMensaje(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Encabezado */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <BellRing className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Recordatorios y Control de Stock
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                Alarma Activa
              </span>
            </div>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Simulador interactivo de notificación médica con descuento atómico de inventario en PostgreSQL.
            </p>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-slate-200">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">Cargando datos de medicamentos...</p>
        </div>
      ) : medicamentos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
          <p className="text-slate-800 font-bold text-lg">No hay medicamentos en la base de datos</p>
          <p className="text-sm text-slate-500">Primero registra medicamentos en el Mantenedor para activar las alarmas de toma.</p>
          <Link
            href="/medicamentos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            <span>Ir a Mis Medicamentos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : resumenExito ? (
        
        /* PANTALLA DE ÉXITO CON RESUMEN EXIGIDO POR LA LÓGICA CRÍTICA */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-400 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              ¡Toma Registrada Exitosamente!
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Se ha confirmado la ingesta de <strong className="text-slate-900">{resumenExito.nombre}</strong> a las {resumenExito.horaConfirmacion} hrs y se descontó del inventario en PostgreSQL.
            </p>
          </div>

          {/* RESUMEN EXIGIDO: CANTIDAD ANTERIOR, CANTIDAD REGISTRADA (DOSIS) Y CANTIDAD RESTANTE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. Cantidad anterior */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Cantidad Anterior
              </span>
              <span className="text-3xl font-black text-slate-800 mt-2 block">
                {resumenExito.cantidadAnterior}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">unidades antes de la toma</span>
            </div>

            {/* 2. Cantidad registrada (dosis) */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Dosis Registrada
              </span>
              <span className="text-3xl font-black text-emerald-700 mt-2 block">
                - {resumenExito.cantidadTomada}
              </span>
              <span className="text-xs text-emerald-600 mt-1 block">descontada de la BD</span>
            </div>

            {/* 3. Cantidad restante */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Cantidad Restante
              </span>
              <span className={`text-3xl font-black mt-2 block ${
                resumenExito.cantidadRestante === 0 
                  ? 'text-rose-600' 
                  : resumenExito.alertaMinimaDisparada 
                  ? 'text-amber-600' 
                  : 'text-slate-900'
              }`}>
                {resumenExito.cantidadRestante}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">stock actual en farmacia</span>
            </div>

          </div>

          {/* LÓGICA CRÍTICA: SI CAE AL NIVEL DE ALERTA MÍNIMA, RENDERIZAR VISUALMENTE LA ADVERTENCIA */}
          {resumenExito.alertaMinimaDisparada && (
            <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-950">
                    Advertencia: Pocas unidades disponibles
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    El stock restante ({resumenExito.cantidadRestante} unidades) ha alcanzado o cruzado el umbral de alerta mínima ({resumenExito.cantidadMinima} unidades).
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-amber-200">
                <span className="text-amber-900 font-semibold">
                  Se ha generado un registro automático en la tabla de Alertas de Reposición.
                </span>
                <Link
                  href="/reportes"
                  className="font-bold text-amber-900 hover:text-amber-950 underline"
                >
                  Ver reporte de reposición &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Botones de Navegación tras la confirmación */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleNuevaSimulacion}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Simular Otra Toma</span>
            </button>

            <Link
              href="/medicamentos"
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors text-center"
            >
              Volver a Mis Medicamentos
            </Link>
          </div>

        </div>

      ) : (

        /* VISTA DE SIMULACIÓN DE ALARMA (CAMPANA / TARJETA PRINCIPAL) */
        <div className="space-y-6">
          
          {/* Selector de Medicamento para la simulación */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Seleccionar Medicamento a Simular
              </label>
              <p className="text-xs text-slate-500 mt-0.5">Elige cuál de tus medicamentos está sonando en esta alarma</p>
            </div>
            <select
              value={medSeleccionadoId || ''}
              onChange={(e) => setMedSeleccionadoId(parseInt(e.target.value, 10))}
              className="text-sm font-bold px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.cantidadDisponible} disponibles - Mín: {m.cantidadMinima})
                </option>
              ))}
            </select>
          </div>

          {/* TARJETA DE ALARMA MÉDICA CON BOTONES GRANDES */}
          {medActual && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-300 shadow-2xl relative overflow-hidden space-y-8">
              
              {/* Barra superior de Alarma */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center animate-pulse">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                      Recordatorio Programado
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Hora de administración prescrita</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {horaSimulada}
                  </span>
                </div>
              </div>

              {/* DATOS EXIGIDOS: NOMBRE, HORA, DOSIS A TOMAR Y DISPONIBLES */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Nombre del Medicamento
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                    {medActual.nombre}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Presentación: <strong className="text-slate-700">{medActual.presentacion}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dosis a Tomar */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Dosis a Tomar
                    </span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-3xl font-black text-amber-900">
                        {dosisSimulada} unidad(es)
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDosisSimulada(Math.max(1, dosisSimulada - 1))}
                          className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 text-lg flex items-center justify-center"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setDosisSimulada(dosisSimulada + 1)}
                          className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300 text-lg flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-700 mt-1 block">Cantidad a descontar del stock</span>
                  </div>

                  {/* Disponibles Actuales */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Disponibles en Botiquín
                    </span>
                    <span className={`text-3xl font-black mt-2 block ${
                      medActual.cantidadDisponible === 0 
                        ? 'text-rose-600' 
                        : medActual.cantidadDisponible <= medActual.cantidadMinima 
                        ? 'text-amber-600' 
                        : 'text-slate-900'
                    }`}>
                      {medActual.cantidadDisponible} unidades
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Alerta mínima configurada en {medActual.cantidadMinima}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mensaje de pospuesto si presionó recordar más tarde */}
              {pospuestoMensaje && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{pospuestoMensaje}</span>
                </div>
              )}

              {/* DOS BOTONES GRANDES EXIGIDOS POR REQUERIMIENTO */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                
                {/* 1. Botón "Ya lo tomé" */}
                <button
                  onClick={handleYaLoTome}
                  disabled={procesandoToma || medActual.cantidadDisponible <= 0}
                  className="flex-1 py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {procesandoToma ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Descontando de BD...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Ya lo tomé</span>
                    </>
                  )}
                </button>

                {/* 2. Botón "Recordarme más tarde" */}
                <button
                  onClick={handleRecordarMasTarde}
                  disabled={procesandoToma}
                  className="py-5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-5 h-5" />
                  <span>Recordarme más tarde</span>
                </button>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
