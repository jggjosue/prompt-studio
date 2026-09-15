# ADR-002: Component Builder usa el editor visual como entrada principal

**Estado:** Accepted  
**Fecha:** 2026-09-10  
**Decisores:** Prompt Studio engineering

## Contexto

`/component-builder` combinaba tres experiencias en una misma pantalla: plantilla fija, composición de bloques y el editor estructurado. El editor —la única experiencia que soporta árbol, anidamiento, breakpoints, historial y persistencia— estaba oculto tras una tercera pestaña. La página también duplicaba estado visual que ya resuelve el documento del editor.

## Decisión

La ruta abre `component-builder-editor-client.tsx`, que reutiliza `EditorWorkspace`. No se añade una librería: `@dnd-kit`, el registro, el store por selectores, historial por comandos y autoguardado ya están disponibles. El configurador anterior se conserva aislado mientras se migra cualquier flujo de prompt/exportación que siga dependiendo de él.

## Alternativas

| Opción | Evaluación |
|---|---|
| Mantener las tres pestañas | Baja migración, pero oculta la experiencia correcta y duplica el modelo de estado. |
| Reescribir Component Builder | Alto riesgo y duplicación del editor existente. |
| Promover `EditorWorkspace` | Reutiliza arquitectura probada, reduce bundle y mantiene la ruta editable. |

## Consecuencias

- La biblioteca, canvas, capas, propiedades, zoom, preview, shortcuts y autosave son la interfaz principal.
- Nuevos tipos se añaden mediante `registry.ts`, no con ramas en la página.
- Siguiente fase: bloques preconstruidos como composiciones serializables del mismo árbol, no como un sistema paralelo.
