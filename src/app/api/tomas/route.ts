import { NextResponse } from 'next/server';
import { dbService } from '@/lib/repository';

// POST /api/tomas - Registrar toma y descontar stock
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { medicamentoId, dosis = 1 } = body;

    const medId = parseInt(medicamentoId, 10);
    const dosisNum = Math.max(1, parseInt(dosis, 10) || 1);

    if (isNaN(medId)) {
      return NextResponse.json({ success: false, error: 'ID de medicamento inválido' }, { status: 400 });
    }

    const resultado = await dbService.registrarToma(medId, dosisNum);

    return NextResponse.json({
      success: true,
      message: 'Toma confirmada exitosamente.',
      data: resultado,
    });
  } catch (error: unknown) {
    console.error('Error al registrar toma:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 400 });
  }
}
