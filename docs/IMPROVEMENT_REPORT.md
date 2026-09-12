# Informe de mejora del repositorio

Cierre del programa de auditoría (fases 1–10). Compara el estado medido **antes**
y **después**, y dice con la misma claridad qué quedó sin resolver y por qué.

Todas las cifras se han medido, no estimado. Cada sección incluye el comando que
las reproduce.

---

## 1. Resumen

| Dimensión | Antes | Después | Cómo se comprueba |
|---|---|---|---|
| `npm run lint` | **no ejecutable** (sin configuración) | 0 errores, 222 avisos | `npm run lint` |
| `npm run typecheck` | 0 errores | 0 errores | `npm run typecheck` |
| Cobertura publicada | 93,87 % *sobre 62 de 680 ficheros* | **5,56 %** sobre todo `src/` | `npm run test:coverage` |
| Informe lcov | no se generaba | `coverage/lcov.info`, artefacto en CI | job *tests* |
| Vulnerabilidades de producción | **88** (4 críticas, 23 altas) | **63** (0 críticas, 7 altas) | `npm audit --omit=dev` |
| Rutas de API con acceso verificado | 0 (sin inventario) | **105 de 105**, con test que falla si falta | `npx tsx --test tests/unit/route-access-matrix.test.ts` |
| CI sobre `develop` | no | sí (`pull_request` + `push` a `main` y `develop`) | `.github/workflows/quality.yml` |
| README | no existía | 217 líneas, enlaces verificados | `README.md` |
| Documentos que describen el código | 0 | **9** nuevos o reescritos en `docs/` | índice del README |
| Pasos posteriores al build operativos | 0 de 3 (ruta rota) | 3 de 3 corregidos, 2 verificados en ejecución | §2.6 |
| Comando único de validación | no existía | `npm run validate` | — |

---

## 2. Lo que mejoró, y cuánto

### 2.1 El lint pasó de inexistente a obligatorio

No había configuración de ESLint: `npm run lint` no era ejecutable. Se creó
`eslint.config.mjs` (flat config) sobre `next/core-web-vitals` y
`next/typescript`. La primera pasada dio **280 errores**; hoy hay **0 errores y
222 avisos**, y el lint bloquea CI.

Los avisos son deliberados, no deuda escondida: `@typescript-eslint/no-explicit-any`
y `no-console` están en `warn` porque eliminarlos exige tocar lógica, y ese
cambio no pertenece a una tarea de calidad estática.

**Lección recogida en el proceso.** La limpieza de imports por expresiones
regulares destruyó código **tres veces** (eliminó identificadores de literales de
objeto y dejó `type` y `import from "x"` colgando). La solución no fue afinar el
patrón sino cambiar de herramienta: `eslint-plugin-unused-imports`, que opera
sobre el AST. *Las ediciones mecánicas de imports necesitan un árbol sintáctico,
no una expresión regular.*

### 2.2 La cobertura pasó de halagadora a útil

El 93,87 % anterior era real pero se medía **solo sobre los 62 ficheros que los
tests cargaban**. Los 618 restantes no aparecían en el denominador.

`scripts/mjs/build-coverage-report.mjs` fusiona las dos pasadas lcov (unitarias
con `tsx`, datos sin él) y **añade al informe los ficheros de `src/` que ningún
test carga, con 0 %**. Resultado: **5,56 % (4.290 / 77.202 líneas)**, 62 ficheros
medidos, 614 sin cubrir.

El número bajó 88 puntos. Eso no es una regresión: es la diferencia entre una
métrica y una medida. Un número honesto y bajo permite priorizar; uno alto y
parcial impide incluso saber qué falta.

**Detalle que costó una depuración:** las banderas del *reporter* deben ir
**antes** de `--test <ficheros>`. Detrás, Node las interpreta como rutas de test y
el informe sale a 0 % sin error.

### 2.3 El acceso a la API pasó de convención a contrato

`scripts/mjs/build-route-access-matrix.mjs` recorre `src/app/api/**` y clasifica
cada ruta según 8 mecanismos detectados en el código (webhook, cron, admin, plan,
sesión, token de worker, límite por IP, deshabilitada). Las rutas públicas
legítimas están enumeradas con **justificación escrita**.

`tests/unit/route-access-matrix.test.ts` convierte eso en un contrato con 7
comprobaciones: ninguna ruta sin mecanismo ni justificación, `/api/admin/**`
comprobando rol y no solo sesión, escrituras públicas limitadas por IP,
justificaciones de 20 caracteres como mínimo y documento generado al día.

**Encontró dos fallos reales en cuanto se ejecutó:**

1. `/api/admin/observability` y `/api/admin/product-reviews` comprobaban el correo
   electrónico en línea en lugar de usar `isPremiumJoAdmin()`. Dos copias de una
   regla de autorización que pueden divergir.
2. `/api/affiliate/applications` era una **escritura pública sin límite por IP**.

Esto es lo que distingue una prueba útil de una decorativa: se escribió para
comprobar una propiedad y encontró defectos que nadie buscaba.

### 2.4 Vulnerabilidades: de 88 a 63, y de 4 críticas a ninguna

| | Críticas | Altas | Moderadas | Bajas | **Total** |
|---|---|---|---|---|---|
| Antes | 4 | 23 | 59 | 2 | **88** |
| Después | **0** | **7** | 53 | 3 | **63** |

Cómo, sin romper nada:

| Acción | Efecto |
|---|---|
| `next` 15.5.9 → **15.5.25** (sin cambio de mayor) | Cierra la crítica de DoS en el optimizador de imágenes |
| `sharp` 0.34.5 → **0.35.4** | Cierra los CVE heredados de libvips |
| `postcss` → **8.5.28** + `overrides: {"postcss": "$postcss"}` | Unifica las tres copias en la versión corregida |
| `recharts` **3.0.0-alpha.9 → 3.10.1** | Saca una versión *alpha* de producción y elimina `lodash`, cuya vulnerabilidad no tiene corrección publicada |
| `overrides` dirigidos | `handlebars` 4.7.9, `protobufjs` 7.6.6, `websocket-driver` 0.7.5, `node-forge` 1.4.0, `js-cookie` 3.0.8, `nanoid` 3.3.19, `fast-uri`, `form-data`, `@grpc/grpc-js`, `qs`, `body-parser`, `path-to-regexp` |
| Se elimina `firebase-admin` | **Dependencia directa que ningún módulo importaba.** Solo se usa el SDK cliente `firebase` en `src/lib/firebase.ts` |

Dos decisiones de lo que **no** se hizo, y su motivo:

- **No se aceptó `npm audit fix --force`.** Proponía `genkit@0.5.17`, que es un
  **retroceso** desde 1.20.0 y rompería todo el subsistema de IA. La herramienta
  presenta como «corrección» cualquier versión fuera del rango vulnerable,
  incluidas las anteriores.
- **Los `overrides` son dirigidos, no globales.** `picomatch`, `form-data` y
  `@grpc/grpc-js` conviven en dos versiones mayores distintas en el árbol; un
  override global habría degradado al consumidor moderno. Se usó la forma
  `"paquete@<rango>": "versión"` para tocar solo la copia vulnerable.

### 2.5 Documentación escrita desde el código

Ocho documentos en `docs/` más `README.md`, `CONTRIBUTING.md` y `LICENSE`. El
criterio fue uniforme: **cada afirmación va acompañada del comando que la
comprueba**, y ningún documento describe algo que el código no haga.

Lo que aportan y no estaba en ningún sitio:

- `ARCHITECTURE.md` documenta las **violaciones de capa conocidas** (`lib`→`app`,
  `lib`→`components`, `models`→`lib`) con su explicación, para que nadie las
  replique creyendo que son el patrón.
- `DATABASE.md` explica por qué **tres modelos comparten la colección
  `user_profiles`** y el `E11000` de producción que provocó: un *lead* sin
  `userId` se indexa como `null`, y con un único normal solo el primero entra.
  La corrección es un índice único **parcial**.
- `AI_ARCHITECTURE.md` documenta que la comprobación de saldo vive **en el filtro
  de MongoDB**, no en un `if`, y por qué eso impide el saldo negativo bajo
  concurrencia.
- `DEPLOYMENT.md` nombra el fallo silencioso más caro: **sin `CRON_SECRET` la cola
  de IA se detiene** con los créditos reservados y sin ninguna alarma.
- `SECURITY.md` registra el estado real de las dependencias en lugar de afirmar
  que el proyecto está limpio.

### 2.6 Tres pasos del build que nunca se ejecutaron

Al validar el build tras la actualización de dependencias apareció un fallo que
llevaba tiempo oculto:

```
[optimize-media] Error: ENOENT: no such file or directory, scandir '.../scripts/public'
[minify-public] Omitido (no existe): public/webpages
```

Los tres scripts posteriores a `next build` —`minify-public-assets`,
`optimize-public-media` y `precompress-static`— resolvían la raíz del proyecto
como `path.join(__dirname, '..')`. Como viven en `scripts/mjs/`, eso apunta a
`scripts/`, no a la raíz. **Buscaban `scripts/public/`, que no existe.**

Consecuencia: el build declaraba minificar, optimizar medios y precomprimir, y
no hacía **ninguna de las tres cosas**. Dos fallaban en silencio («nada que
minificar») y la tercera imprimía un error pero el build seguía saliendo con
código 0.

La corrección es `path.join(__dirname, '..', '..')` en los tres.

**Y la ruta rota escondía un segundo fallo.** Con el precompresor ya apuntando a
`public/`, el script murió con `ReferenceError: r is not defined`:

```js
const _r = await compressFile(file);
if (r) results.push(r);          // r ya no existe
```

Es un error introducido por este mismo programa: durante la limpieza de lint se
prefijó con `_` la declaración de una variable **sin renombrar sus usos**. Nunca
se manifestó porque el script salía antes, al no encontrar `public/`. Corregido y
verificado: el precompresor procesa ahora **814 ficheros**; antes, cero.

Es la segunda vez que aparece este patrón en el programa (la primera rompió
`analyze-route-bundles.mjs`). *Prefijar con `_` una variable «no usada» solo es
seguro si se comprueba que de verdad no se usa en todo el ámbito.*

**`optimize-public-media` no se ha ejecutado aquí a propósito**: reescribe
imágenes y vídeos ya versionados con recodificación con pérdida. Corregir la ruta
es lo que pedía la auditoría; decidir cuándo recodificar los medios del
repositorio corresponde a quien los mantiene.

### 2.7 Validadores de SEO que fallaban en silencio

Se descubrió que varios scripts de `seo:validate-*` **salían con código 0 sin
comprobar nada**: `audit-webpages-seo` y otros leían
`public/webpages/web-pages.json`, un fichero que dejó de existir al mover el
catálogo a `src/data/`; `validate-canonicals` y `validate-seo-performance`
apuntaban a rutas anteriores a la internacionalización con `[locale]`; y
`validate-live-sitemap-http` tenía la **cadena literal** `'process.env.DOMAIN'`
como URL por defecto.

Diez validadores recuperaron su informe (`SEO_REPORT=1`) y tres que salían con
código 1 sin explicar nada ahora enumeran los problemas.

---

## 3. Lo que empeoró

**Un número: la cobertura publicada, de 93,87 % a 5,56 %.** Ya está explicado en
§2.2 — la medida anterior era parcial. Se registra aquí igualmente porque quien
compare dos informes sin leer el método verá una caída.

No hay ninguna otra métrica peor que antes.

---

## 4. Lo que no cambió

- **Ninguna funcionalidad.** El programa no tocó comportamiento salvo en las tres
  correcciones de seguridad de §2.3, que restringen el acceso.
- **`typecheck` seguía y sigue en 0 errores.** Era lo único sano de partida.
- **El número de tests** (325 unitarios + 2 de datos). Se añadieron los 7 de la
  matriz de acceso; no se generaron pruebas de relleno para subir la cobertura,
  porque una prueba que ejecuta código sin comprobar nada sube el número y no la
  confianza.

---

## 5. Lo que sigue abierto

Con su motivo, no como lista de deseos.

### 5.1 Las 63 vulnerabilidades restantes tienen una sola raíz

**Las 63 cuelgan del árbol de `genkit`**, y las 7 altas son la cadena de
OpenTelemetry. `@genkit-ai/core` fija `@opentelemetry/* ~1.25`, y las
correcciones están publicadas solo en **OpenTelemetry 2.x**.

Se comprobó que **`genkit@1.42.0`, la versión más reciente, sigue fijando
`~1.25.0`**: no es un problema de estar desactualizado, es que la corrección no
existe aguas arriba.

```bash
npm view @genkit-ai/core@latest dependencies --json | grep opentelemetry
```

Forzar OpenTelemetry 2.x bajo genkit mediante `overrides` compila, pero no puede
verificarse aquí que la instrumentación siga funcionando en ejecución. **Cambiar
un subsistema en funcionamiento por un número de auditoría, sin poder comprobar
el resultado, es peor que documentar el riesgo.** La decisión es esperar a que
genkit migre y revisar en cada actualización.

Las restantes son denegación de servicio y confusión de nombres en trazado; el
trazado solo procesa datos propios, no entrada del usuario.

### 5.2 614 módulos de `src/` sin ninguna prueba

El 5,56 % es el punto de partida honesto. La prioridad razonable, por riesgo:
`src/lib/ai-job-service.ts` (mueve créditos), `src/lib/output-contract.ts`,
`src/lib/cache-policy.ts` y los adaptadores de proveedor.

### 5.3 El build ignora los errores que CI sí comprueba

`next.config.ts` mantiene `typescript.ignoreBuildErrors: true` y
`eslint.ignoreDuringBuilds: true`. Hoy ambas comprobaciones salen limpias y CI
las exige, así que las banderas ya no protegen de nada; pero quitarlas cambia el
comportamiento del build de producción y esa decisión corresponde a quien
mantiene el despliegue. **Es el primer candidato de la próxima iteración.**

### 5.4 Secretos reales en las transcripciones de desarrollo

`docs/code/` contiene una `CLERK_SECRET_KEY` `sk_live_` **real** junto con claves
publicables de Clerk y Stripe. Los ficheros se han excluido del control de
versiones (`.gitignore`) para que no se publiquen, pero **esa clave debe
rotarse** y considerarse comprometida.

### 5.5 Código muerto detectado

`src/components/ui/chart.tsx` no lo importa ningún módulo. Es el único consumidor
de `recharts`. No se ha eliminado porque borrar un componente excede el alcance de
una tarea de calidad; queda señalado para que se decida. Si se borra, `recharts`
sale también de las dependencias.

### 5.6 Artefactos comprimidos versionados

`public/offline.html.{gz,br}` y `public/sw.js.{gz,br}` están en control de
versiones **pese a que `.gitignore` excluye `public/**/*.gz` y `*.br`**: se
añadieron antes de esa regla. Ahora que el precompresor funciona, se regeneran en
cada build y producirán diferencias sin contenido. Conviene sacarlos del índice
con `git rm --cached`.

### 5.7 Dos ficheros de bloqueo

El repositorio versiona `package-lock.json` **y** `yarn.lock`. Ambos se han
actualizado de forma coherente con los cambios de dependencias de §2.4, pero dos
ficheros de bloqueo pueden divergir en silencio y dar instalaciones distintas
según el gestor que use cada persona o el despliegue. Conviene quedarse con uno.

### 5.8 Historial de Git

369 commits y **0 pull requests** antes de este programa. El historial no muestra
revisión por pares. No es corregible retroactivamente —fabricar PRs sería
exactamente el tipo de inflado que este trabajo evita—, pero desde ahora las
plantillas de PR y CI sobre `develop` hacen que el proceso quede registrado.

---

## 6. Cómo reproducir este informe

```bash
nvm use                         # Node >= 22.11; con Node 20 falla la cobertura
npm ci
npm run validate                # lint · typecheck · cobertura · env · caché
npm audit --omit=dev            # 63 / 0 críticas
npx tsx --test tests/unit/route-access-matrix.test.ts
npm run build
```

Estado en el momento de escribir esto: `npm run validate` sale en **0**; lint 0
errores y 222 avisos; 325 pruebas unitarias y 2 de datos en verde; cobertura
5,56 %; `.env.example` limpio con 91 claves; auditoría de caché correcta.

---

## 7. Nota sobre el método

Dos reglas guiaron el trabajo y explican por qué algunos números no son mejores:

1. **No inflar.** No se crearon commits sin contenido, ni PRs ficticios, ni
   pruebas que no comprueban nada, ni documentación que describe algo que el
   código no hace. Donde una métrica quedó mal, se dejó mal y se explicó.
2. **No romper lo que funciona por una cifra.** Cada corrección de dependencias se
   validó con `validate` y con el build completo. La única propuesta de
   `npm audit` que habría bajado más el número —retroceder `genkit` a 0.5.17— se
   rechazó porque habría inutilizado el subsistema de IA.

El resultado es un repositorio cuyas afirmaciones de calidad pueden comprobarse
con un comando. Eso es lo que cambió: no que el código sea mejor de lo que era,
sino que ahora se sabe, y se puede demostrar, cómo de bueno es.
