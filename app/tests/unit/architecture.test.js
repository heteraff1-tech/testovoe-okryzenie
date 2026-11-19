import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { architectureViolations } from '../lib/architecture.js';
import { sourceFiles, sourceRoot } from '../lib/source.js';

test('source imports respect layer boundaries and experiment isolation', () => {
  const errors = sourceFiles(sourceRoot).flatMap((file) =>
    architectureViolations(readFileSync(file, 'utf8'), file),
  );
  assert.deepEqual(errors, []);
});

test('the architecture check rejects private, sideways and unresolvable imports', () => {
  const inspect = (source, path) => architectureViolations(source, resolve(sourceRoot, path));
  assert.equal(inspect("import '@/features/search/index.js'", 'pages/home/screen.js').length, 0);
  assert.match(
    inspect("import '@/features/search/model/state.js'", 'pages/home/screen.js')[0],
    /index\.js/,
  );
  assert.match(
    inspect("export * from '../../pages/home/screen.js'", 'shared/ui/button.js')[0],
    /изоляцию/,
  );
  assert.match(
    inspect("import('../second/model.js')", 'experiments/first/model.js')[0],
    /изоляцию/,
  );
  assert.match(inspect('import(path)', 'features/search/index.js')[0], /статический путь/);
  assert.match(
    inspect("@use '../../features/search/theme';", 'shared/ui/button.scss')[0],
    /изоляцию/,
  );
  assert.equal(
    inspect('// import(path)\nconst text = "import(path)";', 'shared/ui/button.js').length,
    0,
  );
});
