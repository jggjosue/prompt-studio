import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  deleteComponent,
  duplicateComponent,
  insertComponent,
  moveComponent,
  moveComponentByOffset,
  resetComponentProperty,
  resetComponentStyle,
  resetComponentStyles,
  resetComponentToDefaults,
  reorderSection,
  updateComponentProperty,
  updateComponentStyle,
} from '../../src/lib/page-builder/editor-mutations.ts';
import { getPageComponentDefinition } from '../../src/components/page-builder/registry.tsx';
import { parseStructuredDraft, validateStyleDraft } from '../../src/lib/page-builder/inspector-controls.ts';
import { createEmptyPageSchema, type PageSchema, type StyleProperty } from '../../src/lib/page-builder/schema.ts';
import { createTemplatePageSchema } from '../../src/lib/page-builder/templates.ts';
import { validatePageSchema } from '../../src/lib/page-builder/validation.ts';

function success(result: ReturnType<typeof insertComponent>) {
  assert.ok(!('error' in result), 'la mutación debe producir un PageSchema válido');
  return result as Extract<typeof result, { schema: PageSchema }>;
}

function emptySchema() {
  return createEmptyPageSchema('Editor visual');
}

test('add: insertar desde la biblioteca crea una sección y un componente', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const result = success(insertComponent(initial, 'hero', { kind: 'new-section', pageId, index: 0 }));

  assert.equal(initial.pages[pageId].sectionIds.length, 0, 'la mutación no altera la entrada');
  assert.equal(result.schema.pages[pageId].sectionIds.length, 1);
  assert.equal(result.schema.components[result.componentId!].type, 'hero');
  assert.equal(validatePageSchema(result.schema).success, true);
});

test('move: un componente compatible puede moverse dentro de un contenedor', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const container = success(insertComponent(initial, 'container', { kind: 'new-section', pageId, index: 0 }));
  const sectionId = container.sectionId!;
  const heading = success(insertComponent(container.schema, 'heading', { kind: 'section', sectionId, index: 1 }));
  const moved = success(moveComponent(heading.schema, heading.componentId!, { kind: 'component', parentId: container.componentId!, index: 0 }));

  assert.deepEqual(moved.schema.sections[sectionId].componentIds, [container.componentId]);
  assert.deepEqual(moved.schema.components[container.componentId!].children, [heading.componentId]);
  assert.equal(validatePageSchema(moved.schema).success, true);
});

test('reorder: las secciones y los hermanos cambian de posición de forma determinista', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const first = success(insertComponent(initial, 'hero', { kind: 'new-section', pageId, index: 0 }));
  const second = success(insertComponent(first.schema, 'footer', { kind: 'new-section', pageId, index: 1 }));
  const reordered = success(reorderSection(second.schema, pageId, second.sectionId!, 0));
  assert.deepEqual(reordered.schema.pages[pageId].sectionIds, [second.sectionId, first.sectionId]);
  const restored = success(reorderSection(reordered.schema, pageId, second.sectionId!, 1));
  assert.deepEqual(restored.schema.pages[pageId].sectionIds, [first.sectionId, second.sectionId]);

  const sectionId = second.sectionId!;
  const text = success(insertComponent(restored.schema, 'text', { kind: 'section', sectionId, index: 1 }));
  const moved = success(moveComponentByOffset(text.schema, text.componentId!, -1));
  assert.deepEqual(moved.schema.sections[sectionId].componentIds, [text.componentId, second.componentId]);
});

test('add: puede insertar una sección entre dos secciones existentes', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const first = success(insertComponent(initial, 'navbar', { kind: 'new-section', pageId, index: 0 }));
  const last = success(insertComponent(first.schema, 'footer', { kind: 'new-section', pageId, index: 1 }));
  const middle = success(insertComponent(last.schema, 'hero', { kind: 'new-section', pageId, index: 1 }));

  assert.deepEqual(middle.schema.pages[pageId].sectionIds, [first.sectionId, middle.sectionId, last.sectionId]);
  assert.equal(middle.schema.components[middle.componentId!].type, 'hero');
  assert.equal(validatePageSchema(middle.schema).success, true);
});

test('duplicate: copia el subárbol con ids únicos y sin compartir datos mutables', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const root = success(insertComponent(initial, 'container', { kind: 'new-section', pageId, index: 0 }));
  const child = success(insertComponent(root.schema, 'container', { kind: 'component', parentId: root.componentId!, index: 0 }));
  const leaf = success(insertComponent(child.schema, 'heading', { kind: 'component', parentId: child.componentId!, index: 0 }));
  const duplicated = success(duplicateComponent(leaf.schema, root.componentId!));
  const copyId = duplicated.componentId!;
  const copyChildId = duplicated.schema.components[copyId].children[0];
  const copyLeafId = duplicated.schema.components[copyChildId].children[0];

  assert.notEqual(copyId, root.componentId);
  assert.notEqual(copyChildId, child.componentId);
  assert.notEqual(copyLeafId, leaf.componentId);
  assert.equal(new Set(Object.keys(duplicated.schema.components)).size, Object.keys(duplicated.schema.components).length);
  (duplicated.schema.components[copyLeafId].props as { text: string }).text = 'Copia editada';
  assert.notEqual((duplicated.schema.components[leaf.componentId!].props as { text: string }).text, 'Copia editada');
  assert.equal(validatePageSchema(duplicated.schema).success, true);
});

test('delete: elimina el componente, sus descendientes y la referencia del padre', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const root = success(insertComponent(initial, 'container', { kind: 'new-section', pageId, index: 0 }));
  const child = success(insertComponent(root.schema, 'heading', { kind: 'component', parentId: root.componentId!, index: 0 }));
  const deleted = success(deleteComponent(child.schema, root.componentId!));

  assert.deepEqual(deleted.schema.sections[root.sectionId!].componentIds, []);
  assert.equal(deleted.schema.components[root.componentId!], undefined);
  assert.equal(deleted.schema.components[child.componentId!], undefined);
  assert.equal(validatePageSchema(deleted.schema).success, true);
});

test('invalid nesting: rechaza hijos incompatibles y ciclos sin modificar el schema', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const heading = success(insertComponent(initial, 'heading', { kind: 'new-section', pageId, index: 0 }));
  const invalid = insertComponent(heading.schema, 'button', { kind: 'component', parentId: heading.componentId!, index: 0 });
  assert.deepEqual(invalid, { error: 'invalid-nesting' });

  const outer = success(insertComponent(initial, 'container', { kind: 'new-section', pageId, index: 0 }));
  const inner = success(insertComponent(outer.schema, 'container', { kind: 'component', parentId: outer.componentId!, index: 0 }));
  const cycle = moveComponent(inner.schema, outer.componentId!, { kind: 'component', parentId: inner.componentId!, index: 0 });
  assert.deepEqual(cycle, { error: 'cycle' });
  assert.equal(validatePageSchema(inner.schema).success, true);
});

test('las plantillas del selector producen PageSchema renderizable', () => {
  const schema = createTemplatePageSchema({ id: 'saas-launch', name: 'SaaS', category: 'SaaS', description: 'Una página de lanzamiento.' });
  assert.equal(validatePageSchema(schema).success, true);
  assert.ok(schema.pages[schema.site.defaultPageId].sectionIds.length >= 5);
});

test('el canvas usa dnd-kit, sensor de teclado y solo confirma cambios al terminar el drag', async () => {
  const source = await readFile(new URL('../../src/components/page-builder/editor/page-builder-workspace.tsx', import.meta.url), 'utf8');
  assert.match(source, /from '@dnd-kit\/core'/);
  assert.match(source, /useSensor\(KeyboardSensor/);
  assert.match(source, /onDragEnd=\{handleDragEnd\}/);
  assert.match(source, /themeStyle\(schema\.site\.theme\)/);
  assert.doesNotMatch(source, /setSchema\([^\n]*handleDragOver/);
  assert.doesNotMatch(source, /fetch\(|Mongo|mongoose/);
});

test('el editor expone biblioteca, toolbar, canvas, inspector y estados visuales de drag', async () => {
  const workspace = await readFile(new URL('../../src/components/page-builder/editor/page-builder-workspace.tsx', import.meta.url), 'utf8');
  const inspector = await readFile(new URL('../../src/components/page-builder/editor/properties-inspector.tsx', import.meta.url), 'utf8');

  assert.match(workspace, /function BuilderToolbar/);
  assert.match(workspace, /aria-label="Biblioteca de componentes"/);
  assert.match(workspace, /aria-label="Canvas del sitio"/);
  assert.match(workspace, /<PropertiesInspector/);
  assert.match(workspace, /<DragOverlay/);
  assert.match(workspace, /Destino no permitido/);
  assert.match(workspace, /data-empty-canvas/);
  assert.match(workspace, /outline-violet-500/);
  assert.match(inspector, /Propiedades/);
});

test('el inspector actualiza props válidas, rechaza URLs inseguras y restaura defaults', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const button = success(insertComponent(initial, 'button', { kind: 'new-section', pageId, index: 0 }));
  const updated = success(updateComponentProperty(button.schema, button.componentId!, 'label', 'Comprar ahora'));
  assert.equal((updated.schema.components[button.componentId!].props as { label: string }).label, 'Comprar ahora');
  assert.deepEqual(updateComponentProperty(updated.schema, button.componentId!, 'href', 'javascript:alert(1)'), { error: 'props-invalid' });
  assert.deepEqual(updateComponentProperty(updated.schema, button.componentId!, 'unknown', 'x'), { error: 'property-missing' });
  const reset = success(resetComponentProperty(updated.schema, button.componentId!, 'label'));
  assert.equal((reset.schema.components[button.componentId!].props as { label: string }).label, getPageComponentDefinition('button').defaultProps.label);
});

test('el inspector rechaza URLs inseguras dentro de imágenes, galerías y objetos estructurados', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const gallery = success(insertComponent(initial, 'gallery', { kind: 'new-section', pageId, index: 0 }));
  const invalidGallery = updateComponentProperty(gallery.schema, gallery.componentId!, 'images', [{ src: 'javascript:alert(1)', alt: 'No segura' }]);
  assert.deepEqual(invalidGallery, { error: 'props-invalid' });

  const cta = success(insertComponent(gallery.schema, 'cta', { kind: 'new-section', pageId, index: 1 }));
  const invalidAction = updateComponentProperty(cta.schema, cta.componentId!, 'primaryAction', { label: 'Abrir', href: 'javascript:alert(1)' });
  assert.deepEqual(invalidAction, { error: 'props-invalid' });

  const safeAction = success(updateComponentProperty(cta.schema, cta.componentId!, 'primaryAction', { label: 'Abrir', href: '/contacto' }));
  assert.equal((safeAction.schema.components[cta.componentId!].props as { primaryAction: { href: string } }).primaryAction.href, '/contacto');
});

test('los estilos base y responsive se validan, aplican y pueden restablecerse', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const hero = success(insertComponent(initial, 'hero', { kind: 'new-section', pageId, index: 0 }));
  const base = success(updateComponentStyle(hero.schema, hero.componentId!, 'padding', 'token:spacing.lg'));
  assert.equal(base.schema.components[hero.componentId!].styles.padding, 'token:spacing.lg');
  const mobile = success(updateComponentStyle(base.schema, hero.componentId!, 'padding', '20px', 'mobile'));
  assert.equal(mobile.schema.components[hero.componentId!].responsive.mobile?.padding, '20px');
  assert.deepEqual(updateComponentStyle(mobile.schema, hero.componentId!, 'padding', 'token:spacing.unknown'), { error: 'theme-token-missing' });
  assert.deepEqual(updateComponentStyle(mobile.schema, hero.componentId!, 'display', 'banana'), { error: 'style-value-invalid' });
  assert.deepEqual(updateComponentStyle(mobile.schema, hero.componentId!, 'opacity', 2), { error: 'style-value-invalid' });
  assert.deepEqual(updateComponentStyle(mobile.schema, hero.componentId!, 'overflow', 'hidden'), { error: 'style-not-allowed' });
  const resetMobile = success(resetComponentStyle(mobile.schema, hero.componentId!, 'padding', 'mobile'));
  assert.equal(resetMobile.schema.components[hero.componentId!].responsive.mobile?.padding, undefined);
  const resetAll = success(resetComponentStyles(resetMobile.schema, hero.componentId!));
  assert.deepEqual(resetAll.schema.components[hero.componentId!].styles, getPageComponentDefinition('hero').defaultStyles);
  assert.deepEqual(resetAll.schema.components[hero.componentId!].responsive, {});
});

test('restaurar componente conserva children y recupera props y estilos del registro', () => {
  const initial = emptySchema();
  const pageId = initial.site.defaultPageId;
  const container = success(insertComponent(initial, 'container', { kind: 'new-section', pageId, index: 0 }));
  const child = success(insertComponent(container.schema, 'text', { kind: 'component', parentId: container.componentId!, index: 0 }));
  const changedProps = success(updateComponentProperty(child.schema, container.componentId!, 'maxWidth', '720px'));
  const changedStyles = success(updateComponentStyle(changedProps.schema, container.componentId!, 'background', '#111827'));
  const reset = success(resetComponentToDefaults(changedStyles.schema, container.componentId!));
  assert.deepEqual(reset.schema.components[container.componentId!].props, getPageComponentDefinition('container').defaultProps);
  assert.deepEqual(reset.schema.components[container.componentId!].styles, getPageComponentDefinition('container').defaultStyles);
  assert.deepEqual(reset.schema.components[container.componentId!].children, [child.componentId]);
});

test('la validación del inspector cubre opacidad, tokens y JSON estructurado', () => {
  const theme = emptySchema().site.theme;
  assert.deepEqual(validateStyleDraft('opacity', '0.65', theme), { success: true, value: 0.65 });
  assert.equal(validateStyleDraft('opacity', '2', theme).success, false);
  assert.deepEqual(validateStyleDraft('color', 'token:colors.primary', theme), { success: true, value: 'token:colors.primary' });
  assert.equal(validateStyleDraft('color', 'token:colors.missing', theme).success, false);
  assert.deepEqual(parseStructuredDraft('[{"label":"Inicio","href":"/"}]'), { success: true, value: [{ label: 'Inicio', href: '/' }] });
  assert.equal(parseStructuredDraft('{').success, false);
  assert.equal(validateStyleDraft('display', 'banana', theme).success, false);
});

test('el inspector se genera desde ComponentRegistry sin switches por tipo', async () => {
  const source = await readFile(new URL('../../src/components/page-builder/editor/properties-inspector.tsx', import.meta.url), 'utf8');
  assert.match(source, /definition\?\.editableProperties/);
  assert.match(source, /definition\.styleControls/);
  assert.doesNotMatch(source, /switch\s*\(\s*node\.type/);
  for (const property of ['background', 'width', 'height', 'padding', 'margin', 'gap', 'alignItems', 'display', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'color', 'border', 'borderRadius', 'boxShadow', 'opacity']) {
    assert.ok(getPageComponentDefinition('hero').styleControls.includes(property as StyleProperty), `falta el control ${property}`);
  }
});

test('/page-composer monta el Visual Builder como implementación única', async () => {
  const source = await readFile(new URL('../../src/app/[locale]/page-composer/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /VisualPageComposerClient/);
  assert.match(source, /loadSourcePageTemplates\(\)/);
  assert.match(source, /PageComposerPremiumGate/);
  assert.match(source, /return <VisualPageComposerClient canEdit templates=/);
  assert.doesNotMatch(source, /page-composer-client|hasLegacySeed|PageComposerSeed/);
});

test('Editar abre la página estática seleccionada y el canvas aplica sus viewports', async () => {
  const client = await readFile(new URL('../../src/app/[locale]/page-composer/page-composer-editor-client.tsx', import.meta.url), 'utf8');
  const workspace = await readFile(new URL('../../src/components/page-builder/editor/page-builder-workspace.tsx', import.meta.url), 'utf8');
  const catalog = await readFile(new URL('../../src/lib/page-builder/source-template-catalog.ts', import.meta.url), 'utf8');
  assert.match(client, /setEditing\(\{ template, showOriginal: !template\.blank \}\)/);
  assert.match(client, /\/webpages\/\$\{encodeURIComponent\(editing\.template\.preview\)\}\/index\.html/);
  assert.match(workspace, /Página original:/);
  assert.match(workspace, /width: VIEWPORTS\[breakpoint\]/);
  assert.match(workspace, /Editar por bloques/);
  assert.match(catalog, /project\.json/);
  assert.match(catalog, /mediaAssets/);
});
