# ADR-002: PageSchema y runtime seguro del Visual Website Builder

**Estado:** Accepted  
**Fecha:** 2026-09-29  
**Ruta de producto:** `/page-composer`

## Contexto comprobado

Prompt Studio usa Next.js 15.5 con App Router localizado bajo `src/app/[locale]`, React 19 y TypeScript estricto. Clerk protege páginas y APIs; Mongoose persiste en MongoDB. El editor existente usa un documento normalizado (`EditorDocument`), historial por comandos y autosave a `src/app/api/editor/projects/route.ts`. Esa API valida sesión, plan o compra, rate limit, ownership y un máximo de nodos antes de guardar `EditorProject`.

El catálogo web existente vive en `src/lib/web-pages.ts` y los flujos de generación en `src/app/[locale]/generate-webs` y `src/ai`. Los assets publicados pueden resolverse desde Cloudflare R2 por el cliente S3 de `src/lib/r2-storage.ts`. Los costes de IA se calculan en servidor a partir de una lista permitida de proveedor/modelo en `src/lib/ai-credit-config.ts`; PageSchema no cobra créditos ni acopla el renderer a un proveedor.

El repositorio ya tenía componentes, plantillas y kits, además del núcleo visual en `src/lib/editor` y `src/components/editor`. Por eso esta decisión añade una capa de runtime y un adaptador; no reemplaza el store, historial, autosave, acceso Premium ni el generador actual.

## Decisión

`PageSchema` es el contrato canónico de salida para sitios generados o editados. Contiene:

- sitio, orden de páginas, página predeterminada y locale;
- páginas con slug, SEO y orden de secciones;
- secciones con estilos base, overrides responsive y raíces de componentes;
- componentes normalizados por id, props tipadas, estilos, overrides y children;
- tokens de tema para color, tipografía, espaciado, radios y sombras.

No contiene HTML, JSX, scripts, handlers serializados ni JavaScript. La versión inicial está en `src/lib/page-builder/schema.ts`.

El `ComponentRegistry` de `src/components/page-builder/registry.tsx` es la única lista ejecutable. Cada entrada declara su componente React, schema de props, props y estilos por defecto, propiedades editables, hijos permitidos, controles de estilo y capacidades responsive. El renderer nunca resuelve imports o nombres enviados por el usuario.

`validatePageSchema` valida antes de renderizar: versión, forma estricta, props, componentes conocidos, ids, referencias, nesting, ciclos, padres duplicados, profundidad, propiedades CSS permitidas y valores peligrosos. `PageRenderer` solo monta entradas conocidas del registro y escapa texto mediante React. No usa `eval`, `Function`, `dangerouslySetInnerHTML` ni inserta scripts.

La vista previa del editor convierte temporalmente `EditorDocument` a `PageSchema` con `editorDocumentToPageSchema`. Este puente conserva el flujo actual y permite migrar persistencia y edición multipágina por fases.

## Flujo

```text
EditorDocument actual ──adaptador──┐
                                  ├─> validatePageSchema ─> ComponentRegistry ─> React
IA futura ──patches PageSchema─────┘
```

Los estilos base se aplican como objetos React acotados. Los overrides generan CSS scoped por ids validados y media queries conocidas. Los enlaces y URLs de imagen pasan por protocolos permitidos.

## Generación y edición con IA

La IA no devolverá una página HTML. Recibirá el schema actual y producirá operaciones estructuradas, por ejemplo:

```json
[
  { "op": "replace", "path": "/components/hero-main/props/title", "value": "Nuevo título" },
  { "op": "replace", "path": "/components/hero-main/responsive/mobile/fontSize", "value": "40px" }
]
```

La aplicación aplicará los patches a una copia, validará el resultado completo y solo entonces lo guardará. Las operaciones deben estar limitadas a rutas editables del schema; no pueden modificar `schemaVersion`, inyectar tipos no registrados o añadir código. Los costes, reservas y captura de créditos seguirán el pipeline servidor existente antes de aceptar el resultado del modelo.

## Evolución prevista

1. Persistir el envelope completo de `PageSchema` junto con una migración desde documentos v1.
2. Añadir navegación multipágina y edición de SEO/tokens al inspector.
3. Traducir comandos del editor a patches PageSchema validados.
4. Conectar generación de IA a una salida JSON estructurada y reintento de reparación.
5. Publicar/exportar desde PageSchema, usando el mismo renderer y almacenamiento R2 existente.

## Consecuencias

- Una página válida es reproducible y renderizable sin ejecutar código del usuario.
- Los componentes nuevos requieren registro explícito, props schema y pruebas.
- Los documentos malformados fallan antes del render y muestran un error controlado.
- El adaptador es una frontera temporal; no debe convertirse en un segundo formato permanente.
- El canvas y drag-and-drop se implementan sobre este contrato en ADR-003; el editor previo permanece disponible para las rutas que aún no han migrado.
