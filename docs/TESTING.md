# Pruebas automatizadas

## Cómo está montado

El proyecto usa el **ejecutor de pruebas nativo de Node** (`node --test`), sin
Jest ni Vitest. La razón es concreta: la lógica de negocio vive en módulos puros
de `src/lib`, que se importan y se prueban sin DOM ni transpilación adicional
—`tsx` resuelve TypeScript en el momento—. Añadir un framework completo habría
supuesto configuración, dependencias y un segundo sistema de módulos sin
resolver ningún problema que hoy exista.

Tres niveles, cada uno con su propósito:

| Nivel | Dónde | Qué cubre | Cómo se ejecuta |
|---|---|---|---|
| **Unitarias** | `tests/unit/*.test.ts` | Reglas de negocio, transformaciones, autorización, contratos de API a nivel de código fuente | `node --import tsx --test` |
| **Datos** | `tests/data/*.test.mjs` | Integridad del catálogo: JSON válido, identificadores únicos, medios existentes | `node --test` |
| **Extremo a extremo** | `tests/e2e/*.spec.ts` | Recorridos reales en navegador, accesibilidad por teclado y presupuestos de rendimiento | Playwright |

## Comandos

```bash
npm test                 # unitarias + datos
npm run test:unit        # solo unitarias
npm run test:data        # solo integridad del catálogo
npm run test:coverage    # unitarias + datos + informe lcov
npm run test:e2e         # Playwright (requiere PLAYWRIGHT_BASE_URL)
npm run test:e2e:performance   # Core Web Vitals y presupuestos de red
npm run validate         # lint + tipos + cobertura + .env.example + caché
```

Para medir contra un despliegue real:

```bash
PLAYWRIGHT_BASE_URL=https://www.prompstudio.com npm run test:e2e:performance
```

## Cobertura

`npm run test:coverage` produce **`coverage/lcov.info`**, el formato que leen
Codecov, SonarQube y los evaluadores de repositorios.

El informe lo genera [`scripts/mjs/build-coverage-report.mjs`](../scripts/mjs/build-coverage-report.mjs),
que existe por dos motivos que el flag nativo no resuelve:

1. **Las pruebas corren en dos procesos** (unitarias con el cargador `tsx`, datos
   sin él). Cada uno escribe su propio lcov y el segundo pisaría al primero, así
   que se concatenan.
2. **`--experimental-test-coverage` solo contabiliza los ficheros que los tests
   cargan.** Medido sobre este repositorio: 62 de 676 módulos. Informar de un
   93 % sobre esa muestra sería engañoso, así que el script **completa el informe
   con los módulos que ningún test importa**, declarados con cero líneas
   cubiertas.

Resultado a 11 de septiembre de 2026:

```
Cobertura de líneas sobre src/: 5,48 % (4.290/78.351)
  ficheros con cobertura medida:            62
  ficheros sin ningún test que los cargue: 614
```

Esa cifra es baja y es la real. La anterior —93,87 %— medía solo la porción
favorable.

### Umbral

```bash
COVERAGE_MIN=10 npm run test:coverage    # sale con código 1 por debajo del 10 %
```

El umbral se pasa por variable de entorno en lugar de fijarlo en el código para
poder subirlo en CI a medida que sube la cobertura, sin tocar el script.

## Qué se prueba y por qué

Las pruebas están escritas alrededor de lo que **rompe el negocio si falla**, no
de lo que es fácil de cubrir:

| Área | Ejemplos de lo comprobado |
|---|---|
| **Autorización** | Que el constructor visual exija cuenta **y** plan en el servidor; que las rutas de API devuelvan 401 y 403; que las consultas filtren por `userId` |
| **Comercio** | Comisiones de afiliado, retención por ventana de reembolso, validación de compras, precios de generación |
| **Generación con IA** | Contratos de salida, cola de trabajos, suites de evaluación, preferencias humanas, calidad por proveedor |
| **Editor visual** | Reglas de anidamiento, ciclos al mover un nodo dentro de sí mismo, herencia de estilos por breakpoint, ida y vuelta completa de deshacer/rehacer |
| **Catálogo** | Que las fuentes de pago no queden accesibles públicamente, integridad de identificadores, procedencia de activos |
| **Interfaz** | Recorridos de usuario, navegación por teclado, presupuestos de Core Web Vitals |

Un principio que se aplica y conviene explicitar: **verificar que la prueba
detecta, no solo que pasa**. El guardarraíl de `.env.example` se validó copiando
cuatro secretos reales al fichero y comprobando que los señalaba.

## Organización

```
tests/
  unit/     *.test.ts   — una prueba por módulo o por contrato
  data/     *.test.mjs  — integridad de los catálogos versionados
  e2e/      *.spec.ts   — recorridos con Playwright
```

Los nombres describen el comportamiento esperado, en español, tal y como se lee
en la salida del ejecutor: `la API conserva identidades privadas y evita el
patrón N+1`, `un drop con índices imposibles no rompe la lista`.

## Requisitos

- **Node ≥ 22.11** (ver `.nvmrc`). `preinstall` lo comprueba.
- No mezclar instalaciones arm64 y x64 en el mismo `node_modules`: el binario de
  SWC deja de cargar.
- Playwright necesita su navegador: `npx playwright install chromium`.

## Lo que falta

Con 614 módulos sin ninguna prueba que los cargue, las prioridades están claras y
en este orden:

1. Módulos de negocio ya medidos pero flojos: `component-purchase-validation`
   (23 %), `generation-pricing` (49 %), `affiliate` (61 %).
2. Rutas de API: hoy se comprueban a nivel de código fuente (que llaman a
   `auth()`, que filtran por `userId`), no ejecutándolas.
3. Componentes de React: sin pruebas de render.
