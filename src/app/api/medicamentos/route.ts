import { NextResponse } from 'next/server';
import { dbService } from '@/lib/repository';

// GET /api/medicamentos - Listar medicamentos
export async function GET() {
  try {
    const medicamentos = await dbService.getMedicamentos();
    return NextResponse.json({
      success: true,
      data: medicamentos,
    });
  } catch (error: unknown) {
    console.error('Error al obtener medicamentos:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}

// POST /api/medicamentos - Registrar medicamento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, presentacion, cantidadDisponible, cantidadMinima } = body;

    if (!nombre || !presentacion) {
      return NextResponse.json(
        { success: false, error: 'El nombre y la presentación son obligatorios.' },
        { status: 400 }
      );
    }

    const cantDisp = parseInt(cantidadDisponible, 10);
    const cantMin = parseInt(cantidadMinima, 10);

    if (isNaN(cantDisp) || cantDisp < 0 || isNaN(cantMin) || cantMin < 0) {
      return NextResponse.json(
        { success: false, error: 'Las cantidades deben ser números válidos mayores o iguales a 0.' },
        { status: 400 }
      );
    }

    const nuevoMedicamento = await dbService.createMedicamento({
      nombre,
      presentacion,
      cantidadDisponible: cantDisp,
      cantidadMinima: cantMin,
    });

    return NextResponse.json(
      {
        success: true,
        data: nuevoMedicamento,
        message: 'Medicamento guardado con éxito.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error al crear medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error al guardar';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}
