import { DATASET_NAMES, type DatasetName } from '../../src/lib/dataset-object-contract';
import { runDatasetRelease } from '../../src/lib/datasets/release-job';

const [datasetArg, version] = process.argv.slice(2);
if (!datasetArg || !DATASET_NAMES.includes(datasetArg as DatasetName) || !/^v\d{6}$/.test(version ?? '')) {
  console.error('Usage: npm run dataset:release -- <dataset> <v000001>');
  console.error(`Datasets: ${DATASET_NAMES.join(', ')}`);
  process.exit(2);
}

runDatasetRelease({ dataset: datasetArg as DatasetName, version })
  .then((result) => {
    console.log(JSON.stringify({ ok: true, dataset: result.dataset, version: result.version, keys: result.keys }, null, 2));
  })
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' }));
    process.exit(1);
  });
