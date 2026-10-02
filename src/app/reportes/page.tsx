'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Pill, 
  FileText,
  AlertOctagon,
  ArrowRight,
  Printer
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
  
  // Modal automático
  const [mostrarModalAlerta, setMostrarModalAlerta] = useState(false);
  const [medicamentosPorReponer, setMedicamentosPorReponer] = useState<Medicamento[]>([]);

  const cargarReporte = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/medicamentos');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const meds: Medicamento[] = data.data;
        setMedicamentos(meds);

        const porReponer = meds.filter(
          (m) => m.estado === 'Pocas unidades' || m.estado === 'Agotado'
        );
        setMedicamentosPorReponer(porReponer);

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

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 shrink-0">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ¿Qué medicamentos debo comprar?
              </h1>
              <p className="text-slate-600 mt-1 text-base">
                Revisa cuáles remedios se están terminando para que no te falten nunca en casa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarReporte}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-purple-600' : ''}`} />
              <span>Actualizar lista</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen Amigable */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Medicamentos</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{cargando ? '...' : totalMedicamentos}</p>
            <p className="text-xs text-slate-500 mt-1">Anotados en tu botiquín</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Tienes Suficientes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tienes Suficientes</p>
            <p className="text-3xl font-black text-emerald-700 mt-1">{cargando ? '...' : totalDisponibles}</p>
            <p className="text-xs text-slate-500 mt-1">No necesitas comprar por ahora</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Por Comprar */}
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 bg-amber-50/60 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Por Comprar</p>
            <p className="text-3xl font-black text-amber-800 mt-1">{cargando ? '...' : totalPorReponer}</p>
            <p className="text-xs text-amber-900 mt-1">Quedan pocos o se acabaron</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TABLA PRINCIPAL CON COLUMNA ESPECIAL DE REPOSICIÓN */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Estado de cada medicamento</h2>
          <p className="text-sm text-slate-500 mt-0.5">Revisa la columna de la derecha para saber qué comprar</p>
        </div>

        {cargando ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-base">Preparando tu lista...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-4">Medicamento</th>
                  <th className="py-4 px-3">Forma</th>
                  <th className="py-4 px-3 text-center">Tienes hoy</th>
                  <th className="py-4 px-3 text-center">Avisar en</th>
                  <th className="py-4 px-3 text-center">Estado</th>
                  <th className="py-4 px-4 text-center">¿Necesitas comprar?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {medicamentos.map((med) => {
                  const necesitaReponer = med.estado === 'Pocas unidades' || med.estado === 'Agotado';

                  return (
                    <tr key={med.id} className={`transition-colors hover:bg-slate-50 ${necesitaReponer ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-base">{med.nombre}</div>
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold">
                          {med.presentacion}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center font-black text-base">
                        <span className={med.cantidadDisponible === 0 ? 'text-rose-600' : med.cantidadDisponible <= med.cantidadMinima ? 'text-amber-600' : 'text-slate-900'}>
                          {med.cantidadDisponible}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center font-bold text-slate-500">
                        {med.cantidadMinima}
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          med.estado === 'Disponible' 
                            ? 'bg-emerald-100 text-emerald-900' 
                            : med.estado === 'Pocas unidades' 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {med.estado === 'Disponible' ? '🟢 Tienes suficientes' : med.estado === 'Pocas unidades' ? '🟡 Quedan pocas' : '🔴 Se acabaron'}
                        </span>
                      </td>

                      {/* COLUMNA ESPECIAL: REPOSICIÓN */}
                      <td className="py-4 px-4 text-center">
                        {necesitaReponer ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30">
                            <AlertOctagon className="w-4 h-4" />
                            <span>Comprar en farmacia</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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

        {/* PARTE INFERIOR: TOTALES EXIGIDOS */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl">
          <div className="text-sm font-semibold text-slate-700">
            Resumen de tu botiquín al día de hoy:
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Total de medicamentos:</span>
              <span className="text-2xl font-black text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
                {totalMedicamentos}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900">Requieren reposición:</span>
              <span className="text-2xl font-black text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200">
                {totalPorReponer}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / ALERTA AUTOMÁTICA AL ENTRAR A LA VISTA */}
      {mostrarModalAlerta && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-amber-400 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Aviso Importante</h3>
                  <p className="text-sm text-amber-800 font-bold">Medicamentos que se están terminando</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalAlerta(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <p className="text-base font-bold text-amber-950">
                ¡Hola Juan! Tienes <span className="underline decoration-2 decoration-rose-500 font-black">{totalPorReponer} medicamento(s)</span> que debes comprar pronto.
              </p>
              <p className="text-sm text-amber-800">
                Quedan muy pocas pastillas o ya se acabaron. Anótalos para tu próxima ida a la farmacia.
              </p>
            </div>

            {/* Lista clara de los que se están terminando */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {medicamentosPorReponer.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{m.nombre}</p>
                    <p className="text-xs text-slate-500">{m.presentacion}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      m.cantidadDisponible === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {m.cantidadDisponible === 0 ? 'Se terminó' : `Quedan ${m.cantidadDisponible}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/medicamentos"
                onClick={() => setMostrarModalAlerta(false)}
                className="w-full sm:flex-1 py-4 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-md transition-colors text-center flex items-center justify-center gap-2"
              >
                <span>Ver en mi botiquín</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMostrarModalAlerta(false)}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base transition-colors"
              >
                Entendido, gracias
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
