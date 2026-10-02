import { NextResponse } from 'next/server';
import { dbService } from '@/lib/repository';

// GET /api/reportes
export async function GET() {
  try {
    const reportes = await dbService.getReportes();
    return NextResponse.json({ success: true, data: reportes });
  } catch (error: unknown) {
    console.error('Error al obtener reportes:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}

// POST /api/reportes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalMedicamentos, cantidadPorReponer } = body;

    const reporte = await dbService.createReporte(
      Number(totalMedicamentos) || 0,
      Number(cantidadPorReponer) || 0
    );

    return NextResponse.json({ success: true, data: reporte }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al guardar reporte:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}
