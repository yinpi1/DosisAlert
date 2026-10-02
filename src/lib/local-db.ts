import fs from 'fs';
import path from 'path';
import { calcularEstadoMedicamento } from './medicamentos';

export interface LocalMedicamento {
  id: number;
  usuarioId: number;
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalToma {
  id: number;
  usuarioId: number;
  medicamentoId: number;
  horaConfirmacion: string;
  cantidadTomada: number;
  createdAt: string;
}

export interface LocalAlerta {
  id: number;
  usuarioId: number;
  medicamentoId: number;
  horaGenerada: string;
  cantidadRestante: number;
  estado: string;
  createdAt: string;
}

export interface LocalReporte {
  id: number;
  usuarioId: number;
  totalMedicamentos: number;
  cantidadPorReponer: number;
  fechaReporte: string;
}

interface LocalDatabase {
  usuario: {
    id: number;
    rut: string;
    correo: string;
    nombre: string;
  };
  medicamentos: LocalMedicamento[];
  tomas: LocalToma[];
  alertas: LocalAlerta[];
  reportes: LocalReporte[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'botiquin-local.json');

// Datos iniciales de demostración basados en las reglas de negocio
const DATOS_INICIALES: LocalDatabase = {
  usuario: {
    id: 1,
    rut: '12.345.678-9',
    correo: 'paciente@dosisalert.cl',
    nombre: 'Juan Pérez González',
  },
  medicamentos: [
    {
      id: 1,
      usuarioId: 1,
      nombre: 'Paracetamol 500 mg',
      presentacion: 'Comprimidos / Pastillas',
      cantidadDisponible: 20,
      cantidadMinima: 5,
      estado: 'Disponible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      usuarioId: 1,
      nombre: 'Losartán 50 mg',
      presentacion: 'Comprimidos / Pastillas',
      cantidadDisponible: 3,
      cantidadMinima: 5,
      estado: 'Pocas unidades',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      usuarioId: 1,
      nombre: 'Omeprazol 20 mg',
      presentacion: 'Cápsulas',
      cantidadDisponible: 0,
      cantidadMinima: 4,
      estado: 'Agotado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      usuarioId: 1,
      nombre: 'Metformina 850 mg',
      presentacion: 'Comprimidos / Pastillas',
      cantidadDisponible: 14,
      cantidadMinima: 6,
      estado: 'Disponible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tomas: [],
  alertas: [
    {
      id: 1,
      usuarioId: 1,
      medicamentoId: 2,
      horaGenerada: '09:00',
      cantidadRestante: 3,
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      usuarioId: 1,
      medicamentoId: 3,
      horaGenerada: '10:00',
      cantidadRestante: 0,
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
    },
  ],
  reportes: [],
};

// Variable en memoria global para desarrollo rápido y evitar I/O bloqueante
const globalCache = globalThis as unknown as {
  __dosisAlertDb?: LocalDatabase;
};

function leerBaseDatos(): LocalDatabase {
  if (globalCache.__dosisAlertDb) {
    return globalCache.__dosisAlertDb;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const contenido = fs.readFileSync(DB_FILE, 'utf-8');
      globalCache.__dosisAlertDb = JSON.parse(contenido);
      return globalCache.__dosisAlertDb!;
    }
  } catch (err) {
    console.error('Error al leer botiquin-local.json, reinicializando:', err);
  }

  // Si no existe o falló, inicializamos con los datos por defecto
  guardarBaseDatos(DATOS_INICIALES);
  return globalCache.__dosisAlertDb!;
}

function guardarBaseDatos(db: LocalDatabase): void {
  globalCache.__dosisAlertDb = db;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar en botiquin-local.json:', err);
  }
}

// OPERACIONES DE MEDICAMENTOS

export function obtenerMedicamentosLocal(): LocalMedicamento[] {
  const db = leerBaseDatos();
  // Recalcular estado por si las cantidades cambiaron
  return db.medicamentos.map((m) => ({
    ...m,
    estado: calcularEstadoMedicamento(m.cantidadDisponible, m.cantidadMinima),
  }));
}

export function obtenerMedicamentoPorIdLocal(id: number): LocalMedicamento | null {
  const db = leerBaseDatos();
  const med = db.medicamentos.find((m) => m.id === id);
  if (!med) return null;
  return {
    ...med,
    estado: calcularEstadoMedicamento(med.cantidadDisponible, med.cantidadMinima),
  };
}

export function crearMedicamentoLocal(data: {
  nombre: string;
  presentacion: string;
  cantidadDisponible: number;
  cantidadMinima: number;
}): LocalMedicamento {
  const db = leerBaseDatos();
  const nuevoId = db.medicamentos.length > 0 ? Math.max(...db.medicamentos.map((m) => m.id)) + 1 : 1;
  const estado = calcularEstadoMedicamento(data.cantidadDisponible, data.cantidadMinima);

  const nuevo: LocalMedicamento = {
    id: nuevoId,
    usuarioId: 1,
    nombre: data.nombre.trim(),
    presentacion: data.presentacion.trim(),
    cantidadDisponible: data.cantidadDisponible,
    cantidadMinima: data.cantidadMinima,
    estado,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.medicamentos.push(nuevo);

  if (estado === 'Pocas unidades' || estado === 'Agotado') {
    db.alertas.push({
      id: db.alertas.length + 1,
      usuarioId: 1,
      medicamentoId: nuevoId,
      horaGenerada: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cantidadRestante: data.cantidadDisponible,
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
    });
  }

  guardarBaseDatos(db);
  return nuevo;
}

export function actualizarMedicamentoLocal(
  id: number,
  data: {
    nombre: string;
    presentacion: string;
    cantidadDisponible: number;
    cantidadMinima: number;
  }
): LocalMedicamento | null {
  const db = leerBaseDatos();
  const index = db.medicamentos.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const estado = calcularEstadoMedicamento(data.cantidadDisponible, data.cantidadMinima);

  db.medicamentos[index] = {
    ...db.medicamentos[index],
    nombre: data.nombre.trim(),
    presentacion: data.presentacion.trim(),
    cantidadDisponible: data.cantidadDisponible,
    cantidadMinima: data.cantidadMinima,
    estado,
    updatedAt: new Date().toISOString(),
  };

  if (estado === 'Pocas unidades' || estado === 'Agotado') {
    db.alertas.push({
      id: db.alertas.length + 1,
      usuarioId: 1,
      medicamentoId: id,
      horaGenerada: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cantidadRestante: data.cantidadDisponible,
      estado: 'Pendiente',
      createdAt: new Date().toISOString(),
    });
  }

  guardarBaseDatos(db);
  return db.medicamentos[index];
}

export function eliminarMedicamentoLocal(id: number): boolean {
  const db = leerBaseDatos();
  const inicial = db.medicamentos.length;
  db.medicamentos = db.medicamentos.filter((m) => m.id !== id);
  db.alertas = db.alertas.filter((a) => a.medicamentoId !== id);
  db.tomas = db.tomas.filter((t) => t.medicamentoId !== id);

  guardarBaseDatos(db);
  return db.medicamentos.length < inicial;
}

// TRANSACCIÓN DE TOMA Y DESCUENTO DE STOCK
export function registrarTomaLocal(medicamentoId: number, dosis: number) {
  const db = leerBaseDatos();
  const med = db.medicamentos.find((m) => m.id === medicamentoId);

  if (!med) {
    throw new Error('Medicamento no encontrado');
  }

  const cantidadAnterior = med.cantidadDisponible;
  if (cantidadAnterior <= 0) {
    throw new Error(`No hay unidades de ${med.nombre} para descontar. El stock ya está en 0.`);
  }

  const cantidadRestante = Math.max(0, cantidadAnterior - dosis);
  const nuevoEstado = calcularEstadoMedicamento(cantidadRestante, med.cantidadMinima);
  const alertaMinimaDisparada = cantidadRestante <= med.cantidadMinima;

  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Actualizar stock
  med.cantidadDisponible = cantidadRestante;
  med.estado = nuevoEstado;
  med.updatedAt = ahora.toISOString();

  // Registrar toma
  const nuevaToma: LocalToma = {
    id: db.tomas.length + 1,
    usuarioId: 1,
    medicamentoId,
    horaConfirmacion: horaActual,
    cantidadTomada: dosis,
    createdAt: ahora.toISOString(),
  };
  db.tomas.push(nuevaToma);

  // Registrar alerta si aplica
  if (alertaMinimaDisparada) {
    db.alertas.push({
      id: db.alertas.length + 1,
      usuarioId: 1,
      medicamentoId,
      horaGenerada: horaActual,
      cantidadRestante,
      estado: 'Pendiente',
      createdAt: ahora.toISOString(),
    });
  }

  guardarBaseDatos(db);

  return {
    medicamentoId,
    nombre: med.nombre,
    presentacion: med.presentacion,
    cantidadAnterior,
    cantidadTomada: dosis,
    cantidadRestante,
    cantidadMinima: med.cantidadMinima,
    nuevoEstado,
    alertaMinimaDisparada,
    tomaId: nuevaToma.id,
    horaConfirmacion: horaActual,
  };
}

// REPORTES
export function obtenerReportesLocal(): LocalReporte[] {
  const db = leerBaseDatos();
  return db.reportes;
}

export function crearReporteLocal(totalMedicamentos: number, cantidadPorReponer: number): LocalReporte {
  const db = leerBaseDatos();
  const nuevoReporte: LocalReporte = {
    id: db.reportes.length + 1,
    usuarioId: 1,
    totalMedicamentos,
    cantidadPorReponer,
    fechaReporte: new Date().toISOString(),
  };
  db.reportes.push(nuevoReporte);
  guardarBaseDatos(db);
  return nuevoReporte;
}
