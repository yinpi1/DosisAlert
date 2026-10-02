import net from 'net';
import prisma from './prisma';
import {
  obtenerMedicamentosLocal,
  obtenerMedicamentoPorIdLocal,
  crearMedicamentoLocal,
  actualizarMedicamentoLocal,
  eliminarMedicamentoLocal,
  registrarTomaLocal,
  obtenerReportesLocal,
  crearReporteLocal,
} from './local-db';
import { calcularEstadoMedicamento } from './medicamentos';
import { getOrCreateDefaultUser } from './user';

// Verificación ultra rápida (2ms) del puerto PostgreSQL para no bloquear la app ni emitir errores
let postgresDisponible: boolean | null = null;
let ultimaVerificacion = 0;

function verificarPuertoAbierto(port: number, host: string, timeout = 200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resuelto = false;

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      resuelto = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      if (!resuelto) {
        resuelto = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!resuelto) {
        resuelto = true;
        socket.destroy();
        resolve(false);
      }
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

async function verificarPostgres(): Promise<boolean> {
  const ahora = Date.now();
  // Cachear resultado por 30 segundos
  if (postgresDisponible !== null && ahora - ultimaVerificacion < 30000) {
    return postgresDisponible;
  }

  try {
    const dbUrl = process.env.DATABASE_URL || '';

    // Si es localhost, chequear el puerto primero
    if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      const puertoActivo = await verificarPuertoAbierto(5432, '127.0.0.1', 150);
      if (!puertoActivo) {
        postgresDisponible = false;
        ultimaVerificacion = ahora;
        return false;
      }
    }

    // Si el puerto está abierto o es una base de datos remota (como Neon), probar con Prisma
    await prisma.$queryRaw`SELECT 1`;
    postgresDisponible = true;
  } catch {
    postgresDisponible = false;
  }

  ultimaVerificacion = ahora;
  return postgresDisponible;
}

export const dbService = {
  async getMedicamentos() {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const user = await getOrCreateDefaultUser();
        const lista = await prisma.medicamento.findMany({
          where: { usuarioId: user.id },
          orderBy: { nombre: 'asc' },
        });
        return lista.map((m) => ({
          ...m,
          estado: calcularEstadoMedicamento(m.cantidadDisponible, m.cantidadMinima),
        }));
      } catch (e) {
        console.warn('Fallo en consulta PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return obtenerMedicamentosLocal();
  },

  async getMedicamentoById(id: number) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const med = await prisma.medicamento.findUnique({
          where: { id },
        });
        if (med) {
          return {
            ...med,
            estado: calcularEstadoMedicamento(med.cantidadDisponible, med.cantidadMinima),
          };
        }
      } catch (e) {
        console.warn('Fallo en consulta PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return obtenerMedicamentoPorIdLocal(id);
  },

  async createMedicamento(data: {
    nombre: string;
    presentacion: string;
    cantidadDisponible: number;
    cantidadMinima: number;
  }) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const user = await getOrCreateDefaultUser();
        const estado = calcularEstadoMedicamento(data.cantidadDisponible, data.cantidadMinima);
        const nuevo = await prisma.medicamento.create({
          data: {
            usuarioId: user.id,
            nombre: data.nombre.trim(),
            presentacion: data.presentacion.trim(),
            cantidadDisponible: data.cantidadDisponible,
            cantidadMinima: data.cantidadMinima,
            estado,
          },
        });
        return nuevo;
      } catch (e) {
        console.warn('Fallo al crear en PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return crearMedicamentoLocal(data);
  },

  async updateMedicamento(
    id: number,
    data: {
      nombre: string;
      presentacion: string;
      cantidadDisponible: number;
      cantidadMinima: number;
    }
  ) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const estado = calcularEstadoMedicamento(data.cantidadDisponible, data.cantidadMinima);
        const actualizado = await prisma.medicamento.update({
          where: { id },
          data: {
            nombre: data.nombre.trim(),
            presentacion: data.presentacion.trim(),
            cantidadDisponible: data.cantidadDisponible,
            cantidadMinima: data.cantidadMinima,
            estado,
          },
        });
        return actualizado;
      } catch (e) {
        console.warn('Fallo al actualizar en PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return actualizarMedicamentoLocal(id, data);
  },

  async deleteMedicamento(id: number) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        await prisma.medicamento.delete({
          where: { id },
        });
        return true;
      } catch (e) {
        console.warn('Fallo al eliminar en PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return eliminarMedicamentoLocal(id);
  },

  async registrarToma(medicamentoId: number, dosis: number) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const user = await getOrCreateDefaultUser();
        const med = await prisma.medicamento.findUnique({ where: { id: medicamentoId } });
        if (med) {
          const cantidadAnterior = med.cantidadDisponible;
          if (cantidadAnterior <= 0) {
            throw new Error(`No hay unidades de ${med.nombre} para descontar. El stock ya está en 0.`);
          }
          const cantidadRestante = Math.max(0, cantidadAnterior - dosis);
          const nuevoEstado = calcularEstadoMedicamento(cantidadRestante, med.cantidadMinima);
          const alertaMinimaDisparada = cantidadRestante <= med.cantidadMinima;

          const ahora = new Date();
          const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const [medActualizado, nuevaToma] = await prisma.$transaction([
            prisma.medicamento.update({
              where: { id: medicamentoId },
              data: {
                cantidadDisponible: cantidadRestante,
                estado: nuevoEstado,
              },
            }),
            prisma.toma.create({
              data: {
                usuarioId: user.id,
                medicamentoId,
                horaConfirmacion: horaActual,
                cantidadTomada: dosis,
              },
            }),
          ]);

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
      } catch (e) {
        console.warn('Fallo en toma en PostgreSQL, usando almacenamiento local:', e);
      }
    }
    return registrarTomaLocal(medicamentoId, dosis);
  },

  async getReportes() {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const user = await getOrCreateDefaultUser();
        return await prisma.reporte.findMany({
          where: { usuarioId: user.id },
          orderBy: { fechaReporte: 'desc' },
        });
      } catch (e) {
        console.warn('Fallo al obtener reportes en PostgreSQL, usando local:', e);
      }
    }
    return obtenerReportesLocal();
  },

  async createReporte(totalMedicamentos: number, cantidadPorReponer: number) {
    const hayPostgres = await verificarPostgres();
    if (hayPostgres) {
      try {
        const user = await getOrCreateDefaultUser();
        return await prisma.reporte.create({
          data: {
            usuarioId: user.id,
            totalMedicamentos,
            cantidadPorReponer,
          },
        });
      } catch (e) {
        console.warn('Fallo al guardar reporte en PostgreSQL, usando local:', e);
      }
    }
    return crearReporteLocal(totalMedicamentos, cantidadPorReponer);
  },
};
