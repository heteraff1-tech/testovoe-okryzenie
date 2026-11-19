import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import snapshot from '../../design-system/bootstrap-catalog.json' with { type: 'json' };
import { resolveComponent, searchComponents } from '../../src/shared/design-system/catalog.js';
import { stylesheet } from '../lib/source.js';
import { themeCss } from '../lib/tokens.js';

test('each published Figma key resolves to its own catalog entry and valid Bootstrap primitive', () => {
  const selectors = new Set();
  stylesheet(themeCss).walkRules(({ selector }) => {
    for (const match of selector.matchAll(/\.[\w-]+/g)) selectors.add(match[0]);
  });
  assert(snapshot.components.length > 0);
  assert.equal(
    new Set(snapshot.components.map(({ figmaKey }) => figmaKey)).size,
    snapshot.components.length,
  );
  for (const entry of snapshot.components) {
    assert.match(entry.figmaKey, /^[0-9a-f]{40}$/);
    assert(entry.source.startsWith(snapshot.upstream + '/blob/' + snapshot.revision + '/catalog/'));
    assert.deepEqual(resolveComponent(entry.figmaKey), entry);
    assert.deepEqual(resolveComponent(entry.figmaName), entry);
    if (entry.implementation?.startsWith('.'))
      assert(selectors.has(entry.implementation), entry.figmaName);
    else assert([null, 'hr'].includes(entry.implementation), entry.figmaName);
  }
});

test('lookup distinguishes Bootstrap, missing wrappers and unknown Figma components', () => {
  assert.equal(resolveComponent(' BUTTON ').implementation, '.btn');
  assert.equal(resolveComponent('date-picker').implementation, null);
  assert.equal(resolveComponent('unknown-component'), null);
  assert(searchComponents('851a36eb').some(({ figmaName }) => figmaName === 'input'));
  assert(searchComponents('.form-control').some(({ figmaName }) => figmaName === 'textarea'));

  const output = execFileSync(
    process.execPath,
    ['scripts/lookup-design-system.js', 'button', 'date-picker'],
    {
      encoding: 'utf8',
    },
  );
  assert.deepEqual(
    JSON.parse(output).map(({ status }) => status),
    ['bootstrap', 'custom-required'],
  );
});
