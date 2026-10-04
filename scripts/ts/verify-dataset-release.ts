/**
 * npm run dataset:verify -- <dataset> <vNNNNNN>
 *
 * Verifies a published release before it is used for training: _SUCCESS
 * present, every artifact matches checksums.json, manifest consistent.
 * Exit code 0 only when valid.
 */
import { isDatasetName, isDatasetVersion } from '../../src/lib/dataset-object-contract';
import { listDatasetVersions, verifyDatasetRelease } from '../../src/lib/datasets/retrieval';
import { trainingObjectStore } from '../../src/lib/training/object-store';

const [dataset, version] = process.argv.slice(2);
if (!isDatasetName(dataset) || (version !== undefined && !isDatasetVersion(version))) {
  console.error('Usage: npm run dataset:verify -- <dataset> [v000001]   (without a version: list released versions)');
  process.exit(2);
}

(async () => {
  const store = trainingObjectStore();
  if (!version) {
    console.log(JSON.stringify({ dataset, versions: await listDatasetVersions(store, dataset, { includeIncomplete: true }) }, null, 2));
    return;
  }
  const result = await verifyDatasetRelease(store, dataset, version);
  console.log(JSON.stringify({ dataset, version, valid: result.valid, issues: result.issues, checksums: result.checksums, counts: result.manifest?.counts ?? null }, null, 2));
  process.exit(result.valid ? 0 : 1);
})().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }));
  process.exit(1);
});
