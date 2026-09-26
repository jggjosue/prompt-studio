import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import unusedImports from 'eslint-plugin-unused-imports';

/**
 * Configuración de ESLint (flat config).
 *
 * El proyecto no tenía ninguna: `npm run lint` ejecutaba `next lint`, retirado
 * en Next 15.5, que abría un asistente interactivo y se quedaba esperando. Sin
 * análisis estático, los imports muertos y las variables sin usar no daban aviso
 * —uno de ellos llegó a romper el HMR en desarrollo—.
 *
 * Criterio de las reglas: solo lo que señala defectos reales. Nada de estilo
 * —de eso se ocupa el formateador—, porque una regla que solo genera ruido
 * termina desactivada y se lleva por delante a las que sí importaban.
 */
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  {
    // Artefactos y datos: ni se analizan ni deben fallar el lint.
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      '.specstory/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
      'src/data/**',
      // Generated/static demo corpus: validated by dedicated catalog/data checks.
      // Linting hundreds of copied micro-sites duplicates identical Next link warnings.
      'src/components/demos/**',
    ],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      /**
       * Imports muertos. Se separa de `no-unused-vars` porque esta regla **sí es
       * autocorregible**: `eslint --fix` los quita manipulando el AST, que es la
       * única forma segura de hacerlo. (Intentarlo con expresiones regulares
       * destroza literales de objeto y cláusulas `import type`: probado.)
       *
       * Era el fallo que ya ocurrió: un import que deja de usarse rompió el
       * grafo de módulos en caliente.
       */
      'unused-imports/no-unused-imports': 'error',

      /**
       * Variables y parámetros sin usar. No se autocorrige —borrar una variable
       * puede cambiar el comportamiento si su inicialización tiene efectos—, así
       * que se revisa a mano.
       *
       * `argsIgnorePattern` deja pasar los parámetros que se conservan por
       * firma (`_event`), que son legítimos.
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      /**
       * `any` apaga el comprobador de tipos justo donde más falta hace. Se avisa
       * en vez de romper: hay `any` heredados y convertirlos todos de golpe
       * mezclaría un refactor grande con el arranque del linting.
       */
      '@typescript-eslint/no-explicit-any': 'warn',

      /** Depuración olvidada. `console.warn` y `console.error` sí son legítimos. */
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      /** Comparaciones laxas que ocultan errores de tipo. */
      eqeqeq: ['error', 'smart'],
    },
  },

  {
    // Los scripts son herramientas de línea de comandos: ahí `console.log` es la salida.
    files: ['scripts/**/*.{mjs,js,ts}', 'tests/**/*.{ts,mjs}', '*.js', '*.mjs'],
    rules: { 'no-console': 'off' },
  },

  {
    /**
     * Configuración de herramientas (Tailwind, PostCSS). Cargan sus plugins con
     * `require()` porque así los resuelve Node en tiempo de ejecución; pedirles
     * sintaxis de módulos ES rompería la carga.
     */
    files: ['*.config.{ts,js,mjs}', 'tailwind.config.ts', 'postcss.config.mjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },

  {
    /**
     * Scripts CommonJS heredados. `require()` es correcto ahí: son utilidades
     * que se ejecutan con `node fichero.js`, no módulos de la aplicación.
     * Marcar su sintaxis como error sería pedirles que dejen de ser lo que son.
     */
    files: ['**/*.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
