#!/usr/bin/env node
/**
 * Genera un informe de cobertura único en formato lcov.
 *
 * Por qué hace falta un script y no basta el flag:
 *
 * 1. Las pruebas corren en **tres procesos** (unitarias y de integración con el
 *    cargador `tsx`, datos sin él). Cada uno escribe su propio lcov y el segundo
 *    pisaría al primero, así que se concatenan —el formato lo permite: son
 *    registros independientes separados por `end_of_record`—.
 * 2. `--experimental-test-coverage` solo contabiliza los ficheros que los tests
 *    **cargan**. Los que nadie importa no aparecen, y eso convierte un 93 % en
 *    una cifra engañosa. Aquí se completan con los módulos de `src/` que no se
 *    tocaron, declarados con 0 líneas cubiertas, para que el porcentaje sea
 *    sobre el código real y no sobre una muestra favorable.
 *
 * Salida: `coverage/lcov.info` — el formato que leen Codecov, SonarQube y los
 * evaluadores de repositorios.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RAIZ = process.cwd();
const SALIDA = join(RAIZ, 'coverage');

// `--test-coverage-include` existe a partir de Node 22. Con una versión anterior
// Node rechaza la bandera, el informe sale a 0 % y, si las pruebas pasan, la
// validación daría verde sobre una medición inexistente. Mejor fallar aquí.
const [MAYOR, MENOR] = process.versions.node.split('.').map(Number);
if (MAYOR < 22 || (MAYOR === 22 && MENOR < 11)) {
  console.error(
    `Node ${process.versions.node} no admite --test-coverage-include; se necesita >= 22.11 ` +
      '(la versión de .nvmrc). Ejecuta `nvm use` antes de medir la cobertura.'
  );
  process.exit(1);
}
const PARCIALES = ['unit.info', 'integration.info', 'data.info'];

/** Módulos que no son código de aplicación: no deben diluir el porcentaje. */
const EXCLUIDOS = [
  /^src\/data\//,           // catálogo JSON tipado, no lógica
  /\.d\.ts$/,               // declaraciones de tipos
  /^src\/app\/.*\/layout\.tsx$/, // envoltorios sin lógica propia
];

/**
 * Los flags del reporter deben ir **antes** de `--test <ficheros>`: lo que va
 * después de la lista de ficheros lo interpreta Node como más rutas de prueba,
 * no como opciones, y el informe sale vacío sin avisar.
 */
function ejecutar({ previos, ficheros }, destino) {
  mkdirSync(SALIDA, { recursive: true });
  try {
    execFileSync(
      process.execPath,
      [
        ...previos,
        '--test-reporter=lcov',
        `--test-reporter-destination=${join(SALIDA, destino)}`,
        '--test',
        ...ficheros,
      ],
      { stdio: 'inherit', cwd: RAIZ }
    );
    return true;
  } catch {
    // Un test en rojo no debe impedir que se escriba el informe: CI necesita
    // ambas señales, el fallo y la cobertura.
    return false;
  }
}

function listarFuentes(dir, acumulado = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      listarFuentes(ruta, acumulado);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entrada.name)) continue;
    const relativa = relative(RAIZ, ruta);
    if (EXCLUIDOS.some(patron => patron.test(relativa))) continue;
    acumulado.push(relativa);
  }
  return acumulado;
}

function contarLineas(ruta) {
  return readFileSync(join(RAIZ, ruta), 'utf8').split('\n').length;
}

const okUnit = ejecutar(
  {
    previos: ['--experimental-test-coverage', '--test-coverage-include=src/**', '--import', 'tsx', '--import', './scripts/node/server-only-shim.mjs'],
    ficheros: ['tests/unit/*.test.ts'],
  },
  'unit.info'
);
// Antes esto no se ejecutaba en ningún sitio: la carpeta existía con un test
// dentro y ningún script ni job de CI la recogía, así que sus casos pasaban
// —o fallaban— sin que nadie se enterara. Sin este pase, mover pruebas de
// unidad a `tests/integration/` las borraría delcoverage en lugar de
// reclasificarlas.
const okIntegracion = ejecutar(
  {
    previos: ['--experimental-test-coverage', '--test-coverage-include=src/**', '--import', 'tsx', '--import', './scripts/node/server-only-shim.mjs'],
    ficheros: ['tests/integration/*.test.ts'],
  },
  'integration.info'
);
const okData = ejecutar(
  {
    previos: ['--experimental-test-coverage', '--test-coverage-include=src/**'],
    ficheros: ['tests/data/*.test.mjs'],
  },
  'data.info'
);

let combinado = '';
const cubiertos = new Set();
for (const parcial of PARCIALES) {
  let contenido = '';
  try {
    contenido = readFileSync(join(SALIDA, parcial), 'utf8');
  } catch {
    continue;
  }
  for (const linea of contenido.split('\n')) {
    if (linea.startsWith('SF:')) cubiertos.add(linea.slice(3).trim());
  }
  combinado += contenido;
  rmSync(join(SALIDA, parcial), { force: true });
}

// Los módulos que ningún test carga entran con 0 líneas cubiertas.
const sinCubrir = listarFuentes(join(RAIZ, 'src')).filter(f => !cubiertos.has(f));
for (const fichero of sinCubrir) {
  const total = contarLineas(fichero);
  const lineas = Array.from({ length: total }, (_, i) => `DA:${i + 1},0`).join('\n');
  combinado += `TN:\nSF:${fichero}\n${lineas}\nLF:${total}\nLH:0\nend_of_record\n`;
}

writeFileSync(join(SALIDA, 'lcov.info'), combinado);

// Resumen legible, que es lo que se mira en el registro de CI.
let lf = 0;
let lh = 0;
for (const linea of combinado.split('\n')) {
  if (linea.startsWith('LF:')) lf += Number(linea.slice(3));
  if (linea.startsWith('LH:')) lh += Number(linea.slice(3));
}
const porcentaje = lf === 0 ? 0 : (lh / lf) * 100;

console.log(
  `\nCobertura de líneas sobre src/: ${porcentaje.toFixed(2)} % (${lh}/${lf})\n` +
    `  ficheros con cobertura medida: ${cubiertos.size}\n` +
    `  ficheros sin ningún test que los cargue: ${sinCubrir.length}\n` +
    `  informe: coverage/lcov.info`
);

if (!okUnit || !okIntegracion || !okData) {
  console.error('\nHubo pruebas en rojo: el informe se ha escrito igualmente.');
  process.exitCode = 1;
}

// Cero ficheros medidos no es "0 % de cobertura": es que la medición no llegó a
// ocurrir. Sin esta guarda, un fallo del recolector pasa por un informe válido.
if (cubiertos.size === 0) {
  console.error(
    '\nNingún fichero llegó a medirse: el recolector de cobertura no produjo datos. ' +
      'Esto no es un 0 % real; revisa la salida de las pruebas antes de fiarte del informe.'
  );
  process.exitCode = 1;
}

const MINIMO = Number(process.env.COVERAGE_MIN ?? '0');
if (MINIMO > 0 && porcentaje < MINIMO) {
  console.error(`\nCobertura ${porcentaje.toFixed(2)} % por debajo del mínimo exigido (${MINIMO} %).`);
  process.exitCode = 1;
}
