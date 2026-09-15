const minimum = [22, 11, 0];
const current = process.versions.node.split('.').map(Number);
const comparison =
  current.map((part, index) => part - minimum[index]).find(value => value !== 0) ?? 0;
const supported = comparison >= 0;

if (!supported) {
  console.error(
    [
      '',
      'Prompt Studio requires Node.js 22.11.0 or newer.',
      'Current version: ' + process.versions.node + '.',
      'Run nvm install and then nvm use before installing dependencies.',
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log('Node.js ' + process.versions.node + ' is supported.');
