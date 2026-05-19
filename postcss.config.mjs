/** @type {import('postcss-load-config').Config} */
const isProd = process.env.NODE_ENV === 'production';

const config = {
  plugins: {
    tailwindcss: {},
    ...(isProd
      ? {
          cssnano: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
              },
            ],
          },
        }
      : {}),
  },
};

export default config;
