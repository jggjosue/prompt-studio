# SOP — Publicar contenido en el catálogo

Procedimiento para añadir o modificar recursos y regenerar el catálogo servido.

## 1. Dónde vive cada cosa

| Capa | Ruta | Contiene | ¿Servida por HTTP? |
|---|---|---|---|
| **Fuente** | `src/data/prompts/`, `src/data/web-pages.json` | El prompt completo | **No** |
| **Derivado** | `public/catalog/` | Metadatos y prompt truncado | Sí |
| **Demos** | `public/webpages/{slug}/` | HTML estático navegable | Sí |

La separación es deliberada y es lo que impide regalar el producto: las fuentes
llevan el prompt de pago y no son descargables; el derivado sí se sirve, y por
eso `build-paged-catalogs.mjs` vacía `description` y trunca a 240 caracteres el
prompt de los registros Premium.

**Regla que no se salta nunca: ningún fichero con producto de pago íntegro se
coloca bajo `public/`.** Hay un test que lo comprueba recorriendo el directorio
entero ([`tests/unit/catalog-source-exposure.test.ts`](../../tests/unit/catalog-source-exposure.test.ts));
falla en CI si alguien lo intenta.

## 2. Volumen actual

| Tipo | Registros | Fichero |
|---|---|---|
| Imágenes | 299 | `src/data/prompts/placeholder-images.json` |
| Vídeos | 197 | `src/data/prompts/placeholder-videos.json` |
| Landing pages | 236 | `src/data/web-pages.json` |
| Componentes | 450 en 8 categorías | `src/data/prompts/web-{tipo}-components.json` |

Total 1.182.

## 3. Procedimiento

### Paso 1 — Editar la fuente

Forma de un registro:

```jsonc
{
  "id": "img-300",
  "title": { "es": "…", "en": "…" },
  "description": { "es": { "nombre": "…", "prompt": "…" },
                   "en": { "name": "…", "prompt": "…" } },
  "imageUrl": "https://…",
  "imageHint": { "es": "…", "en": "…" },
  "tags": ["Realistic", "Modern"],
  "membership": "Premium"
}
```

Los ficheros de componentes usan otra forma: envuelven el array en
`{ title_es, title_en, description_es, description_en, components: [...] }` y
localizan por sufijo, no por objeto anidado.

**Comprobaciones al editar:**

- `id` único dentro de su tipo. No hace falta que lo sea entre tipos: existen
  `img-2` y `wp-2`.
- `tags` solo cadenas. Un `null` en `tags` **rompe el build**, no el runtime:
  llega a `slugify()` desde `generateStaticParams` y revienta el despliegue. Hay
  52 valores no-string históricos ya filtrados por `cleanTags()`, pero conviene
  no añadir más.
- `price` es cadena, aunque represente un número.
- `membership` correcto: marcar Premium como Free publica el prompt entero en el
  catálogo derivado.

### Paso 2 — Regenerar el derivado

```bash
npm run catalog:build
```

Reescribe `public/catalog/{tipo}/{locale}/` en páginas de 24 elementos con hash
en el nombre y un `manifest.json`. El hash permite cachear cada página como
inmutable.

Se ejecuta también en `prebuild`, así que un despliegue lo hace solo. Correrlo a
mano sirve para revisar el resultado antes de commitear.

### Paso 3 — Revisar procedencia

```bash
npm run catalog:provenance
```

Clasifica cada activo por host y dice cuántos registros son licenciables.
Referencia actual: 1.182 registros, 1.050 licenciables (88,8 %).

Si el recuento de licenciables baja tras añadir contenido, el activo nuevo viene
de un host restringido. Los conocidos: Unsplash prohíbe entrenar IA, Mixkit
requiere confirmación escrita, imgur no documenta procedencia.

### Paso 4 — Verificar

```bash
npm run test:ci
npm run seo:validate-all   # si se añadieron landing pages
```

## 4. Añadir una demo de landing page

Además de la entrada en `src/data/web-pages.json`:

1. Crear `public/webpages/{demoUrl}/` con el HTML estático.
2. `demoUrl` debe coincidir con el nombre de la carpeta, y también con la
   carpeta en el bucket R2 si se sirve desde ahí.
3. Validar con `/api/web-pages/validate-demo-url`.

Las demos reciben una CSP propia, más permisiva, porque cargan librerías de
cdnjs, jsdelivr, unpkg y Google Fonts. La política de la app las rompería.

## 5. Errores frecuentes

| Síntoma | Causa habitual |
|---|---|
| El build falla en `generateStaticParams` de `/tags/[slug]` | Un `tag` no-string en el registro nuevo |
| El recurso no aparece en el listado | Falta `imageUrl`, o `type` distinto de `image` en el catálogo de imágenes: el build los filtra |
| El prompt se ve sin pagar | `membership` mal puesto en la fuente |
| La demo da 404 | `demoUrl` no coincide con el nombre de la carpeta |
| `catalog-source-exposure` falla en CI | Se colocó un fichero con producto de pago bajo `public/` |
