#!/usr/bin/env node
/**
 * Sustituye el índice único `userId_1` de `user_profiles` por uno parcial.
 *
 * POR QUÉ: la colección la comparten dos modelos. `UserProfile` guarda perfiles
 * con `userId`, y `NewUser` guarda correos de personas sin cuenta (los leads de
 * las descargas gratuitas), que se insertan sin ese campo. MongoDB interpreta el
 * campo ausente como `null`, así que con un índice único normal solo el primer
 * lead entra y todos los siguientes fallan con E11000. En producción eso hacía
 * que `/api/new-users` devolviera 500 en cada captura de correo, y el cliente lo
 * ignoraba: los leads se perdían sin dejar rastro visible.
 *
 * QUÉ HACE: elimina `userId_1` y lo recrea con
 * `partialFilterExpression: { userId: { $type: 'string' } }`, de modo que la
 * unicidad solo aplica a los perfiles reales.
 *
 * SEGURIDAD: no borra ni modifica ningún documento, solo índices. Entre el
 * borrado y la creación hay una ventana de segundos sin unicidad sobre `userId`;
 * en ese hueco un alta duplicada de Clerk podría colarse. Es un riesgo pequeño y
 * preferible al fallo permanente, pero conviene ejecutarlo en horas de poco
 * tráfico.
 *
 * USO:
 *   node scripts/fix-user-profiles-index.mjs            # solo inspecciona
 *   node scripts/fix-user-profiles-index.mjs --confirm  # aplica el cambio
 */

import mongoose from 'mongoose';
import nextEnv from '@next/env';

/**
 * Carga el entorno igual que lo hace Next.
 *
 * `node` a secas no lee ningún `.env`, y el patrón con `dotenv` que usan otros
 * scripts de este repositorio solo carga `.env`, no `.env.local`. Como la
 * cadena de conexión vive en `.env.local` —que además tiene prioridad sobre
 * `.env` en Next—, un script que use dotenv puede acabar apuntando a **otra
 * base de datos** que la aplicación. `loadEnvConfig` respeta ese mismo orden,
 * así que el script ve exactamente lo que ve la app.
 */
nextEnv.loadEnvConfig(process.cwd());

const COLLECTION = 'user_profiles';
const INDEX_NAME = 'userId_1';
const PARTIAL = { userId: { $type: 'string' } };

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
if (!uri) {
  console.error('Falta MONGODB_URI. Debe estar en .env.local o .env, o exportada en el entorno.');
  process.exit(1);
}

/** Qué base se va a tocar, sin revelar credenciales. */
function describeTarget(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const database = parsed.pathname.replace(/^\//, '') || '(por defecto)';
    return `${parsed.hostname} · base ${database}`;
  } catch {
    return '(cadena de conexión no interpretable)';
  }
}

const confirm = process.argv.includes('--confirm');

async function main() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection(COLLECTION);

  const indexes = await collection.indexes();
  const current = indexes.find(index => index.name === INDEX_NAME);

  console.log(`Servidor: ${describeTarget(uri)}`);
  console.log(`Colección: ${COLLECTION}`);
  console.log(`Documentos: ${await collection.countDocuments()}`);
  const leads = await collection.countDocuments({ userId: { $exists: false } });
  const nullIds = await collection.countDocuments({ userId: null });
  console.log(`Sin userId (leads): ${leads}   con userId null: ${nullIds}`);

  if (!current) {
    console.log(`\nNo existe el índice ${INDEX_NAME}.`);
  } else {
    console.log(`\nÍndice actual: ${JSON.stringify(current)}`);
    const alreadyPartial = Boolean(current.partialFilterExpression);
    if (alreadyPartial) {
      console.log('Ya es parcial: no hay nada que hacer.');
      await mongoose.disconnect();
      return;
    }
  }

  if (!confirm) {
    console.log('\nModo inspección. Vuelve a ejecutarlo con --confirm para aplicar:');
    console.log(`  1. dropIndex('${INDEX_NAME}')`);
    console.log(`  2. createIndex({ userId: 1 }, { unique: true, partialFilterExpression: ${JSON.stringify(PARTIAL)} })`);
    await mongoose.disconnect();
    return;
  }

  // Antes de quitar la unicidad, comprobar que no hay duplicados reales que
  // impidan recrear el índice: si los hay, createIndex fallaría y la colección
  // quedaría sin unicidad ninguna.
  const duplicates = await collection.aggregate([
    { $match: { userId: { $type: 'string' } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray();

  if (duplicates.length) {
    console.error(`\nHay ${duplicates.length} userId duplicados. Resuélvelos antes de continuar:`);
    for (const duplicate of duplicates.slice(0, 10)) console.error(`  ${duplicate._id} × ${duplicate.count}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (current) {
    await collection.dropIndex(INDEX_NAME);
    console.log(`\nÍndice ${INDEX_NAME} eliminado.`);
  }
  await collection.createIndex({ userId: 1 }, { unique: true, partialFilterExpression: PARTIAL });
  console.log('Índice parcial creado.');
  console.log(`\nÍndices finales: ${JSON.stringify(await collection.indexes())}`);

  await mongoose.disconnect();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
