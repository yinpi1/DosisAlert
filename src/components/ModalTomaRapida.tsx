'use client';

import { useState, useEffect } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Clock, 
  Zap, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { calcularEstadoMedicamento, obtenerBadgeEstado } from '@/lib/medicamentos';

interface Medicamento {
  id: number;
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  estado: string;
}

interface ResumenToma {
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicamentoPreseleccionadoId?: number;
  onTomaExitosa?: (resumen: ResumenToma) => void;
}

export default function ModalTomaRapida({
  isOpen,
  onClose,
  medicamentoPreseleccionadoId,
  onTomaExitosa,
}: Props) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargandoMeds, setCargandoMeds] = useState(false);
  const [medSeleccionadoId, setMedSeleccionadoId] = useState<number | null>(null);
  const [dosis, setDosis] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumenExito, setResumenExito] = useState<ResumenToma | null>(null);

  // Cargar lista de medicamentos al abrir
  useEffect(() => {
    if (isOpen) {
      setCargandoMeds(true);
      setError(null);
      setResumenExito(null);
      setDosis(1);

      fetch('/api/medicamentos')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setMedicamentos(data.data);
            if (medicamentoPreseleccionadoId) {
              setMedSeleccionadoId(medicamentoPreseleccionadoId);
            } else {
              // Seleccionar el primero disponible si existe
              const primerDisponible = data.data.find((m: Medicamento) => m.cantidadDisponible > 0);
              if (primerDisponible) {
                setMedSeleccionadoId(primerDisponible.id);
              } else if (data.data.length > 0) {
                setMedSeleccionadoId(data.data[0].id);
              }
            }
          }
        })
        .catch((e) => {
          console.error(e);
          setError('No pudimos cargar tu lista de medicamentos.');
        })
        .finally(() => setCargandoMeds(false));
    }
  }, [isOpen, medicamentoPreseleccionadoId]);

  if (!isOpen) return null;

  const medActual = medicamentos.find((m) => m.id === medSeleccionadoId);

  const handleConfirmarToma = async () => {
    if (!medActual) {
      setError('Por favor selecciona qué medicamento tomaste.');
      return;
    }

    if (medActual.cantidadDisponible <= 0) {
      setError(`No quedan unidades de ${medActual.nombre} en el botiquín.`);
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const res = await fetch('/api/tomas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicamentoId: medActual.id,
          dosis,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo registrar la toma.');
      }

      setResumenExito(data.data);

      // Notificar a observadores o actualizar estado global
      if (onTomaExitosa) {
        onTomaExitosa(data.data);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dosisalert:toma-registrada', { detail: data.data }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la toma';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleReiniciarParaOtraToma = () => {
    setResumenExito(null);
    setDosis(1);
    // Recargar medicamentos para ver el stock actualizado
    fetch('/api/medicamentos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMedicamentos(data.data);
        }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                Acción Rápida
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight">
                ¡Me tomé un remedio!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-6">
          {resumenExito ? (
            /* Pantalla de Éxito */
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  ¡Toma registrada con éxito!
                </h3>
                <p className="text-slate-600 mt-1 text-base">
                  Se descontó automáticamente de tu inventario.
                </p>
              </div>

              {/* Tarjeta con los detalles descontados */}
              <div className="bg-slate-50 border-2 border-emerald-200 rounded-2xl p-5 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-500">Medicamento:</span>
                  <span className="text-base font-black text-slate-900">{resumenExito.nombre}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-500">Dosis descontada:</span>
                  <span className="text-base font-black text-emerald-700">
                    -{resumenExito.cantidadTomada} {resumenExito.cantidadTomada === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Te quedan en casa:</span>
                  <span className="text-xl font-black text-slate-900">
                    {resumenExito.cantidadRestante} {resumenExito.cantidadRestante === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>
              </div>

              {/* Alerta si queda poco stock */}
              {resumenExito.alertaMinimaDisparada && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-left flex items-start gap-3 text-amber-950">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black">Aviso de reposición:</p>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Te quedan {resumenExito.cantidadRestante} unidades (llegaste al mínimo de seguridad). Recuerda anotarlo para comprar más.
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción post-toma */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleReiniciarParaOtraToma}
                  className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                >
                  Registrar otro remedio
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md shadow-emerald-600/30 transition-colors cursor-pointer"
                >
                  Listo, cerrar
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Toma Rápida */
            <div className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Paso 1: Seleccionar Medicamento */}
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2">
                  1. ¿Qué remedio te tomaste?
                </label>

                {cargandoMeds ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs font-bold">Cargando tus medicamentos...</span>
                  </div>
                ) : medicamentos.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-100 text-center text-slate-600 text-sm">
                    No tienes medicamentos registrados en el botiquín todavía.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                    {medicamentos.map((med) => {
                      const seleccionado = medSeleccionadoId === med.id;
                      const sinStock = med.cantidadDisponible <= 0;
                      const badge = obtenerBadgeEstado(med.estado);

                      return (
                        <button
                          key={med.id}
                          type="button"
                          disabled={sinStock}
                          onClick={() => {
                            setMedSeleccionadoId(med.id);
                            setError(null);
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            seleccionado
                              ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                              : sinStock
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              seleccionado ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              <Pill className="w-5 h-5 -rotate-45" />
                            </div>
                            <div className="truncate">
                              <p className="font-black text-slate-900 text-base leading-tight truncate">
                                {med.nombre}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {med.presentacion}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full border ${badge.colorBadge}`}>
                              {sinStock ? 'Agotado (0)' : `Quedan ${med.cantidadDisponible}`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Paso 2: Cantidad tomada */}
              {medActual && medActual.cantidadDisponible > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-black text-slate-800 mb-2">
                    2. ¿Cuántas pastillas o dosis tomaste?
                  </label>

                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-600 pl-2">
                      Cantidad a descontar:
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDosis((prev) => Math.max(1, prev - 1))}
                        disabled={dosis <= 1}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        aria-label="Disminuir dosis"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-12 text-center text-2xl font-black text-slate-900">
                        {dosis}
                      </span>

                      <button
                        type="button"
                        onClick={() => setDosis((prev) => Math.min(medActual.cantidadDisponible, prev + 1))}
                        disabled={dosis >= medActual.cantidadDisponible}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        aria-label="Aumentar dosis"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Atajos rápidos 1 o 2 */}
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDosis(val)}
                        disabled={val > medActual.cantidadDisponible}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          dosis === val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {val} {val === 1 ? 'pastilla' : 'pastillas'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón Principal de Confirmación */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmarToma}
                  disabled={enviando || !medActual || (medActual && medActual.cantidadDisponible <= 0)}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {enviando ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Descontando del botiquín...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Confirmar: Ya me lo tomé</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  Se restará automáticamente de tu stock y quedará anotado en tu historial.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
