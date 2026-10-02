import { NextResponse } from 'next/server';
import { dbService } from '@/lib/repository';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/medicamentos/[id]
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medId = parseInt(id, 10);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const medicamento = await dbService.getMedicamentoById(medId);

    if (!medicamento) {
      return NextResponse.json({ success: false, error: 'Medicamento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: medicamento,
    });
  } catch (error: unknown) {
    console.error('Error al obtener medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}

// PUT /api/medicamentos/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
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

    const medicamentoActualizado = await dbService.updateMedicamento(medId, {
      nombre,
      presentacion,
      cantidadDisponible: cantDisp,
      cantidadMinima: cantMin,
    });

    if (!medicamentoActualizado) {
      return NextResponse.json({ success: false, error: 'No se encontró el medicamento a actualizar' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: medicamentoActualizado,
      message: 'Medicamento actualizado con éxito.',
    });
  } catch (error: unknown) {
    console.error('Error al actualizar medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}

// DELETE /api/medicamentos/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const medId = parseInt(id, 10);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const eliminado = await dbService.deleteMedicamento(medId);

    return NextResponse.json({
      success: true,
      eliminado,
      message: 'Medicamento eliminado correctamente.',
    });
  } catch (error: unknown) {
    console.error('Error al eliminar medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error al eliminar';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}
