import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Diagnóstico de la conexión a Mongo.
 *
 * Informa de **presencia**, nunca del valor: este script llegó a imprimir
 * usuario, contraseña y cadena de conexión en claro por stdout, que es el sitio
 * exacto donde acaban en los registros de CI.
 */
const presencia = (nombre: string) => {
  const valor = process.env[nombre];
  return `${nombre}: ${valor ? `definido (${valor.length} caracteres)` : 'AUSENTE'}`;
};

console.log(presencia('MONGODB_USERNAME'));
console.log(presencia('MONGODB_PASSWORD'));
console.log(presencia('MONGODB_URI'));
