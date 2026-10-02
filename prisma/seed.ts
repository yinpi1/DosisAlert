import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed de DosisAlert ---');

  // Limpiar datos existentes de forma controlada
  await prisma.toma.deleteMany();
  await prisma.alertaReposicion.deleteMany();
  await prisma.recordatorio.deleteMany();
  await prisma.horarioToma.deleteMany();
  await prisma.reporte.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Crear Usuario de prueba
  const usuario = await prisma.usuario.create({
    data: {
      rut: '12.345.678-9',
      correo: 'paciente@dosisalert.cl',
      contrasena: 'password123',
      nombre: 'Juan Pérez González',
    },
  });

  console.log(`Usuario creado: ${usuario.nombre} (${usuario.rut})`);

  // 2. Crear Medicamentos con diversos estados para validar la lógica:
  // - Paracetamol: 20 disp, 5 min -> "Disponible"
  // - Losartán: 3 disp, 5 min -> "Pocas unidades"
  // - Omeprazol: 0 disp, 4 min -> "Agotado"
  // - Metformina: 14 disp, 6 min -> "Disponible"
  const med1 = await prisma.medicamento.create({
    data: {
      usuarioId: usuario.id,
      nombre: 'Paracetamol 500 mg',
      presentacion: 'Comprimidos',
      cantidadDisponible: 20,
      cantidadMinima: 5,
      estado: 'Disponible',
    },
  });

  const med2 = await prisma.medicamento.create({
    data: {
      usuarioId: usuario.id,
      nombre: 'Losartán 50 mg',
      presentacion: 'Comprimidos recubiertos',
      cantidadDisponible: 3,
      cantidadMinima: 5,
      estado: 'Pocas unidades',
    },
  });

  const med3 = await prisma.medicamento.create({
    data: {
      usuarioId: usuario.id,
      nombre: 'Omeprazol 20 mg',
      presentacion: 'Cápsulas',
      cantidadDisponible: 0,
      cantidadMinima: 4,
      estado: 'Agotado',
    },
  });

  const med4 = await prisma.medicamento.create({
    data: {
      usuarioId: usuario.id,
      nombre: 'Metformina 850 mg',
      presentacion: 'Comprimidos',
      cantidadDisponible: 14,
      cantidadMinima: 6,
      estado: 'Disponible',
    },
  });

  // 3. Crear Horarios de Toma
  const horario1 = await prisma.horarioToma.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med1.id,
      diasToma: 'Todos los días',
      hora: '08:00',
      dosis: 1,
      estado: 'Activo',
    },
  });

  const horario2 = await prisma.horarioToma.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med2.id,
      diasToma: 'Todos los días',
      hora: '09:00',
      dosis: 1,
      estado: 'Activo',
    },
  });

  // 4. Crear Recordatorios activos (ej. para la alarma)
  const hoy = new Date();
  await prisma.recordatorio.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med1.id,
      horarioTomaId: horario1.id,
      fechaProgramada: hoy,
      horaProgramada: '08:00',
      estado: 'Pendiente',
    },
  });

  await prisma.recordatorio.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med2.id,
      horarioTomaId: horario2.id,
      fechaProgramada: hoy,
      horaProgramada: '09:00',
      estado: 'Pendiente',
    },
  });

  // 5. Alerta de Reposición automática inicial para Losartán y Omeprazol
  await prisma.alertaReposicion.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med2.id,
      horaGenerada: '09:00',
      cantidadRestante: 3,
      estado: 'Pendiente',
    },
  });

  await prisma.alertaReposicion.create({
    data: {
      usuarioId: usuario.id,
      medicamentoId: med3.id,
      horaGenerada: '10:00',
      cantidadRestante: 0,
      estado: 'Pendiente',
    },
  });

  // 6. Reporte inicial de control
  await prisma.reporte.create({
    data: {
      usuarioId: usuario.id,
      totalMedicamentos: 4,
      cantidadPorReponer: 2,
    },
  });

  console.log('--- Seed completado exitosamente con 4 medicamentos, horarios, recordatorios y alertas ---');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
