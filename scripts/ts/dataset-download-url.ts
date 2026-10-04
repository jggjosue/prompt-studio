/**
 * npm run dataset:url -- <dataset> <vNNNNNN> <artifact> [seconds<=900]
 *
 * Prints a short-lived presigned GET URL for one verified artifact of a
 * complete release. The bucket stays private.
 */
import { DATASET_RELEASE_FILES, type DatasetReleaseFile, isDatasetName, isDatasetVersion } from '../../src/lib/dataset-object-contract';
import { getDatasetDownloadUrl } from '../../src/lib/datasets/retrieval';
import { trainingObjectStore } from '../../src/lib/training/object-store';

const [dataset, version, artifact, seconds] = process.argv.slice(2);
if (!isDatasetName(dataset) || !isDatasetVersion(version) || !(DATASET_RELEASE_FILES as readonly string[]).includes(artifact ?? '')) {
  console.error('Usage: npm run dataset:url -- <dataset> <v000001> <train.jsonl|validation.jsonl|test.jsonl|manifest.json|checksums.json|DATASET_CARD.md> [seconds]');
  process.exit(2);
}

getDatasetDownloadUrl(trainingObjectStore(), dataset, version, artifact as DatasetReleaseFile, seconds ? Number(seconds) : 300)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }));
    process.exit(1);
  });
