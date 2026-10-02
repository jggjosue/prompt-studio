import { stableSplitGroupKey, splitDatasetExamples } from '@/lib/dataset-splitting';

type DatasetExample = {
  exampleId: string;
  provenance?: {
    requestId?: string | null;
    sourceRecordId?: string;
    sourceRecordIds?: string[];
  };
};

export function splitTrainingDataset<T extends DatasetExample>(examples: T[]) {
  return splitDatasetExamples(examples, (example) => stableSplitGroupKey({
    requestId: example.provenance?.requestId ?? null,
    sourceGroupId: example.provenance?.sourceRecordId ?? example.provenance?.sourceRecordIds?.[0] ?? null,
    exampleId: example.exampleId,
  }));
}

export function serializeDatasetSplits<T>(splits: { train: T[]; validation: T[]; test: T[] }) {
  const jsonl = (values: T[]) => values.map((value) => JSON.stringify(value)).join('\n') + (values.length ? '\n' : '');
  return {
    'train.jsonl': jsonl(splits.train),
    'validation.jsonl': jsonl(splits.validation),
    'test.jsonl': jsonl(splits.test),
  };
}
