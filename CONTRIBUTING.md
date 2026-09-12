# Contribuir

## Antes de escribir código

```bash
nvm use            # Node >= 22.11 (ver .nvmrc / package.json engines)
npm ci
cp .env.example .env.local   # rellena al menos MONGODB_URI y las claves de Clerk
npm run dev        # http://localhost:3048
```

Lee [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) antes del primer cambio no
trivial. Explica dónde vive cada cosa y, sobre todo, las **violaciones de capa
conocidas**, que están documentadas a propósito para que nadie las replique
pensando que son el patrón.

## Antes de abrir un PR

```bash
npm run validate
```

Ejecuta lint, typecheck, cobertura, `verify:env-example` y `cache:audit`. **Debe
salir en 0.** CI ejecuta lo mismo más el build y las pruebas de navegador; abrir
un PR que no pasa `validate` en local solo desplaza el fallo.

## Reglas que el pipeline hace cumplir

No son convenciones: si las rompes, CI falla.

1. **Toda ruta de API necesita un mecanismo de acceso o una justificación
   escrita.** `tests/unit/route-access-matrix.test.ts` recorre `src/app/api/**` y
   exige que cada ruta declare uno de los 8 mecanismos detectados o figure en
   `PUBLICAS_JUSTIFICADAS` con una justificación de 20 caracteres como mínimo.
   Si añades una ruta nueva, regenera la matriz:

   ```bash
   node scripts/mjs/build-route-access-matrix.mjs
   ```

   Esa prueba ya ha encontrado dos fallos reales de seguridad. Trátala como un
   contrato, no como un trámite.

2. **Una escritura pública debe limitarse por IP.** `enforceIpRateLimit` con
   `RATE_LIMITS.publicWrite`.

3. **`/api/admin/**` comprueba rol de administrador**, no solo que haya sesión.

4. **`.env.example` cubre lo que el código lee** (`verify:env-example`) y contiene
   **solo marcadores de posición**. Nunca un valor real.

5. **Toda respuesta declara política de caché** (`cache:audit`).

## Estilo

- TypeScript `strict`. No añadas `any` para cerrar un error de tipos; cierra el
  error.
- `npm run lint:fix` antes de commitear. Hoy hay 0 errores y 222 avisos; **no
  subas el número de errores**.
- Nombres y comentarios en español, igual que el código existente.
- Comenta el *porqué*, no el *qué*. Si un comentario describe lo que la línea ya
  dice, sobra.

## Pruebas

```bash
npm test                     # 325 unitarias + 2 de datos
npm run test:coverage        # informe lcov honesto en coverage/
```

La cobertura de líneas sobre `src/` es del 5,56 %: 62 archivos medidos de 680.
Ese número es real y está explicado en [docs/TESTING.md](docs/TESTING.md). Si
tocas un módulo sin pruebas, añadirlas sube ese número de verdad; no añadas
pruebas que solo ejecutan código sin comprobar nada.

## Commits

Convencionales: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
Un commit, un cambio. No mezcles un renombrado masivo con un cambio de
comportamiento: hace la revisión imposible.
