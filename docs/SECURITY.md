# Seguridad

Cómo se protege Prompt Studio, qué se comprueba de forma automática y qué sigue
pendiente. Las afirmaciones de este documento están verificadas con los comandos
del §7; las que no se han podido verificar se señalan como tales.

---

## 1. Modelo de acceso

Ocho mecanismos, uno por tipo de llamante. La lista completa, ruta a ruta, está
en [API_ACCESS.md](API_ACCESS.md), que se **genera del código** y está respaldada
por `tests/unit/route-access-matrix.test.ts`.

| Llamante | Mecanismo | Implementación |
|---|---|---|
| Persona con sesión | Clerk | `auth()` |
| Persona con plan | Estado real de suscripción | `src/lib/server-subscription-status.ts` |
| Administrador | Correo configurado | `src/lib/admin-auth.ts` · `marketplace-admin.ts` · `cache-admin-auth.ts` |
| Stripe / Clerk | Firma del webhook | `constructEvent` · `svix` |
| Tareas programadas | `CRON_SECRET` | `src/lib/api-auth.ts` |
| Worker de IA | Bearer token | `AI_GENERATION_WORKER_TOKEN` |
| Anónimo | Límite por IP | `src/lib/rate-limit.ts` |

### Reglas que el pipeline impone

La prueba de la matriz falla —y con ella el pipeline— si:

1. una ruta nueva no usa ningún mecanismo reconocido ni está justificada por
   escrito;
2. una ruta bajo `/api/admin` comprueba solo la sesión, no el administrador;
3. una escritura sin sesión no tiene límite por IP.

Las tres reglas salen de defectos reales encontrados al escribir la prueba:

- **Dos rutas de administración** (`/api/admin/observability` y
  `/api/admin/product-reviews`) tenían la comprobación de administrador
  **copiada en línea** en vez de usar el helper. Funcionaban, pero una regla de
  autorización duplicada es donde se cuela el fallo cuando una copia se queda
  atrás. Hoy ambas delegan en `isPremiumJoAdmin()`.
- **`/api/affiliate/applications`** aceptaba escrituras anónimas **sin límite por
  IP**: una vía directa para llenar la colección de solicitudes. Hoy usa
  `enforceIpRateLimit` con `RATE_LIMITS.publicWrite`.

### Comparaciones en tiempo constante

`hasValidCronSecret` compara con `safeEqual`, una comparación byte a byte sin
salida temprana. Sin eso, un atacante puede deducir el secreto midiendo cuánto
tarda la respuesta.

---

## 2. Secretos

### Lo que está garantizado

- **`.env*` está ignorado** por git salvo `.env.example`, que se versiona a
  propósito como plantilla.
- **`.env.example` no contiene valores reales**: lo comprueba
  `npm run verify:env-example` en cada ejecución de `npm run validate` y de CI.
  El guardarraíl se validó como debe validarse un guardarraíl: copiando cuatro
  secretos reales al fichero y confirmando que los señalaba.
- **Las transcripciones de `.specstory/` no contienen claves.** Se buscaron
  valores con **forma de clave** —`sk_live_` seguido de 20 caracteres, `pk_live_`,
  `AIza…`, `mongodb+srv://…`— y hay **cero coincidencias**. Lo que aparece son
  nombres de variable citados en conversación.

### Lo que sigue pendiente

- **Hubo secretos en commits antiguos**: un `KINDE_CLIENT_ID` en el mensaje del
  commit `4a2f3055` y, antes de `2bf9a846`, un `.env.example` con 54 valores
  idénticos a `.env`, incluida una clave `sk_live_` de Clerk. Se limpiaron de
  HEAD, **no del historial**.
- **Borrar de HEAD no borra del historial.** La única corrección real es
  **rotar**. `npm run verify:rotation` compara lo que se usa hoy contra todo lo
  que alguna vez estuvo en el historial; el procedimiento está en
  [rotacion-de-credenciales.md](rotacion-de-credenciales.md).
- **Estado de la rotación: sin verificar.** Hasta que se complete, el repositorio
  no debería compartirse con terceros: ceder el historial cede esas credenciales.

### Un script que filtraba credenciales

`scripts/ts/test-mongo-auth.ts` hacía `console.log` de usuario, contraseña y
cadena de conexión —comentados, listos para descomentar—. stdout acaba en los
registros de CI. Hoy informa de **presencia y longitud**, nunca del valor.

---

## 3. Protección del producto de pago

El catálogo contiene prompts de pago. Estuvo servido desde `public/`, es decir,
**descargable**. Tres intentos de arreglo fallaron antes de dar con la regla:

| Intento | Por qué falló |
|---|---|
| Lista blanca de 8 nombres de fichero | Una auditoría encontró **9 ficheros más** con producto de pago que nadie había añadido |
| Bloquear `*.json` | `precompress-static.mjs` genera `.br` y `.gz`: `*.json.br` quedaba abierto |
| `headers()` con dos lookaheads | Se comportó **al revés**: aplicaba a `/api/*`, que estaba excluido |

**Regla vigente**: bloquear por directorio, cubrir las tres formas del fichero, y
que el test **recorra el directorio real** en vez de enumerar lo que proteger.
Los tests que enumeran caducan; los que recorren, no.

---

## 4. Cabeceras y CSP

`src/lib/security-headers.ts` fija las cabeceras base y la política de contenido.
Dos políticas mutuamente excluyentes:

- la de la aplicación, que permite Clerk, Stripe, analítica y publicidad;
- la de las demos (`/webpages/*`), que necesita cdnjs, jsDelivr y Google Fonts
  porque las páginas generadas cargan `three.js` y `gsap` desde CDN.

Si ambas coincidieran, el navegador aplicaría la **intersección** y las demos
dejarían de cargar. El lookahead negativo del `source` las separa.

La CSP sale en modo `Report-Only` hasta que `CSP_ENFORCE=true`. Las violaciones
llegan a `/api/csp-report`.

---

## 5. Validación de entrada

Las rutas sanean el cuerpo antes de escribir: recorte de longitud, listas
blancas de valores, tope de elementos. Dos ejemplos que muestran el criterio:

- `/api/component-library` recorta nombres, identificadores y tamaños de lista
  con los límites de `LIBRARY_LIMITS`: sin eso, un `PUT` manipulado dejaría un
  documento de megabytes en la cuenta.
- `/api/editor/projects` rechaza documentos con más de 2.000 nodos y verifica que
  la raíz exista dentro del árbol.

Toda consulta que lee o escribe datos de una persona **filtra por `userId` en el
propio filtro**, no después: nadie puede tocar la biblioteca ni el proyecto de
otra cuenta.

---

## 6. Dependencias

**Estado a 12 de septiembre de 2026**: `npm audit --omit=dev` reporta **63
vulnerabilidades en producción — 0 críticas y 7 altas**. Partíamos de 88, con 4
críticas y 23 altas.

| | Críticas | Altas | Moderadas | Bajas | Total |
|---|---|---|---|---|---|
| Antes | 4 | 23 | 59 | 2 | 88 |
| Ahora | **0** | **7** | 53 | 3 | **63** |

Qué se corrigió:

- `next` 15.5.9 → **15.5.25** (sin cambio de versión mayor): cierra la crítica de
  denegación de servicio en el optimizador de imágenes.
- `sharp` → **0.35.4**: CVE heredados de libvips.
- `recharts` **3.0.0-alpha.9 → 3.10.1**: saca una versión *alpha* de producción y
  elimina `lodash`, cuya vulnerabilidad no tiene corrección publicada.
- `postcss` → **8.5.28**, unificado con `overrides: {"postcss": "$postcss"}`.
- Se elimina `firebase-admin`, **dependencia directa que ningún módulo importaba**
  (solo se usa el SDK cliente `firebase` en `src/lib/firebase.ts`).
- `overrides` dirigidos para `handlebars` 4.7.9, `protobufjs` 7.6.6,
  `websocket-driver` 0.7.5, `node-forge` 1.4.0, `js-cookie` 3.0.8, `nanoid`
  3.3.19, `fast-uri`, `form-data`, `@grpc/grpc-js`, `qs`, `body-parser` y
  `path-to-regexp`.

Los `overrides` usan la forma `"paquete@<rango>": "versión"` en lugar de un
override global, porque `picomatch`, `form-data` y `@grpc/grpc-js` conviven en
dos versiones mayores distintas en el árbol y un override global habría degradado
al consumidor moderno.

### Lo que queda, y por qué no se toca

**Las 63 restantes cuelgan todas del árbol de `genkit`**, y las 7 altas son la
cadena de OpenTelemetry. `@genkit-ai/core` fija `@opentelemetry/* ~1.25` y las
correcciones solo existen en **OpenTelemetry 2.x**. Se comprobó que
`genkit@1.42.0`, la versión más reciente, **sigue fijando `~1.25.0`**: no es
software desactualizado, es que la corrección no existe aguas arriba.

```bash
npm view @genkit-ai/core@latest dependencies --json | grep opentelemetry
```

Forzar OpenTelemetry 2.x bajo genkit compila, pero no puede verificarse aquí que
la instrumentación siga funcionando en ejecución. Se revisa en cada actualización
de genkit.

**No se aplicó `npm audit fix --force`**: proponía `genkit@0.5.17`, un
**retroceso** desde 1.20.0 que inutilizaría la generación con IA. `npm audit`
presenta como corrección cualquier versión fuera del rango vulnerable, incluidas
las anteriores.

---

## 7. Cómo verificar todo lo anterior

```bash
# Matriz de acceso y sus reglas
node scripts/mjs/build-route-access-matrix.mjs
node --import tsx --test tests/unit/route-access-matrix.test.ts

# Secretos
npm run verify:env-example
npm run verify:rotation
grep -rhoE 'sk_live_[A-Za-z0-9]{20,}' .specstory | sort -u | wc -l   # debe ser 0

# Producto de pago accesible
node --import tsx --test tests/unit/catalog-source-exposure.test.ts

# Dependencias
npm audit --omit=dev
```

## 8. Reportar un problema

Este es un repositorio privado de un producto en producción. Si encuentras un
fallo de seguridad, **no abras una incidencia pública**: escribe a la dirección
de contacto del sitio con los pasos para reproducirlo.
