import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertInside, root } from './lib/resources.mjs';

const previewRoot = path.join(root, '.preview');
fs.mkdirSync(previewRoot, { recursive: true });
const first = fs.mkdtempSync(path.join(previewRoot, 'determinism-a-'));
const second = fs.mkdtempSync(path.join(previewRoot, 'determinism-b-'));
assertInside(previewRoot, first);
assertInside(previewRoot, second);

function build(destination) {
  const result = spawnSync(process.execPath, ['scripts/build-resources.mjs', '--drafts', '--output', destination], {
    cwd: root, encoding: 'utf8'
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Resource build failed');
}

function files(directory) {
  return fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
    .sort();
}

try {
  build(first);
  build(second);
  const firstFiles = files(first);
  const secondFiles = files(second);
  if (firstFiles.join('\n') !== secondFiles.join('\n')) throw new Error('Generated file lists differ');
  for (const relativePath of firstFiles) {
    const a = fs.readFileSync(path.join(first, relativePath));
    const b = fs.readFileSync(path.join(second, relativePath));
    if (!a.equals(b)) throw new Error(`Generated output differs: ${relativePath}`);
  }
  console.log(`Deterministic resource build verified across ${firstFiles.length} generated file(s).`);
} finally {
  fs.rmSync(first, { recursive: true, force: true });
  fs.rmSync(second, { recursive: true, force: true });
}
