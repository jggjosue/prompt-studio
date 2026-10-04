/**
 * Side-effect import for tests that load modules using connectToDatabase().
 * Must be the first import of the test file (CommonJS preserves import order).
 */
import { fakeMongoConnection } from './fake-mongo';

fakeMongoConnection();
process.env.CLOUDFLARE_R2_BUCKET_NAME ||= 'prompt-studio-media';
