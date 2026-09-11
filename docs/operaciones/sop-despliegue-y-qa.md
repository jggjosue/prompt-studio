# SOP — Control de calidad y despliegue

## 1. Puertas de calidad

Definidas en [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml).
Se ejecutan en cada pull request y en cada push a `main`, con Node 22.11.0.

### Trabajo `checks`

```bash
npm ci
npm run test:ci
```

`test:ci` encadena, **en este orden**:

| Paso | Qué comprueba | Por qué va donde va |
|---|---|---|
| `verify:env-example` | Que `.env.example` no contenga secretos reales | Primero: es instantáneo y su fallo es el más grave |
| `typecheck` | `tsc --noEmit` | Antes de los tests: un error de tipos los invalida |
| `test:unit` | 51 tests sobre `tests/unit/` | Contratos de seguridad y lógica pura |
| `test:data` | 2 tests sobre `tests/data/` | Integridad del catálogo |
| `cache:audit` | Coherencia de las políticas de caché | Detecta un `public` donde debería haber `private` |

### Trabajo `browser-budgets`

Condicionado a que exista la variable `PLAYWRIGHT_BASE_URL`. Ejecuta
`npm run test:e2e` con Chromium: Core Web Vitals, presupuestos de JavaScript,
comportamiento en móvil y accesibilidad por teclado.

Se salta si no hay URL configurada, así que **un PR puede pasar en verde sin
haberse probado en navegador**. Conviene saberlo antes de confiar en el check.

## 2. Qué cubren los tests unitarios

No son tests de UI. Cubren invariantes que, de romperse, cuestan dinero o abren
un agujero:

- **Cobro**: el precio es del servidor; la firma de webhook se verifica.
- **Descargas**: token ligado a compra y usuario, propiedad, estado pagado y
  límite atómico.
- **Generación con IA**: idempotencia, control de créditos, procesamiento fuera
  de la petición, pares tipo/proveedor válidos.
- **Rate limiting**: tope, aislamiento por clave, renovación de ventana, parseo
  de `x-forwarded-for`, `Retry-After` nunca 0.
- **Autorización**: las rutas `/api/sync-*` exigen `CRON_SECRET` o admin, con
  comparación en tiempo constante.
- **Cabeceras de seguridad**: la CSP declara sus defensas, permite a los
  terceros reales, y las dos políticas no se solapan.
- **Idioma**: precedencia cookie → navegador → geo, y que la reescritura no
  expone el prefijo en la URL.
- **Exposición del catálogo**: ningún producto de pago bajo `public/`.
- **Procedencia**: ningún host desconocido se cuela como licenciable.

## 3. Validadores de SEO

Doce comprobaciones ejecutables con `npm run seo:validate-all`: canonicals,
sitemap, robots, metadata, schema, enlazado interno, duplicados, rendimiento,
cobertura de catálogo, Search Console y sitemap en vivo.

**No están en CI.** Se ejecutan a mano, y conviene hacerlo antes de un
despliegue que toque rutas, metadatos o contenido del catálogo. El SEO es
requisito de producto aquí, no una optimización: el catálogo se descubre por
búsqueda.

## 4. Despliegue

Alojado en Vercel. `main` despliega a producción.

`npm run build` encadena:

1. `prebuild` → `catalog:build` (regenera el catálogo paginado)
2. `next build`
3. `minify-public-assets.mjs`
4. `optimize-public-media.mjs`
5. `precompress-static.mjs` (genera `.br` y `.gz`)

### Antes de desplegar

- [ ] `npm run test:ci` en verde
- [ ] `next build` completa
- [ ] Si se tocaron rutas o metadatos: `npm run seo:validate-all`
- [ ] Si se añadieron variables de entorno: darlas de alta en Vercel **antes**
      del despliegue; se leen en tiempo de build
- [ ] Si se tocó la CSP: revisar los informes de `/api/csp-report` antes de
      subir `CSP_ENFORCE`

### Tras desplegar

- [ ] La home responde y sirve el idioma correcto según `Accept-Language`
- [ ] Una demo de `/webpages/{slug}/` carga con sus CDNs
- [ ] Un checkout de prueba llega a Stripe
- [ ] Sin errores nuevos en `/dashboard/observability`

## 5. Entorno de desarrollo

`.nvmrc` fija Node **22.11.0**. Es un requisito real, no una preferencia:
`test:unit` usa `--experimental-strip-types`, que necesita Node 22.6 o superior.

### Trampa conocida de macOS con Apple Silicon

Si el `node` del PATH es x64 bajo Rosetta en una máquina arm64, `npm install`
instala los binarios opcionales de la arquitectura equivocada y el resultado es
un `node_modules` mixto: SWC de una arquitectura y `@parcel/watcher` de la otra.
El síntoma es `Failed to load SWC binary` o `No prebuild of @parcel/watcher`.

Comprobar con `node -p "process.arch"`. Debe decir `arm64`.

### Turbopack en desarrollo, webpack en build

`npm run dev` usa `--turbopack`; `npm run build`, no. **No resuelven los módulos
igual**, así que algo puede funcionar en desarrollo y fallar al construir. Ya ha
pasado: `instrumentation.ts` compilaba con turbopack y rompía el build de
producción por un import de mongoose que llegaba al bundle edge.

Conclusión operativa: **un cambio no está verificado hasta que `next build`
pasa.** El servidor de desarrollo no basta.

## 6. Si el despliegue falla

| Error | Causa probable |
|---|---|
| `Module not found: Can't resolve 'http'` | Un módulo de Node llegó al bundle edge; revisar `webpack.resolve.alias` en `next.config.ts` |
| `Failed to collect page data for /tags/[slug]` | Dato inválido en el catálogo, normalmente un `tag` no-string |
| `Error occurred prerendering` | Una página intenta prerenderizarse y no puede; marcarla `force-dynamic` si es por usuario |
| Clerk avisa de claves de test | `pk_test_`/`sk_test_` en producción; no bloquea el build salvo `CLERK_ENFORCE_LIVE_KEYS=1` |
