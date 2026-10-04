/**
 * npm run dataset:release -- <dataset> <vNNNNNN> [--supersedes vNNNNNN] [--allow-empty]
 *
 * Builds and publishes an immutable dataset release to the private training
 * bucket (see src/lib/datasets/release.ts). Prints the result as JSON on
 * stdout; metrics go to stderr.
 */
import { DATASET_NAMES, isDatasetName, isDatasetVersion } from '../../src/lib/dataset-object-contract';
import { runDatasetRelease } from '../../src/lib/datasets/release';
import connectToDatabase from '../../src/lib/mongoose';
import { trainingObjectStore } from '../../src/lib/training/object-store';
import { trainingPseudonymSecret } from '../../src/lib/training/pseudonym';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const [dataset, version] = args.filter((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--supersedes'));
const supersedes = flag('--supersedes') ?? null;
if (!isDatasetName(dataset) || !isDatasetVersion(version) || (supersedes && !isDatasetVersion(supersedes))) {
  console.error('Usage: npm run dataset:release -- <dataset> <v000001> [--supersedes v000000] [--allow-empty]');
  console.error(`Datasets: ${DATASET_NAMES.join(', ')}`);
  process.exit(2);
}

(async () => {
  await connectToDatabase();
  const result = await runDatasetRelease({
    dataset,
    version,
    supersedes,
    allowEmpty: args.includes('--allow-empty'),
    store: trainingObjectStore(),
    pseudonymSecret: trainingPseudonymSecret(),
    env: process.env,
  });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  process.exit(0);
})().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }));
  process.exit(1);
});
