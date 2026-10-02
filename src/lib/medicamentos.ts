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
 * Retorna las etiquetas y colores visuales pensados para una lectura clara y humana
 */
export function obtenerBadgeEstado(estado: string) {
  switch (estado) {
    case 'Disponible':
      return {
        texto: 'Tienes suficientes',
        textoCorto: 'Disponible',
        colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dotColor: 'bg-emerald-600',
        icono: '🟢',
      };
    case 'Pocas unidades':
      return {
        texto: 'Quedan pocas pastillas',
        textoCorto: 'Pocas unidades',
        colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
        dotColor: 'bg-amber-500',
        icono: '🟡',
      };
    case 'Agotado':
      return {
        texto: 'Se terminaron',
        textoCorto: 'Agotado',
        colorBadge: 'bg-rose-100 text-rose-900 border-rose-300',
        dotColor: 'bg-rose-600',
        icono: '🔴',
      };
    default:
      return {
        texto: estado,
        textoCorto: estado,
        colorBadge: 'bg-slate-100 text-slate-800 border-slate-300',
        dotColor: 'bg-slate-500',
        icono: '⚪',
      };
  }
}
