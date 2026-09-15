# ADR-003: Page Composer crea copias editables de plantillas

**Estado:** Accepted  
**Fecha:** 2026-09-10  
**Decisores:** Prompt Studio engineering

## Contexto

El editor ya tenía un `EditorDocument` normalizado, historial y autoguardado, pero `/page-composer` abría directamente un documento genérico. No había un paso visible para seleccionar una página de ventas ni un límite claro entre una plantilla y la página editable del usuario.

## Decisión

La ruta abre una galería de plantillas y genera un documento nuevo al elegir una. La plantilla es un descriptor inmutable; `templateDocument` crea IDs nuevos y un árbol serializable para el `EditorWorkspace`. El autoguardado usa la API de proyectos existente, que valida cuenta y plan en backend, por lo que el frontend no es la única barrera.

| Opción | Resultado |
|---|---|
| Editar archivos de la landing original | Riesgo de modificar el catálogo y no hay historial editable. |
| Guardar HTML clonado | No permite edición estructurada, responsive ni comandos seguros. |
| Clonar a `EditorDocument` | Reutiliza canvas, registro, historial, migración y autosave. |

## Consecuencias

- Free puede explorar y abrir previews; Premium crea y persiste copias.
- El flujo actual soporta borrador persistente. Publicación pública, SEO y My Pages requieren extender `EditorProject` con slug/status/templateId y un renderizador público antes de habilitarse.
- No se introduce una segunda implementación de drag & drop o estado.
