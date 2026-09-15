# Base de conocimiento

Cosas que cuestan horas de descubrir y minutos de leer. Cada entrada es un
problema real que ya ocurrió en este proyecto, con su causa y su desenlace.

---

## Entorno

### El servidor de desarrollo funciona y el build falla

`npm run dev` usa `--turbopack`; `npm run build`, no. **Resuelven módulos de
forma distinta.**

Caso real: `instrumentation.ts` importa `observability-server` → mongoose →
drivers de mongodb → `agent-base`, que hace `require('http')`. Turbopack lo
resolvía; webpack lo metía en el bundle edge y el build moría con
`Module not found: Can't resolve 'http'`.

El guard `if (NEXT_RUNTIME === 'edge') return;` **no basta**: webpack resuelve
los `import()` al parsear, antes de eliminar código muerto.

**Solución**: alias a `false` en `webpack.resolve.alias` solo para
`nextRuntime === 'edge'`, con la **ruta absoluta** como clave. Aliasear por la
petición `@/lib/...` no funciona: el plugin de paths de TypeScript la resuelve
antes.

**Regla**: un cambio no está verificado hasta que `next build` pasa.

### `node_modules` con arquitecturas mezcladas

En macOS con Apple Silicon, si el `node` del PATH es x64 bajo Rosetta,
`npm install` instala los binarios opcionales de x64. Resultado: SWC de una
arquitectura y `@parcel/watcher` de la otra, y nada arranca.

Síntomas: `Failed to load SWC binary for darwin/arm64` o
`No prebuild of @parcel/watcher found`.

Comprobar con `node -p "process.arch"` → debe decir `arm64`. Para instalar un
paquete de plataforma con el node correcto:

```bash
/opt/homebrew/bin/node /opt/homebrew/lib/node_modules/npm/bin/npm-cli.js install …
```

### `next@15.5.9` fija `@next/swc-darwin-arm64@15.5.7`

No es un error del lockfile. Esa versión de SWC no existe para 15.5.9 y Next lo
declara así a propósito. Si el binario falla, es que la descarga se truncó
—comprobar el tamaño, debe rondar los 129 MB, no 20— y hay que reinstalarlo.

---

## Datos del catálogo

### `tags` con valores nulos rompe el **build**, no el runtime

Hay 52 valores no-string en `placeholder-images.json`. Un `null` llega a
`slugify()` desde `generateStaticParams` de `/tags/[slug]` y revienta con
`Cannot read properties of null (reading 'normalize')`.

Lo peligroso es *cuándo* falla: en el despliegue, no en desarrollo. Filtrado con
`cleanTags()` en `src/lib/seo/programmatic-seo.ts`.

### `description` no está vacío en las fuentes

Parece vacío si solo se mira `public/catalog/`. En las fuentes contiene
`{ es: { nombre, prompt }, en: { name, prompt } }` — el prompt de pago.
`build-paged-catalogs.mjs` lo vacía **a propósito** en el derivado.

### Los ficheros de componentes tienen otra forma

No siguen la estructura de los demás catálogos:

```jsonc
{ "title_es": "…", "title_en": "…", "description_es": "…", "description_en": "…",
  "components": [ /* 50; form tiene 100 */ ] }
```

Localizan por sufijo, no por objeto anidado, y envuelven el array. Un lector
genérico debe buscar el array con `Object.values(...).find(Array.isArray)`, no
asumir clave fija.

Corolario: usar `len()` sobre `next(iter(d.values()))` cuenta los caracteres de
`title_es`, no los elementos. Ya llevó a reportar 170 componentes donde hay 450.

---

## Seguridad

### `.env.example` está versionado

`.gitignore` lo exceptúa con `!.env.example`. Llegó a contener 54 valores
idénticos a `.env`. Protegido ahora por `npm run verify:env-example`, en
`test:ci`.

**Borrar un secreto de HEAD no lo borra del historial.** Si se commiteó, hay que
rotarlo. `npm run verify:rotation` compara lo que se usa hoy contra todo lo que
alguna vez estuvo en el historial.

### Las variantes `.br` y `.gz` saltan los bloqueos por extensión

`precompress-static.mjs` genera copias comprimidas. Una regla que bloquee
`*.json` deja abierto `*.json.br`. Cualquier bloqueo por ruta debe cubrir las
tres formas.

### Una lista blanca de nombres envejece mal

El bloqueo original de ficheros del catálogo enumeraba 8 nombres. Cuando se
auditó de verdad había **9 ficheros más** con producto de pago que nadie había
añadido a la lista, incluidas cuatro copias huérfanas. La regla pasó a cubrir el
directorio entero.

**Patrón general**: los tests que enumeran lo que hay que proteger caducan; los
que recorren el directorio real, no.

### Clerk devuelve 404 en vez de redirigir a peticiones no-documento

`auth.protect()` con `Accept: */*` —lo que envía `curl` por defecto— responde
404, no 307. Es comportamiento documentado. Al probar rutas protegidas hay que
enviar `Accept: text/html` o se diagnostica una regresión que no existe.

---

## Rendimiento e i18n

### Leer `cookies()` o `headers()` en el layout raíz hace dinámico todo el sitio

`src/i18n/request.ts` lo hacía para detectar idioma. Consecuencia: las 121 rutas
eran dinámicas y ninguna página se podía cachear. No servía de nada poner
`revalidate`.

**Solución**: detectar el idioma en el middleware y reescribir a `/{locale}/…`.
Las páginas reciben el idioma como parámetro de ruta y se prerenderizan. Pasó a
60 dinámicas y 202 páginas prerenderizadas, con la URL pública sin prefijo.

Requiere `setRequestLocale(locale)` en el layout: sin esa llamada,
`getMessages()` vuelve a leer cabeceras y se pierde todo lo ganado.

### El prefijo de idioma debe consolidarse

Si llega `/en/prices` desde fuera, sin tratarlo se re-prefijaría a
`/en/en/prices` y daría un 404 opaco. Peor: si algún día dejara de dar 404,
serían dos URLs con el mismo contenido. Se redirige con 308 a la canónica.

### Los `headers()` de `next.config.ts` con alternancia en el parámetro no son fiables

`'/:path((?!webpages/|api/|_next/).*)'` se comportó **al revés**: aplicaba a
`/api/*`, que estaba excluido, y no a `/terms`, que sí casaba. Un solo lookahead
(`(?!webpages/)`) sí funciona. Verificar siempre contra el servidor, no contra
`path-to-regexp` a mano.

### Next sobrescribe el `Vary` que fija el middleware

Las cabeceras propias puestas en la respuesta del middleware sobreviven
(`x-locale` lo hace), pero `Vary` lo gestiona Next para RSC y lo pisa.

---

## Diagnóstico

### Un servidor viejo en el puerto invalida la prueba

`next start` falla con `EADDRINUSE` pero el `curl` siguiente responde igual —lo
sirve el proceso anterior, con el build anterior. Ha llevado a dar por buenos
cambios que no estaban desplegados.

Antes de verificar: `lsof -ti:PUERTO | xargs kill -9` y confirmar que el puerto
está libre.

### Verificar que el test detecta, no solo que pasa

Un test en verde puede estarlo porque no mira donde debe. Al escribir un test de
protección, comprobar además que **falla** cuando se introduce el fallo a
propósito. El guardarraíl de `.env.example` se validó copiando cuatro secretos
reales al fichero y confirmando que los señalaba.
