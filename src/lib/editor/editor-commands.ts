/**
 * Comandos del editor y su historial.
 *
 * Cada gesto del usuario se representa como un comando con tipo, descripción y
 * las instantáneas antes/después del documento. El historial guarda comandos (no
 * parcheos sueltos): deshacer vuelve a `before`, rehacer avanza a `after`. Así el
 * undo/redo es robusto contra pérdida de datos y a la vez queda un registro
 * legible de qué cambió, útil para el guardado y para auditoría.
 */

import type { SiteSchema } from './page-schema';

/** Taxonomía de cambios del editor. */
export type CommandType =
  | 'ADD_COMPONENT'
  | 'REMOVE_COMPONENT'
  | 'MOVE_COMPONENT'
  | 'UPDATE_PROPS'
  | 'UPDATE_STYLES'
  | 'DUPLICATE_COMPONENT'
  | 'UPDATE_PAGE_SETTINGS';

export type EditorCommand = {
  type: CommandType;
  /** Texto corto para el historial y la auditoría. */
  description: string;
  before: SiteSchema;
  after: SiteSchema;
};

export function makeCommand(
  type: CommandType,
  description: string,
  before: SiteSchema,
  after: SiteSchema
): EditorCommand {
  return { type, description, before, after };
}

/** Pila de comandos con límite; rehacer se descarta al aplicar un comando nuevo. */
export class EditorHistory {
  private past: EditorCommand[] = [];
  private future: EditorCommand[] = [];

  constructor(private readonly limit = 50) {}

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  get undoCount(): number {
    return this.past.length;
  }

  get redoCount(): number {
    return this.future.length;
  }

  /** Registra un comando aplicado y descarta la rama de rehacer. */
  push(command: EditorCommand): void {
    this.past.push(command);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  /** Devuelve el comando a deshacer; el llamador aplica `before`. */
  undo(): EditorCommand | null {
    const command = this.past.pop() ?? null;
    if (command) this.future.push(command);
    return command;
  }

  /** Devuelve el comando a rehacer; el llamador aplica `after`. */
  redo(): EditorCommand | null {
    const command = this.future.pop() ?? null;
    if (command) this.past.push(command);
    return command;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}