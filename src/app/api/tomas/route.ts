import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calcularEstadoMedicamento } from '@/lib/medicamentos';

// POST /api/tomas - Transacción crítica: Registrar toma y descontar stock en PostgreSQL
export async function POST(request: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await request.json();
    const { medicamentoId, dosis = 1, recordatorioId } = body;

    const medId = parseInt(medicamentoId, 10);
    const dosisNum = Math.max(1, parseInt(dosis, 10) || 1);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID de medicamento inválido' }, { status: 400 });
    }

    // Buscar medicamento en PostgreSQL
    const med = await prisma.medicamento.findUnique({
      where: { id: medId },
    });

    if (!med) {
      return NextResponse.json({ success: false, error: 'Medicamento no encontrado' }, { status: 404 });
    }

    const cantidadAnterior = med.cantidadDisponible;

    if (cantidadAnterior <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No hay unidades disponibles de ${med.nombre} para descontar. El stock ya está en 0.` 
        }, 
        { status: 400 }
      );
    }

    // Descontar la dosis del stock
    const cantidadRestante = Math.max(0, cantidadAnterior - dosisNum);
    const nuevoEstado = calcularEstadoMedicamento(cantidadRestante, med.cantidadMinima);
    const alertaMinimaDisparada = cantidadRestante <= med.cantidadMinima;

    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Transacción atómica en PostgreSQL: Actualizar stock + Registrar toma
    const [medActualizado, nuevaToma] = await prisma.$transaction([
      prisma.medicamento.update({
        where: { id: medId },
        data: {
          cantidadDisponible: cantidadRestante,
          estado: nuevoEstado,
        },
      }),
      prisma.toma.create({
        data: {
          usuarioId: user.id,
          medicamentoId: medId,
          recordatorioId: recordatorioId ? parseInt(recordatorioId, 10) : null,
          horaConfirmacion: horaActual,
          cantidadTomada: dosisNum,
        },
      }),
    ]);

    // Si cae a nivel de alerta mínima o agotado, crear registro de AlertaReposición
    if (alertaMinimaDisparada) {
      await prisma.alertaReposicion.create({
        data: {
          usuarioId: user.id,
          medicamentoId: medId,
          horaGenerada: horaActual,
          cantidadRestante: cantidadRestante,
          estado: 'Pendiente',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Toma confirmada exitosamente.',
      data: {
        medicamentoId: medId,
        nombre: med.nombre,
        presentacion: med.presentacion,
        cantidadAnterior,
        cantidadTomada: dosisNum,
        cantidadRestante,
        cantidadMinima: med.cantidadMinima,
        nuevoEstado,
        alertaMinimaDisparada,
        tomaId: nuevaToma.id,
        horaConfirmacion: horaActual,
      },
    });
  } catch (error: unknown) {
    console.error('Error al registrar toma en PostgreSQL:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}
