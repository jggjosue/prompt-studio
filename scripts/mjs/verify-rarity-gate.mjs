import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const configPath = resolve(root, 'config/rarity-gate.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const failures = [];

function requireFile(path, label) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    failures.push(`${label}: missing ${path}`);
  }
}

for (const evidence of config.requiredEvidence) {
  requireFile(evidence.implementation, `${evidence.id} implementation`);
  requireFile(evidence.workflow, `${evidence.id} product workflow`);
  requireFile(evidence.test, `${evidence.id} verification`);
  requireFile(evidence.documentation, `${evidence.id} documentation`);
}

function filesUnder(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return [];
  if (statSync(absolute).isFile()) return [absolute];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(absolute, entry.name);
    return entry.isDirectory() ? filesUnder(entryPath.slice(root.length + 1)) : [entryPath];
  });
}

for (const scanRoot of config.templateMarkerScan) {
  for (const file of filesUnder(scanRoot)) {
    const contents = readFileSync(file, 'utf8');
    for (const marker of config.forbiddenTemplateMarkers) {
      if (contents.includes(marker)) failures.push(`obsolete template marker "${marker}" in ${file.slice(root.length + 1)}`);
    }
  }
}

const evidenceCount = config.requiredEvidence.length;
if (failures.length) {
  console.error(`Rarity readiness gate failed with ${failures.length} finding(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Rarity readiness gate passed: ${evidenceCount}/${evidenceCount} custom subsystems have implementation, product workflow, tests, and documentation.`);
  console.log(`External Rarity QC must report score >= ${config.minimumExternalScore}; this command does not fabricate that external score.`);
}
