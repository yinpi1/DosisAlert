import prisma from './prisma';

/**
 * Obtiene o crea el usuario principal del sistema para el MVP.
 * Garantiza que siempre exista una referencia válida de foreign key en PostgreSQL.
 */
export async function getOrCreateDefaultUser() {
  try {
    let user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { rut: '12.345.678-9' },
          { correo: 'paciente@dosisalert.cl' },
        ],
      },
    });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          rut: '12.345.678-9',
          correo: 'paciente@dosisalert.cl',
          contrasena: 'password123',
          nombre: 'Juan Pérez González',
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Error al obtener o crear usuario por defecto:', error);
    throw error;
  }
}
