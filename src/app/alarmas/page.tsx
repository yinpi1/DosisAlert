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
  RefreshCw,
  Heart
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

  const handleRecordarMasTarde = () => {
    setPospuestoMensaje('Alarma pospuesta. Te volveremos a avisar en 15 minutos (a las 08:15 hrs).');
    setTimeout(() => setPospuestoMensaje(null), 6000);
  };

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
        throw new Error(data.error || 'No se pudo registrar la toma.');
      }

      setResumenExito(data.data);
      cargarMedicamentos();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      alert(`No pudimos registrar la toma: ${msg}`);
    } finally {
      setProcesandoToma(false);
    }
  };

  const handleNuevaSimulacion = () => {
    setResumenExito(null);
    setPospuestoMensaje(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Encabezado */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <BellRing className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hora de Tomar tu Medicamento
            </h1>
            <p className="text-slate-600 mt-1 text-base">
              Avisa cuando te tomes tu remedio para descontarlo de tu botiquín y avisarte si te quedan pocos.
            </p>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-slate-200">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-base">Cargando tus recordatorios...</p>
        </div>
      ) : medicamentos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
          <p className="text-slate-800 font-bold text-lg">No tienes medicamentos anotados</p>
          <p className="text-base text-slate-600">Anota primero un medicamento en tu botiquín para simular la alarma.</p>
          <Link
            href="/medicamentos"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition-colors"
          >
            <span>Ir a Mis Medicamentos</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : resumenExito ? (
        
        /* PANTALLA DE ÉXITO AMIGABLE */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-400 shadow-xl space-y-8">
          
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">
              ¡Muy bien, Juan!
            </h2>
            <p className="text-slate-700 text-lg max-w-md mx-auto">
              Registramos que te tomaste <strong className="text-slate-900">{resumenExito.nombre}</strong> a las {resumenExito.horaConfirmacion} hrs.
            </p>
          </div>

          {/* RESUMEN EXIGIDO POR LA LÓGICA DE NEGOCIO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Tenías antes
              </span>
              <span className="text-4xl font-black text-slate-800 mt-2 block">
                {resumenExito.cantidadAnterior}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">unidades en casa</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Te tomaste
              </span>
              <span className="text-4xl font-black text-emerald-700 mt-2 block">
                - {resumenExito.cantidadTomada}
              </span>
              <span className="text-xs text-emerald-700 mt-1 block">dosis registrada</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Te quedan ahora
              </span>
              <span className={`text-4xl font-black mt-2 block ${
                resumenExito.cantidadRestante === 0 
                  ? 'text-rose-600' 
                  : resumenExito.alertaMinimaDisparada 
                  ? 'text-amber-600' 
                  : 'text-slate-900'
              }`}>
                {resumenExito.cantidadRestante}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">unidades en tu botiquín</span>
            </div>

          </div>

          {/* ADVERTENCIA VISUAL SI CAE AL NIVEL DE ALERTA MÍNIMA */}
          {resumenExito.alertaMinimaDisparada && (
            <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-950">
                    Ojo: Pocas unidades disponibles
                  </h3>
                  <p className="text-sm text-amber-800">
                    Te quedan {resumenExito.cantidadRestante} unidades (habías pedido que te avisáramos al llegar a {resumenExito.cantidadMinima}). Recuerda comprar más pronto.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-amber-200 font-bold">
                <span className="text-amber-900">
                  Lo agregamos automáticamente a tu lista de compras.
                </span>
                <Link
                  href="/reportes"
                  className="text-amber-900 underline hover:text-amber-950 text-sm"
                >
                  Ver lista de compras &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Botones de Navegación */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleNuevaSimulacion}
              className="w-full sm:flex-1 py-4.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Simular otra toma</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto py-4.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors text-center"
            >
              Volver al Inicio
            </Link>
          </div>

        </div>

      ) : (

        /* VISTA DE ALARMA MÉDICA CON BOTONES GIGANTES */
        <div className="space-y-6">
          
          {/* Selector de Remedio */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-800 block">
                ¿Qué medicamento está sonando en esta alarma?
              </label>
              <p className="text-xs text-slate-500">Puedes cambiar de medicamento para probar la alarma</p>
            </div>
            <select
              value={medSeleccionadoId || ''}
              onChange={(e) => setMedSeleccionadoId(parseInt(e.target.value, 10))}
              className="text-base font-bold px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {medicamentos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} (Te quedan {m.cantidadDisponible})
                </option>
              ))}
            </select>
          </div>

          {/* TARJETA DE ALARMA CON CAMPANA Y BOTONES GIGANTES */}
          {medActual && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-300 shadow-xl space-y-8">
              
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center animate-pulse">
                    <BellRing className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                      ¡Es hora de tu remedio!
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Horario programado de toma</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-5 py-3 rounded-2xl">
                  <Clock className="w-6 h-6 text-slate-600" />
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {horaSimulada}
                  </span>
                </div>
              </div>

              {/* DATOS: NOMBRE, HORA, DOSIS Y DISPONIBLES */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Medicamento que te toca
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                    {medActual.nombre}
                  </h2>
                  <p className="text-base text-slate-600 font-semibold mt-1">
                    Forma: {medActual.presentacion}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dosis */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      ¿Cuánto te toca tomar?
                    </span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-3xl font-black text-amber-950">
                        {dosisSimulada} unidad(es)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDosisSimulada(Math.max(1, dosisSimulada - 1))}
                          className="w-10 h-10 rounded-xl bg-amber-200 text-amber-950 font-bold hover:bg-amber-300 text-xl flex items-center justify-center"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setDosisSimulada(dosisSimulada + 1)}
                          className="w-10 h-10 rounded-xl bg-amber-200 text-amber-950 font-bold hover:bg-amber-300 text-xl flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Disponibles */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Tienes en tu botiquín
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
                  </div>
                </div>
              </div>

              {pospuestoMensaje && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{pospuestoMensaje}</span>
                </div>
              )}

              {/* DOS BOTONES GRANDES Y CLAROS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                
                {/* 1. Botón "Ya lo tomé" */}
                <button
                  onClick={handleYaLoTome}
                  disabled={procesandoToma || medActual.cantidadDisponible <= 0}
                  className="flex-1 py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {procesandoToma ? (
                    <span>Registrando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-7 h-7" />
                      <span>Ya me lo tomé</span>
                    </>
                  )}
                </button>

                {/* 2. Botón "Recordarme más tarde" */}
                <button
                  onClick={handleRecordarMasTarde}
                  disabled={procesandoToma}
                  className="py-5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-6 h-6" />
                  <span>Recordarme en 15 min</span>
                </button>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
