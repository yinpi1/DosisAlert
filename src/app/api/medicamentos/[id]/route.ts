import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calcularEstadoMedicamento } from '@/lib/medicamentos';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/medicamentos/[id] - Obtener un medicamento específico
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medId = parseInt(id, 10);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const medicamento = await prisma.medicamento.findUnique({
      where: { id: medId },
      include: {
        horariosToma: true,
        alertasReposicion: {
          orderBy: { fechaGenerada: 'desc' },
          take: 5,
        },
      },
    });

    if (!medicamento) {
      return NextResponse.json({ success: false, error: 'Medicamento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...medicamento,
        estado: calcularEstadoMedicamento(medicamento.cantidadDisponible, medicamento.cantidadMinima),
      },
    });
  } catch (error: unknown) {
    console.error('Error al obtener medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: 'Error al consultar la base de datos.', details: mensaje },
      { status: 500 }
    );
  }
}

// PUT /api/medicamentos/[id] - Actualizar medicamento
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getOrCreateDefaultUser();
    const { id } = await params;
    const medId = parseInt(id, 10);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, presentacion, cantidadDisponible, cantidadMinima } = body;

    const cantDisp = parseInt(cantidadDisponible, 10);
    const cantMin = parseInt(cantidadMinima, 10);

    if (!nombre || !presentacion || isNaN(cantDisp) || isNaN(cantMin)) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos y deben ser válidos.' },
        { status: 400 }
      );
    }

    // Regla de Negocio Crítica: Se recalcula automáticamente el estado
    const nuevoEstado = calcularEstadoMedicamento(cantDisp, cantMin);

    const medicamentoActualizado = await prisma.medicamento.update({
      where: { id: medId },
      data: {
        nombre: nombre.trim(),
        presentacion: presentacion.trim(),
        cantidadDisponible: cantDisp,
        cantidadMinima: cantMin,
        estado: nuevoEstado,
      },
    });

    // Si cambió a estado de alerta, registrarla
    if (nuevoEstado === 'Pocas unidades' || nuevoEstado === 'Agotado') {
      const ahora = new Date();
      await prisma.alertaReposicion.create({
        data: {
          usuarioId: user.id,
          medicamentoId: medId,
          horaGenerada: ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cantidadRestante: cantDisp,
          estado: 'Pendiente',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: medicamentoActualizado,
      message: 'Medicamento actualizado con éxito.',
    });
  } catch (error: unknown) {
    console.error('Error al actualizar medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: 'Error al actualizar medicamento en PostgreSQL.', details: mensaje },
      { status: 500 }
    );
  }
}

// DELETE /api/medicamentos/[id] - Eliminar medicamento
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medId = parseInt(id, 10);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    await prisma.medicamento.delete({
      where: { id: medId },
    });

    return NextResponse.json({
      success: true,
      message: 'Medicamento eliminado correctamente.',
    });
  } catch (error: unknown) {
    console.error('Error al eliminar medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: 'Error al eliminar medicamento en PostgreSQL.', details: mensaje },
      { status: 500 }
    );
  }
}
