export type EstadoMedicamento = 'Disponible' | 'Pocas unidades' | 'Agotado';

/**
 * Lógica Crítica de Negocio para el estado del medicamento:
 * - Si Disponibles > Mínima: "Disponible"
 * - Si Disponibles <= Mínima y > 0: "Pocas unidades"
 * - Si Disponibles == 0 (o menor): "Agotado"
 */
export function calcularEstadoMedicamento(
  cantidadDisponible: number,
  cantidadMinima: number
): EstadoMedicamento {
  if (cantidadDisponible <= 0) {
    return 'Agotado';
  }
  if (cantidadDisponible <= cantidadMinima) {
    return 'Pocas unidades';
  }
  return 'Disponible';
}

/**
 * Retorna las clases de Tailwind y estilos visuales según el estado
 */
export function obtenerBadgeEstado(estado: string) {
  switch (estado) {
    case 'Disponible':
      return {
        texto: 'Disponible',
        colorBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotColor: 'bg-emerald-500',
      };
    case 'Pocas unidades':
      return {
        texto: 'Pocas unidades',
        colorBadge: 'bg-amber-100 text-amber-800 border-amber-300',
        dotColor: 'bg-amber-500',
      };
    case 'Agotado':
      return {
        texto: 'Agotado',
        colorBadge: 'bg-rose-100 text-rose-800 border-rose-300',
        dotColor: 'bg-rose-500',
      };
    default:
      return {
        texto: estado,
        colorBadge: 'bg-slate-100 text-slate-800 border-slate-300',
        dotColor: 'bg-slate-500',
      };
  }
}
