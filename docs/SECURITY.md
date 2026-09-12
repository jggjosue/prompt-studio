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

**Estado a 11 de septiembre de 2026**: `npm audit --omit=dev` reporta **88
vulnerabilidades en producción — 4 críticas y 23 altas**.

Las cadenas afectadas son mayoritariamente transitivas: `@grpc/grpc-js`,
`express`/`body-parser`, `brace-expansion` (ReDoS), y la cadena de
`@genkit-ai/*` con OpenTelemetry.

**Esto está sin resolver** y es la prioridad de seguridad más alta del proyecto.
No se ha aplicado `npm audit fix --force` porque implica cambios mayores en
Genkit, que es el núcleo de la generación con IA: requiere probar cada proveedor
después.

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
