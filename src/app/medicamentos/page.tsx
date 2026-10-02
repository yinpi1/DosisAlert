'use client';

import { useState, useEffect, useId } from 'react';
import { 
  Pill, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  PackageOpen,
  Info
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

const PRESENTACIONES_AMIGABLES = [
  'Comprimidos / Pastillas',
  'Cápsulas',
  'Jarabe',
  'Gotas',
  'Inhalador',
  'Sobres',
  'Inyectable',
  'Pomada / Crema',
];

export default function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorConexion, setErrorConexion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [presentacion, setPresentacion] = useState('Comprimidos / Pastillas');
  const [cantidadDisponible, setCantidadDisponible] = useState<number | ''>(20);
  const [cantidadMinima, setCantidadMinima] = useState<number | ''>(5);

  // Modales
  const [medicamentoVer, setMedicamentoVer] = useState<Medicamento | null>(null);
  const [medicamentoEliminar, setMedicamentoEliminar] = useState<Medicamento | null>(null);

  // Filtro rápido
  const [filtroTexto, setFiltroTexto] = useState('');

  const formNombreId = useId();
  const formPresentacionId = useId();
  const formDisponibleId = useId();
  const formMinimaId = useId();

  // Cálculo en vivo
  const numDisponible = typeof cantidadDisponible === 'number' ? cantidadDisponible : 0;
  const numMinima = typeof cantidadMinima === 'number' ? cantidadMinima : 0;
  const estadoCalculadoEnVivo = calcularEstadoMedicamento(numDisponible, numMinima);
  const badgeCalculadoEnVivo = obtenerBadgeEstado(estadoCalculadoEnVivo);

  const cargarMedicamentos = async () => {
    setCargando(true);
    setErrorConexion(null);
    try {
      const res = await fetch('/api/medicamentos');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo conectar con la base de datos.');
      }
      setMedicamentos(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar';
      setErrorConexion(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const resetFormulario = () => {
    setIdEditando(null);
    setNombre('');
    setPresentacion('Comprimidos / Pastillas');
    setCantidadDisponible(20);
    setCantidadMinima(5);
  };

  const iniciarEdicion = (med: Medicamento) => {
    setIdEditando(med.id);
    setNombre(med.nombre);
    setPresentacion(med.presentacion);
    setCantidadDisponible(med.cantidadDisponible);
    setCantidadMinima(med.cantidadMinima);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor escribe el nombre de tu medicamento.');
      return;
    }

    setGuardando(true);
    setMensajeExito(null);

    const payload = {
      nombre: nombre.trim(),
      presentacion: presentacion.trim(),
      cantidadDisponible: numDisponible,
      cantidadMinima: numMinima,
    };

    try {
      const url = idEditando ? `/api/medicamentos/${idEditando}` : '/api/medicamentos';
      const method = idEditando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo guardar el medicamento.');
      }

      setMensajeExito(idEditando ? '¡Medicamento modificado con éxito!' : '¡Medicamento guardado en tu botiquín!');
      resetFormulario();
      cargarMedicamentos();

      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(`No pudimos guardar: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!medicamentoEliminar) return;

    try {
      const res = await fetch(`/api/medicamentos/${medicamentoEliminar.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo borrar el medicamento.');
      }

      setMensajeExito(`"${medicamentoEliminar.nombre}" se quitó de tu botiquín.`);
      setMedicamentoEliminar(null);
      if (idEditando === medicamentoEliminar.id) {
        resetFormulario();
      }
      cargarMedicamentos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al borrar';
      alert(`Error: ${msg}`);
    }
  };

  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    m.presentacion.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Encabezado Amigable */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mis Medicamentos
              </h1>
              <p className="text-slate-600 mt-1 text-base">
                Anota tus remedios, cuántos tienes en casa y cuándo necesitas que te avisemos para comprar más.
              </p>
            </div>
          </div>

          <button
            onClick={cargarMedicamentos}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualizar lista</span>
          </button>
        </div>

        {/* Mensaje de Éxito */}
        {mensajeExito && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="font-bold text-base">{mensajeExito}</p>
          </div>
        )}

        {/* Mensaje si la base de datos no está abierta */}
        {errorConexion && (
          <div className="mt-4 p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">No pudimos conectar con tus datos guardados</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Asegúrate de tener activa la base de datos de tu computadora para ver los registros.
                </p>
              </div>
            </div>
            <button
              onClick={cargarMedicamentos}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* VISTA DIVIDIDA: IZQUIERDA TABLA / DERECHA FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL IZQUIERDO: LISTA DE REMEDIOS */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Tu Lista de Remedios</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {medicamentos.length} anotados
                </span>
              </h2>
            </div>

            {/* Buscador Rápido */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Buscar en tu lista..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {cargando ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-slate-600 font-bold text-base">Cargando tus medicamentos...</p>
            </div>
          ) : medicamentosFiltrados.length === 0 ? (
            <div className="py-14 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <PackageOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-800 font-bold text-base">No hay medicamentos en la lista</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {filtroTexto ? 'Prueba con otra palabra para buscar.' : 'Usa el formulario de la derecha para anotar tu primer medicamento.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-4">Medicamento</th>
                    <th className="py-4 px-3">Forma</th>
                    <th className="py-4 px-3 text-center">Tienes</th>
                    <th className="py-4 px-3 text-center">Avisar en</th>
                    <th className="py-4 px-3 text-center">Estado</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {medicamentosFiltrados.map((med) => {
                    const badge = obtenerBadgeEstado(med.estado);
                    const estaEditandoEste = idEditando === med.id;

                    return (
                      <tr 
                        key={med.id} 
                        className={`transition-colors hover:bg-slate-50 ${estaEditandoEste ? 'bg-emerald-50/70 ring-2 ring-emerald-500/30' : ''}`}
                      >
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <span>{med.nombre}</span>
                            {estaEditandoEste && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-sm">
                                Editando
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-3 text-slate-600 font-medium">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
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
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.colorBadge}`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                            {badge.textoCorto}
                          </span>
                        </td>

                        {/* Botones de Acción Accesibles */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setMedicamentoVer(med)}
                              className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Ver información"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => iniciarEdicion(med)}
                              className="p-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Modificar datos"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setMedicamentoEliminar(med)}
                              className="p-2.5 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Borrar de la lista"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Leyenda de Colores Clara */}
          <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3 border-t border-slate-100">
            <span className="font-bold">Guía de colores:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>🟢 Tienes suficientes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>🟡 Quedan pocas pastillas</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>🔴 Se terminaron</span>
              </span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO SIMPLE Y CLARO */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6 sticky top-28">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${idEditando ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {idEditando ? <Edit3 className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {idEditando ? 'Modificar Remedio' : 'Anotar un Remedio'}
                </h2>
                <p className="text-xs text-slate-500">
                  {idEditando ? 'Cambia los datos que necesites' : 'Agrega un nuevo medicamento a tu botiquín'}
                </p>
              </div>
            </div>

            {idEditando && (
              <button
                type="button"
                onClick={resetFormulario}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre */}
            <div>
              <label htmlFor={formNombreId} className="block text-sm font-bold text-slate-800 mb-1.5">
                ¿Cómo se llama el medicamento? *
              </label>
              <input
                id={formNombreId}
                type="text"
                required
                placeholder="Ej: Paracetamol 500 mg"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-base px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Presentación */}
            <div>
              <label htmlFor={formPresentacionId} className="block text-sm font-bold text-slate-800 mb-1.5">
                ¿Cómo viene presentado?
              </label>
              <select
                id={formPresentacionId}
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                className="w-full text-base px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 cursor-pointer"
              >
                {PRESENTACIONES_AMIGABLES.map((pres) => (
                  <option key={pres} value={pres}>
                    {pres}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidades con explicaciones humanas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={formDisponibleId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ¿Cuántas tienes hoy? *
                </label>
                <input
                  id={formDisponibleId}
                  type="number"
                  min="0"
                  required
                  value={cantidadDisponible}
                  onChange={(e) => setCantidadDisponible(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full text-xl px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-black text-slate-900 text-center"
                />
                <span className="text-[11px] text-slate-500 block text-center mt-1">Unidades en casa</span>
              </div>

              <div>
                <label htmlFor={formMinimaId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Avisarme cuando queden *
                </label>
                <input
                  id={formMinimaId}
                  type="number"
                  min="0"
                  required
                  value={cantidadMinima}
                  onChange={(e) => setCantidadMinima(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full text-xl px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-black text-slate-900 text-center"
                />
                <span className="text-[11px] text-slate-500 block text-center mt-1">Para ir a la farmacia</span>
              </div>
            </div>

            {/* Estado Estimado en Vivo */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Aviso según la cantidad:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badgeCalculadoEnVivo.colorBadge}`}>
                  {badgeCalculadoEnVivo.icono} {badgeCalculadoEnVivo.texto}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                El sistema te avisará automáticamente cuando te queden {numMinima} pastillas o menos.
              </p>
            </div>

            {/* Botones Grandes */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={guardando}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  idEditando
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } disabled:opacity-50`}
              >
                {guardando ? (
                  <span>Guardando...</span>
                ) : idEditando ? (
                  <>
                    <Edit3 className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    <span>Guardar Medicamento</span>
                  </>
                )}
              </button>

              {idEditando && (
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="w-full py-3 px-4 rounded-xl text-slate-700 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

          </form>
        </div>

      </div>

      {/* MODAL: VER DETALLE DEL MEDICAMENTO */}
      {medicamentoVer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{medicamentoVer.nombre}</h3>
                  <p className="text-xs text-slate-500">Detalles de tu medicamento</p>
                </div>
              </div>
              <button
                onClick={() => setMedicamentoVer(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">¿Cómo viene?</p>
                <p className="text-base font-bold text-slate-900 mt-1">{medicamentoVer.presentacion}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Estado actual</p>
                <p className="text-base font-bold text-slate-900 mt-1">
                  {obtenerBadgeEstado(medicamentoVer.estado).icono} {obtenerBadgeEstado(medicamentoVer.estado).texto}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Tienes en casa</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{medicamentoVer.cantidadDisponible} unidades</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Avisar para comprar en</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{medicamentoVer.cantidadMinima} unidades</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  iniciarEdicion(medicamentoVer);
                  setMedicamentoVer(null);
                }}
                className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modificar datos</span>
              </button>
              <button
                onClick={() => setMedicamentoVer(null)}
                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {medicamentoEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">¿Quieres quitar este medicamento?</h3>
              <p className="text-base text-slate-600">
                Vas a quitar <strong className="text-slate-900">{medicamentoEliminar.nombre}</strong> de tu lista.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setMedicamentoEliminar(null)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                No, conservarlo
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-colors"
              >
                Sí, quitarlo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
