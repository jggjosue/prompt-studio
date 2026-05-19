export type DemoProjectKind = 'html' | 'react' | 'next';

export type DemoProjectManifest = {
  kind: DemoProjectKind;
  /** Archivos obligatorios en la carpeta R2 (demoUrl). */
  required: string[];
  /** Al menos uno debe existir (además de required). */
  entryAnyOf: string[];
  /** Archivos opcionales informativos. */
  optional: string[];
};

export function getDemoProjectKind(stack: string[] = []): DemoProjectKind {
  const text = stack.join(' ').toLowerCase();
  if (/\bnext(\.js)?\b|nextjs/.test(text)) return 'next';
  if (/\breact\b/.test(text)) return 'react';
  return 'html';
}

export function getDemoProjectManifest(kind: DemoProjectKind): DemoProjectManifest {
  switch (kind) {
    case 'html':
      return {
        kind: 'html',
        required: ['index.html'],
        entryAnyOf: [],
        optional: ['styles.css', 'script.js'],
      };
    case 'react':
      return {
        kind: 'react',
        required: ['package.json'],
        entryAnyOf: [
          'index.html',
          'src/main.tsx',
          'src/main.jsx',
          'src/App.tsx',
          'src/App.jsx',
          'src/index.tsx',
          'src/index.jsx',
          'vite.config.ts',
          'vite.config.js',
        ],
        optional: ['README.md', 'tsconfig.json'],
      };
    case 'next':
      return {
        kind: 'next',
        required: ['package.json'],
        entryAnyOf: [
          'index.html',
          'app/page.tsx',
          'app/page.jsx',
          'app/page.js',
          'pages/index.tsx',
          'pages/index.jsx',
          'pages/index.js',
          'next.config.ts',
          'next.config.js',
          'next.config.mjs',
        ],
        optional: ['README.md', 'tsconfig.json'],
      };
  }
}

/** ¿Se puede abrir en Refactory (HTML estático en el navegador)? */
export function isRefactoryPreviewable(kind: DemoProjectKind): boolean {
  return kind === 'html';
}
