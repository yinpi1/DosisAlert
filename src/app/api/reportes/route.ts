import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';

// GET /api/reportes - Obtener historial de reportes
export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const reportes = await prisma.reporte.findMany({
      where: { usuarioId: user.id },
      orderBy: { fechaReporte: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, data: reportes });
  } catch (error: unknown) {
    console.error('Error al obtener reportes:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}

// POST /api/reportes - Crear nuevo reporte de auditoría
export async function POST(request: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await request.json();
    const { totalMedicamentos, cantidadPorReponer } = body;

    const reporte = await prisma.reporte.create({
      data: {
        usuarioId: user.id,
        totalMedicamentos: Number(totalMedicamentos) || 0,
        cantidadPorReponer: Number(cantidadPorReponer) || 0,
      },
    });

    return NextResponse.json({ success: true, data: reporte }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error al guardar reporte:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: mensaje }, { status: 500 });
  }
}
