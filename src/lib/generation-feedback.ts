/**
 * Motivos de una valoración negativa.
 *
 * Vive aquí y no en `src/models/AIGenerationFeedback.ts` porque lo necesitan
 * los dos lados: el esquema de Mongo para el `enum`, y el componente de
 * interfaz para pintar los botones. Importar la lista desde el modelo metería
 * mongoose en el bundle del navegador —un import de valor no se borra al
 * compilar, a diferencia de uno de tipo—.
 *
 * Módulo sin dependencias a propósito: cualquier import añadido aquí viajará
 * también al cliente.
 */

export type FeedbackReason =
  | 'no-sigue-el-prompt'
  | 'baja-calidad'
  | 'incorrecto'
  | 'lento'
  | 'otro';

export const FEEDBACK_REASONS: readonly FeedbackReason[] = [
  'no-sigue-el-prompt',
  'baja-calidad',
  'incorrecto',
  'lento',
  'otro',
];

export function isFeedbackReason(value: unknown): value is FeedbackReason {
  return typeof value === 'string' && (FEEDBACK_REASONS as readonly string[]).includes(value);
}

/** Etiquetas visibles, en el idioma del panel de generaciones. */
export const FEEDBACK_REASON_LABEL: Record<FeedbackReason, string> = {
  'no-sigue-el-prompt': 'No sigue el prompt',
  'baja-calidad': 'Baja calidad',
  incorrecto: 'Resultado incorrecto',
  lento: 'Demasiado lento',
  otro: 'Otro motivo',
};
