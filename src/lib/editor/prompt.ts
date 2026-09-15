import { nodeLabel, type EditorDocument, type EditorNode } from '@/lib/editor/document';

function publicProps(node: EditorNode): Record<string, unknown> {
  return Object.fromEntries(Object.entries(node.props).filter(([key]) => !key.startsWith('__editor')));
}

function describeNode(document: EditorDocument, id: string, depth: number): string[] {
  const node = document.nodes[id];
  if (!node) return [];
  const indent = '  '.repeat(depth);
  const flags = [node.locked ? 'bloqueado' : '', node.hidden ? 'oculto' : ''].filter(Boolean);
  const lines = [`${indent}- ${nodeLabel(document, id)} [${node.type}]${flags.length ? ` (${flags.join(', ')})` : ''}`];
  const props = publicProps(node);
  if (Object.keys(props).length) lines.push(`${indent}  Contenido/propiedades: ${JSON.stringify(props)}`);
  for (const breakpoint of ['desktop', 'laptop', 'tablet', 'mobile'] as const) {
    const styles = node.styles[breakpoint];
    if (styles && Object.keys(styles).length) lines.push(`${indent}  Estilos ${breakpoint}: ${JSON.stringify(styles)}`);
  }
  for (const childId of node.children) lines.push(...describeNode(document, childId, depth + 1));
  return lines;
}

/** Convierte el documento editable real en un prompt reproducible y completo. */
export function buildEditorPrompt(document: EditorDocument, name: string, selectedIds: string[] = []): string {
  const roots = selectedIds.length
    ? selectedIds.filter(id => Boolean(document.nodes[id]))
    : document.nodes[document.rootId]?.children ?? [];
  const scope = selectedIds.length ? 'los componentes seleccionados' : 'la página completa';
  const tree = roots.flatMap(id => describeNode(document, id, 0));

  return [
    `Crea o actualiza ${scope} de “${name}” reproduciendo fielmente esta composición editable.`,
    '',
    'REQUISITOS GENERALES',
    '- Conserva la jerarquía, el orden, el contenido, las posiciones y las dimensiones descritas.',
    '- Respeta los estilos de desktop y todas las sobrescrituras de laptop, tablet y mobile.',
    '- Genera componentes funcionales, semánticos, accesibles y responsive.',
    '- Mantén estados interactivos, navegación, formularios y contenido multimedia cuando correspondan.',
    '- No sustituyas el diseño por una plantilla genérica ni inventes texto que ya esté especificado.',
    '- Devuelve código completo listo para producción.',
    '',
    'ESTRUCTURA DEL CANVAS',
    ...(tree.length ? tree : ['- Lienzo vacío: crea una estructura inicial editable.']),
  ].join('\n');
}
