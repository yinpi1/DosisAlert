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
  HelpCircle,
  PackageCheck,
  PackageOpen,
  PackageX,
  Sparkles
} from 'lucide-react';
import { calcularEstadoMedicamento, obtenerBadgeEstado } from '@/lib/medicamentos';

interface Medicamento {
  id: number;
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  estado: string;
  createdAt?: string;
}

const PRESENTACIONES_COMUNES = [
  'Comprimidos',
  'Cápsulas',
  'Jarabe (ml)',
  'Gotas (ml)',
  'Inhalador (dosis)',
  'Sobres / Polvo',
  'Inyectable (ampolla)',
  'Pomada / Crema',
];

export default function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorConexion, setErrorConexion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Form State
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [presentacion, setPresentacion] = useState('Comprimidos');
  const [cantidadDisponible, setCantidadDisponible] = useState<number | ''>(20);
  const [cantidadMinima, setCantidadMinima] = useState<number | ''>(5);

  // Modales
  const [medicamentoVer, setMedicamentoVer] = useState<Medicamento | null>(null);
  const [medicamentoEliminar, setMedicamentoEliminar] = useState<Medicamento | null>(null);

  // Filtro rápido de tabla
  const [filtroTexto, setFiltroTexto] = useState('');

  // IDs únicos para accesibilidad en formulario
  const formNombreId = useId();
  const formPresentacionId = useId();
  const formDisponibleId = useId();
  const formMinimaId = useId();

  // Cálculo en tiempo real de la Regla de Negocio Crítica para la vista previa
  const numDisponible = typeof cantidadDisponible === 'number' ? cantidadDisponible : 0;
  const numMinima = typeof cantidadMinima === 'number' ? cantidadMinima : 0;
  const estadoCalculadoEnVivo = calcularEstadoMedicamento(numDisponible, numMinima);
  const badgeCalculadoEnVivo = obtenerBadgeEstado(estadoCalculadoEnVivo);

  // Cargar lista desde PostgreSQL
  const cargarMedicamentos = async () => {
    setCargando(true);
    setErrorConexion(null);
    try {
      const res = await fetch('/api/medicamentos');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar con la base de datos PostgreSQL.');
      }
      setMedicamentos(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido de conexión';
      setErrorConexion(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  // Limpiar formulario
  const resetFormulario = () => {
    setIdEditando(null);
    setNombre('');
    setPresentacion('Comprimidos');
    setCantidadDisponible(20);
    setCantidadMinima(5);
  };

  // Cargar datos en el formulario para editar
  const iniciarEdicion = (med: Medicamento) => {
    setIdEditando(med.id);
    setNombre(med.nombre);
    setPresentacion(med.presentacion);
    setCantidadDisponible(med.cantidadDisponible);
    setCantidadMinima(med.cantidadMinima);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enviar formulario (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingrese el nombre del medicamento.');
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
        throw new Error(data.error || 'Ocurrió un error al guardar en PostgreSQL.');
      }

      setMensajeExito(idEditando ? '¡Medicamento actualizado exitosamente!' : '¡Medicamento registrado exitosamente!');
      resetFormulario();
      cargarMedicamentos();

      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      alert(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación en PostgreSQL
  const ejecutarEliminacion = async () => {
    if (!medicamentoEliminar) return;

    try {
      const res = await fetch(`/api/medicamentos/${medicamentoEliminar.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo eliminar el medicamento.');
      }

      setMensajeExito(`El medicamento "${medicamentoEliminar.nombre}" fue eliminado.`);
      setMedicamentoEliminar(null);
      if (idEditando === medicamentoEliminar.id) {
        resetFormulario();
      }
      cargarMedicamentos();
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(`Error: ${msg}`);
    }
  };

  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    m.presentacion.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado Principal con Resumen */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Mantenedor de Medicamentos
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  CRUD Activo
                </span>
              </div>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Registra, actualiza y controla el inventario de tu botiquín con cálculo automatizado de estado.
              </p>
            </div>
          </div>

          <button
            onClick={cargarMedicamentos}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all focus:ring-2 focus:ring-emerald-500"
            title="Recargar datos desde PostgreSQL"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualizar Datos</span>
          </button>
        </div>

        {/* Mensaje de Éxito Flotante */}
        {mensajeExito && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="font-bold text-sm">{mensajeExito}</p>
          </div>
        )}

        {/* Alerta de Error de Conexión si PostgreSQL no responde */}
        {errorConexion && (
          <div className="mt-4 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm">Aviso de conexión a PostgreSQL (localhost:5432)</p>
                <p className="text-xs text-amber-800 mt-0.5">{errorConexion}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Asegúrate de que tu servicio PostgreSQL local esté activo y ejecuta: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">npx prisma migrate dev</code>
                </p>
              </div>
            </div>
            <button
              onClick={cargarMedicamentos}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shrink-0 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* VISTA DIVIDIDA (SPLIT VIEW): IZQUIERDA TABLA / DERECHA FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL IZQUIERDO: TABLA DE MEDICAMENTOS (7 Columnas en Desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Medicamentos Registrados</span>
                <span className="text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                  {medicamentos.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Control de existencias y umbral de alerta</p>
            </div>

            {/* Buscador Rápido en Tabla */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Tabla Responsive */}
          {cargando ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-slate-600 font-bold text-sm">Consultando PostgreSQL local...</p>
            </div>
          ) : medicamentosFiltrados.length === 0 ? (
            <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <PackageOpen className="w-6 h-6" />
              </div>
              <p className="text-slate-800 font-bold">No hay medicamentos que coincidan</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {filtroTexto ? 'Prueba con otro término de búsqueda' : 'Utiliza el formulario de la derecha para agregar tu primer medicamento al botiquín.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Medicamento</th>
                    <th className="py-3.5 px-3">Presentación</th>
                    <th className="py-3.5 px-3 text-center">Disponibles</th>
                    <th className="py-3.5 px-3 text-center">Alerta Mín.</th>
                    <th className="py-3.5 px-3 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {medicamentosFiltrados.map((med) => {
                    const badge = obtenerBadgeEstado(med.estado);
                    const estaEditandoEste = idEditando === med.id;

                    return (
                      <tr 
                        key={med.id} 
                        className={`transition-colors hover:bg-slate-50/80 ${estaEditandoEste ? 'bg-emerald-50/60 ring-2 ring-emerald-500/20' : ''}`}
                      >
                        {/* Nombre */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{med.nombre}</span>
                            {estaEditandoEste && (
                              <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-sm">
                                Editando
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">ID #{med.id}</span>
                        </td>

                        {/* Presentación */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs">
                            {med.presentacion}
                          </span>
                        </td>

                        {/* Cantidad Disponible */}
                        <td className="py-3.5 px-3 text-center font-bold">
                          <span className={`text-base ${med.cantidadDisponible === 0 ? 'text-rose-600 font-black' : med.cantidadDisponible <= med.cantidadMinima ? 'text-amber-600' : 'text-slate-800'}`}>
                            {med.cantidadDisponible}
                          </span>
                        </td>

                        {/* Alerta Mínima */}
                        <td className="py-3.5 px-3 text-center font-medium text-slate-500">
                          {med.cantidadMinima}
                        </td>

                        {/* Estado (Calculado Automáticamente) */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.colorBadge}`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                            {badge.texto}
                          </span>
                        </td>

                        {/* Botones de Acción Accesibles */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver */}
                            <button
                              onClick={() => setMedicamentoVer(med)}
                              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus:ring-2 focus:ring-emerald-500"
                              title="Ver detalle del medicamento"
                              aria-label={`Ver detalles de ${med.nombre}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => iniciarEdicion(med)}
                              className="p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-500"
                              title="Editar medicamento"
                              aria-label={`Editar ${med.nombre}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => setMedicamentoEliminar(med)}
                              className="p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors focus:ring-2 focus:ring-rose-500"
                              title="Eliminar medicamento"
                              aria-label={`Eliminar ${med.nombre}`}
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Leyenda de UX para Salud */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
            <span className="font-semibold text-slate-600">Reglas del Sistema:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Disponible (&gt; mín)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Pocas unidades (&le; mín)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Agotado (0)</span>
              </span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO AGREGAR / EDITAR (5 Columnas en Desktop) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6 sticky top-28">
          
          {/* Título de la tarjeta del Formulario */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idEditando ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {idEditando ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {idEditando ? 'Modificar Medicamento' : 'Registrar Medicamento'}
                </h2>
                <p className="text-xs text-slate-500">
                  {idEditando ? `Actualizando ID #${idEditando}` : 'Añadir nuevo producto al botiquín'}
                </p>
              </div>
            </div>

            {idEditando && (
              <button
                type="button"
                onClick={resetFormulario}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo: Nombre */}
            <div>
              <label htmlFor={formNombreId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Medicamento *
              </label>
              <input
                id={formNombreId}
                type="text"
                required
                placeholder="Ej: Paracetamol 500 mg"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-base px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Campo: Presentación */}
            <div>
              <label htmlFor={formPresentacionId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Presentación Farmacéutica *
              </label>
              <select
                id={formPresentacionId}
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                className="w-full text-base px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 transition-all cursor-pointer"
              >
                {PRESENTACIONES_COMUNES.map((pres) => (
                  <option key={pres} value={pres}>
                    {pres}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid 2 Columnas para Cantidades */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cantidad Disponible */}
              <div>
                <label htmlFor={formDisponibleId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Stock Disponible *
                </label>
                <input
                  id={formDisponibleId}
                  type="number"
                  min="0"
                  required
                  value={cantidadDisponible}
                  onChange={(e) => setCantidadDisponible(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full text-lg px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-black text-slate-900 text-center transition-all"
                />
                <span className="text-[11px] text-slate-500 block text-center mt-1">Unidades actuales</span>
              </div>

              {/* Cantidad Mínima */}
              <div>
                <label htmlFor={formMinimaId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alerta Mínima *
                </label>
                <input
                  id={formMinimaId}
                  type="number"
                  min="0"
                  required
                  value={cantidadMinima}
                  onChange={(e) => setCantidadMinima(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full text-lg px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-black text-slate-900 text-center transition-all"
                />
                <span className="text-[11px] text-slate-500 block text-center mt-1">Umbral de reposición</span>
              </div>
            </div>

            {/* SECCIÓN CRÍTICA: ESTADO CALCULADO AUTOMÁTICAMENTE (NO EDITABLE) */}
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Estado del Medicamento (Automático)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Lógica de Negocio</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-600">Calculado para este registro:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${badgeCalculadoEnVivo.colorBadge}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${badgeCalculadoEnVivo.dotColor}`} />
                    {badgeCalculadoEnVivo.texto}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Esta categoría es calculada por el sistema comparando el stock actual ({numDisponible}) con la alerta mínima ({numMinima}).
                </p>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN GRANDES (UX DE SALUD) */}
            <div className="pt-3 space-y-2">
              <button
                type="submit"
                disabled={guardando}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  idEditando
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                } disabled:opacity-50`}
              >
                {guardando ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardando en PostgreSQL...</span>
                  </>
                ) : idEditando ? (
                  <>
                    <Edit3 className="w-5 h-5" />
                    <span>Actualizar Medicamento</span>
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
                  className="w-full py-3 px-4 rounded-xl text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Descartar Cambios
                </button>
              )}
            </div>

          </form>
        </div>

      </div>

      {/* MODAL: VER DETALLE DEL MEDICAMENTO */}
      {medicamentoVer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{medicamentoVer.nombre}</h3>
                  <p className="text-xs text-slate-500">Detalle de registro en base de datos</p>
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
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Presentación</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{medicamentoVer.presentacion}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Estado del Stock</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${obtenerBadgeEstado(medicamentoVer.estado).colorBadge}`}>
                    {medicamentoVer.estado}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Stock Disponible</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{medicamentoVer.cantidadDisponible} unidades</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Umbral Alerta Mínima</p>
                <p className="text-2xl font-black text-amber-600 mt-0.5">{medicamentoVer.cantidadMinima} unidades</p>
              </div>
            </div>

            {/* Barra Visual de Stock */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Capacidad y Seguridad de Stock</span>
                <span>
                  {medicamentoVer.cantidadDisponible > 0 ? `${medicamentoVer.cantidadDisponible} disponibles` : 'Sin existencias'}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    medicamentoVer.cantidadDisponible === 0
                      ? 'bg-rose-500 w-0'
                      : medicamentoVer.cantidadDisponible <= medicamentoVer.cantidadMinima
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (medicamentoVer.cantidadDisponible / (medicamentoVer.cantidadMinima * 3 || 15)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  iniciarEdicion(medicamentoVer);
                  setMedicamentoVer(null);
                }}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar este Medicamento</span>
              </button>
              <button
                onClick={() => setMedicamentoVer(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">¿Eliminar medicamento?</h3>
              <p className="text-sm text-slate-600">
                Estás a punto de eliminar <strong className="text-slate-900 font-black">{medicamentoEliminar.nombre}</strong> de la base de datos de PostgreSQL. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setMedicamentoEliminar(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
