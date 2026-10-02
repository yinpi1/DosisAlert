'use client';

import { useState, useEffect } from 'react';
import { Search, Pill, Filter, RefreshCw, Eye, PackageX } from 'lucide-react';
import { obtenerBadgeEstado } from '@/lib/medicamentos';
import Link from 'next/link';

interface Medicamento {
  id: number;
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  estado: string;
}

export default function BuscarPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const cargarDatos = () => {
    setCargando(true);
    fetch('/api/medicamentos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMedicamentos(data.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado reactivo por Nombre y Estado
  const resultados = medicamentos.filter((med) => {
    const coincideNombre = med.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      med.presentacion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || med.estado === filtroEstado;
    return coincideNombre && coincideEstado;
  });

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Búsqueda y Filtros de Medicamentos
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Encuentra rápidamente cualquier medicamento en la farmacia personal por su nombre o estado de stock.
              </p>
            </div>
          </div>

          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros: Buscador por Nombre + Select por Estado */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Buscador por Nombre */}
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Medicamento
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Escribe el nombre del fármaco (ej. Paracetamol, Losartán)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full text-base pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 transition-all placeholder:text-slate-400"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Select Filtro por Estado */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Filtrar por Estado
            </label>
            <div className="relative">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full text-base pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 transition-all cursor-pointer"
              >
                <option value="Todos">Todos los Estados</option>
                <option value="Disponible">Disponible (Stock seguro)</option>
                <option value="Pocas unidades">Pocas unidades (Alerta)</option>
                <option value="Agotado">Agotado (Sin stock)</option>
              </select>
              <Filter className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

        </div>

        {/* Resumen de coincidencias */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando <strong>{resultados.length}</strong> de <strong>{medicamentos.length}</strong> medicamentos</span>
          {(busqueda || filtroEstado !== 'Todos') && (
            <button
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('Todos');
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Resultados de la Búsqueda</h2>

        {cargando ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">Consultando registros...</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <PackageX className="w-6 h-6" />
            </div>
            <p className="text-slate-800 font-bold">No se encontraron medicamentos</p>
            <p className="text-xs text-slate-500">
              Intenta cambiar los términos de búsqueda o el filtro de estado seleccionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Medicamento</th>
                  <th className="py-3.5 px-3">Presentación</th>
                  <th className="py-3.5 px-3 text-center">Stock Disponible</th>
                  <th className="py-3.5 px-3 text-center">Alerta Mínima</th>
                  <th className="py-3.5 px-3 text-center">Estado Calculado</th>
                  <th className="py-3.5 px-4 text-center">Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {resultados.map((med) => {
                  const badge = obtenerBadgeEstado(med.estado);
                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{med.nombre}</div>
                        <span className="text-[11px] text-slate-400 font-mono">ID #{med.id}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium">
                          {med.presentacion}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-slate-900 text-base">
                        {med.cantidadDisponible}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                        {med.cantidadMinima}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.colorBadge}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                          {badge.texto}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href="/medicamentos"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Gestionar</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
