#!/usr/bin/env node
/**
 * Genera `src/data/review-aggregates.json` con la nota media y el número de
 * reseñas publicadas de cada producto.
 *
 * POR QUÉ UN FICHERO Y NO UNA CONSULTA EN LA PÁGINA: las fichas de producto son
 * 830 páginas estáticas. Leer la base en cada una añadiría 830 consultas de
 * agregación a cada build y obligaría a introducir ISR, que este proyecto no usa
 * en ninguna página. Con una sola consulta agrupada aquí, el build sigue siendo
 * estático y sin dependencia de la base de datos.
 *
 * CONSECUENCIA: la nota del marcado se congela hasta el siguiente despliegue. La
 * lista de reseñas que ve el visitante sí se refresca en cliente, así que puede
 * haber una diferencia pequeña entre el número marcado y el visible. Es
 * aceptable —el requisito de Google es que la nota exista y sea visible, no que
 * coincida al decimal— y es el precio de no meter una consulta por página.
 *
 * TOLERANTE A FALLOS: si no hay base de datos disponible escribe un fichero
 * vacío en lugar de romper el build. Sin reseñas no se emite `aggregateRating`,
 * que es exactamente lo correcto: marcar una nota que no existe es spam.
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const OUTPUT = path.join(process.cwd(), 'src/data/review-aggregates.json');

async function main() {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!uri) {
    console.log('[review-aggregates] Sin MONGODB_URI: se escribe un fichero vacío.');
    await writeFile(OUTPUT, JSON.stringify({ generatedAt: null, products: {} }, null, 2) + '\n');
    return;
  }

  let mongoose;
  try {
    mongoose = (await import('mongoose')).default;
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (error) {
    console.warn(`[review-aggregates] No se pudo conectar: ${error.message}. Fichero vacío.`);
    await writeFile(OUTPUT, JSON.stringify({ generatedAt: null, products: {} }, null, 2) + '\n');
    return;
  }

  try {
    const rows = await mongoose.connection.db
      .collection('product_reviews')
      .aggregate([
        // Solo publicadas: lo retenido por moderación no puede mover la nota.
        { $match: { status: 'published' } },
        {
          $group: {
            _id: '$productId',
            ratingCount: { $sum: 1 },
            ratingSum: { $sum: '$rating' },
          },
        },
      ])
      .toArray();

    const products = {};
    for (const row of rows) {
      if (!row._id || !row.ratingCount) continue;
      products[String(row._id)] = {
        ratingValue: Math.round((row.ratingSum / row.ratingCount) * 10) / 10,
        ratingCount: row.ratingCount,
      };
    }

    await writeFile(
      OUTPUT,
      JSON.stringify({ generatedAt: new Date().toISOString(), products }, null, 2) + '\n'
    );
    console.log(`[review-aggregates] ${Object.keys(products).length} productos con reseñas publicadas.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(async error => {
  console.warn(`[review-aggregates] Error: ${error.message}. Se escribe un fichero vacío.`);
  await writeFile(OUTPUT, JSON.stringify({ generatedAt: null, products: {} }, null, 2) + '\n');
});
