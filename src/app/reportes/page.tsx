'use client';

import { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Pill, 
  TrendingDown, 
  FileText,
  AlertOctagon,
  ArrowRight
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

export default function ReportesPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Modal automático crítico de reposición
  const [mostrarModalAlerta, setMostrarModalAlerta] = useState(false);
  const [medicamentosPorReponer, setMedicamentosPorReponer] = useState<Medicamento[]>([]);

  // Guardado de reporte
  const [guardandoReporte, setGuardandoReporte] = useState(false);
  const [reporteGuardado, setReporteGuardado] = useState(false);

  const cargarReporte = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/medicamentos');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const meds: Medicamento[] = data.data;
        setMedicamentos(meds);

        // LÓGICA CRÍTICA: Detectar cuántos medicamentos están en "Pocas unidades" o "Agotado"
        const porReponer = meds.filter(
          (m) => m.estado === 'Pocas unidades' || m.estado === 'Agotado'
        );
        setMedicamentosPorReponer(porReponer);

        // Si existen medicamentos que requieren reposición, DISPARAR AUTOMÁTICAMENTE EL MODAL
        if (porReponer.length > 0) {
          setMostrarModalAlerta(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const totalMedicamentos = medicamentos.length;
  const totalPorReponer = medicamentosPorReponer.length;
  const totalDisponibles = totalMedicamentos - totalPorReponer;

  // Registrar auditoría de reporte en PostgreSQL
  const guardarReporteAuditoria = async () => {
    setGuardandoReporte(true);
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalMedicamentos,
          cantidadPorReponer: totalPorReponer,
        }),
      });
      if (res.ok) {
        setReporteGuardado(true);
        setTimeout(() => setReporteGuardado(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGuardandoReporte(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 shrink-0">
              <FileBarChart className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Reporte de Estado y Reposición
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  Auditoría de Stock
                </span>
              </div>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Análisis general del inventario farmacéutico y detección de medicamentos que requieren reabastecimiento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarReporte}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-purple-600' : ''}`} />
              <span>Actualizar Reporte</span>
            </button>
            <button
              onClick={guardarReporteAuditoria}
              disabled={guardandoReporte || cargando}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <FileText className="w-4 h-4" />
              <span>{guardandoReporte ? 'Registrando...' : 'Guardar Reporte'}</span>
            </button>
          </div>
        </div>

        {reporteGuardado && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold text-sm">Reporte de auditoría registrado en PostgreSQL exitosamente.</p>
          </div>
        )}
      </div>

      {/* Tarjetas de Métricas de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Medicamentos */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Medicamentos</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{cargando ? '...' : totalMedicamentos}</p>
            <p className="text-xs text-slate-500 mt-1">Registrados en la farmacia</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Disponibles / Seguros */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Stock Seguro</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">{cargando ? '...' : totalDisponibles}</p>
            <p className="text-xs text-slate-500 mt-1">No requieren reposición</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Requieren Reposición */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 bg-amber-50/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Requieren Reposición</p>
            <p className="text-3xl font-black text-amber-700 mt-1">{cargando ? '...' : totalPorReponer}</p>
            <p className="text-xs text-amber-800 mt-1">Pocas unidades o Agotados</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TABLA PRINCIPAL DE MEDICAMENTOS Y REPOSICIÓN */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Detalle de Medicamentos y Reposición</h2>
            <p className="text-xs text-slate-500 mt-0.5">Estado del inventario individual con columna de reposición obligatoria</p>
          </div>
        </div>

        {cargando ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">Generando reporte de auditoría...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-4">Medicamento</th>
                  <th className="py-4 px-3">Presentación</th>
                  <th className="py-4 px-3 text-center">Stock Actual</th>
                  <th className="py-4 px-3 text-center">Alerta Mínima</th>
                  <th className="py-4 px-3 text-center">Estado</th>
                  <th className="py-4 px-4 text-center">Columna Reposición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {medicamentos.map((med) => {
                  const necesitaReponer = med.estado === 'Pocas unidades' || med.estado === 'Agotado';

                  return (
                    <tr key={med.id} className={`transition-colors hover:bg-slate-50 ${necesitaReponer ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{med.nombre}</div>
                        <span className="text-[11px] text-slate-400 font-mono">ID #{med.id}</span>
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium">
                          {med.presentacion}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center font-black text-slate-900 text-base">
                        {med.cantidadDisponible}
                      </td>

                      <td className="py-4 px-3 text-center font-bold text-slate-500">
                        {med.cantidadMinima}
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          med.estado === 'Disponible' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : med.estado === 'Pocas unidades' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {med.estado}
                        </span>
                      </td>

                      {/* COLUMNA ESPECIAL: REPOSICIÓN (Reponer / No requiere) */}
                      <td className="py-4 px-4 text-center">
                        {necesitaReponer ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>Reponer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>No requiere</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PARTE INFERIOR: TOTALES EXIGIDOS POR REQUERIMIENTO */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl">
          <div className="text-sm text-slate-600">
            Resumen total del reporte de stock al día de hoy.
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Total de medicamentos:</span>
              <span className="text-xl font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {totalMedicamentos}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-800">Requieren reposición:</span>
              <span className="text-xl font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                {totalPorReponer}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LÓGICA CRÍTICA: MODAL / ALERTA AUTOMÁTICA AL ENTRAR A LA VISTA */}
      {mostrarModalAlerta && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-amber-400 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Alerta de Reposición</h3>
                  <p className="text-xs text-amber-800 font-bold">Aviso Automático de Control de Stock</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalAlerta(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-sm font-black text-amber-950">
                ¡Atención! Tienes <span className="underline decoration-2 decoration-rose-500">{totalPorReponer} medicamento(s)</span> que necesitan reposición urgente.
              </p>
              <p className="text-xs text-amber-800">
                Su stock actual se encuentra en niveles de alerta o completamente agotado.
              </p>
            </div>

            {/* Lista de Medicamentos afectados */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {medicamentosPorReponer.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{m.nombre}</p>
                    <p className="text-xs text-slate-500">Mínimo: {m.cantidadMinima} unidades</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      m.cantidadDisponible === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.cantidadDisponible === 0 ? 'Agotado (0)' : `${m.cantidadDisponible} restantes`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/medicamentos"
                onClick={() => setMostrarModalAlerta(false)}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/30 transition-colors text-center flex items-center justify-center gap-2"
              >
                <span>Ir al Mantenedor a Reponer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMostrarModalAlerta(false)}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
