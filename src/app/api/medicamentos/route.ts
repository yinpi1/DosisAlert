import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateDefaultUser } from '@/lib/user';
import { calcularEstadoMedicamento } from '@/lib/medicamentos';

// GET /api/medicamentos - Listar todos los medicamentos
export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();

    const medicamentos = await prisma.medicamento.findMany({
      where: { usuarioId: user.id },
      orderBy: { nombre: 'asc' },
    });

    // Aseguramos que el estado siempre cumpla la regla de negocio
    const actualizados = medicamentos.map((med) => ({
      ...med,
      estado: calcularEstadoMedicamento(med.cantidadDisponible, med.cantidadMinima),
    }));

    return NextResponse.json({
      success: true,
      data: actualizados,
    });
  } catch (error: unknown) {
    console.error('Error al obtener medicamentos:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido al conectar con la base de datos PostgreSQL.';
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo conectar a la base de datos PostgreSQL local.',
        details: mensaje,
      },
      { status: 500 }
    );
  }
}

// POST /api/medicamentos - Registrar nuevo medicamento
export async function POST(request: Request) {
  try {
    const user = await getOrCreateDefaultUser();
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

    if (isNaN(cantDisp) || cantDisp < 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad disponible debe ser un número mayor o igual a 0.' },
        { status: 400 }
      );
    }

    if (isNaN(cantMin) || cantMin < 0) {
      return NextResponse.json(
        { success: false, error: 'La cantidad mínima de alerta debe ser un número mayor o igual a 0.' },
        { status: 400 }
      );
    }

    // Regla de Negocio Crítica: El estado se calcula automáticamente, no lo ingresa el usuario
    const estado = calcularEstadoMedicamento(cantDisp, cantMin);

    const nuevoMedicamento = await prisma.medicamento.create({
      data: {
        usuarioId: user.id,
        nombre: nombre.trim(),
        presentacion: presentacion.trim(),
        cantidadDisponible: cantDisp,
        cantidadMinima: cantMin,
        estado: estado,
      },
    });

    // Si el estado es "Pocas unidades" o "Agotado", generar automáticamente la alerta de reposición
    if (estado === 'Pocas unidades' || estado === 'Agotado') {
      const ahora = new Date();
      const horaStr = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await prisma.alertaReposicion.create({
        data: {
          usuarioId: user.id,
          medicamentoId: nuevoMedicamento.id,
          horaGenerada: horaStr,
          cantidadRestante: cantDisp,
          estado: 'Pendiente',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: nuevoMedicamento,
        message: 'Medicamento registrado exitosamente.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error al crear medicamento:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      {
        success: false,
        error: 'Error al registrar el medicamento en PostgreSQL.',
        details: mensaje,
      },
      { status: 500 }
    );
  }
}
