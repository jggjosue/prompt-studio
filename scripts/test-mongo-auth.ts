import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CONEXION = process.env.MONGODB_URI;

//console.log(`Username: [${MONGODB_USERNAME}]`);
//console.log(`Password: [${MONGODB_PASSWORD}]`);
//console.log(`Conexion: [${MONGODB_CONEXION}]`);
