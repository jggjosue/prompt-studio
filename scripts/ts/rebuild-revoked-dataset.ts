import { DATASET_NAMES, type DatasetName } from '../../src/lib/dataset-object-contract';
import { rebuildDatasetAfterRevocation } from '../../src/lib/datasets/rebuild-after-revocation';

const [datasetArg, version, supersedes] = process.argv.slice(2);
if (!datasetArg || !DATASET_NAMES.includes(datasetArg as DatasetName) || !/^v\d{6}$/.test(version ?? '') || !/^v\d{6}$/.test(supersedes ?? '')) {
  console.error('Usage: npm run dataset:rebuild-revoked -- <dataset> <new-v000002> <supersedes-v000001>');
  process.exit(2);
}
rebuildDatasetAfterRevocation({ dataset: datasetArg as DatasetName, version, supersedes })
  .then((result) => console.log(JSON.stringify({ ok: true, dataset: result.dataset, version: result.version, supersedes: result.supersedes, revokedSourceRecords: result.revokedSourceRecords }, null, 2)))
  .catch((error) => { console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' })); process.exit(1); });
