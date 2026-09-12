import { resolveDemoBundle } from '../../src/lib/refactory-bundle';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const _res = await resolveDemoBundle('3d-architecture-portfolio-pro');
    //console.log(res ? 'Success' : 'Returned null');
  } catch (_err) {
    //console.error('ERROR:', err);
  }
}
main();
