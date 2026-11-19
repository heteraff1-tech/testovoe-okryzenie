import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { sourceFiles, sourceRoot } from '../lib/source.js';
import { styleViolations } from '../lib/style-guard.js';
import { themeTokens } from '../lib/tokens.js';

const file = fileURLToPath(new URL('../../src/Test.vue', import.meta.url));
const inspect = (source, filename = file) => styleViolations(source, filename, themeTokens);

test('application styles use Bootstrap variables and scales', () => {
  const html = fileURLToPath(new URL('../../index.html', import.meta.url));
  const publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url));
  const files = [...sourceFiles(sourceRoot), html];
  if (existsSync(publicDirectory)) files.push(...sourceFiles(publicDirectory));
  assert.deepEqual(
    files.flatMap((path) => inspect(readFileSync(path, 'utf8'), path)),
    [],
  );
});

test('raw colors, gradients, aliases and spacing fail even in Vue inline styles', () => {
  const source = `<script setup>
const inline = { backgroundColor: 'red', padding: 12 };
</script>
<template>
  <main style="margin-inline: 7px" :style="inline">
    <svg><path fill="#1234" :stroke="'blue'" /></svg>
    <div :style="{ gap: '8px', borderRadius: '3px' }"></div>
  </main>
</template>
<style scoped>
main {
  --local-space: 3px;
  color: var(--bs-body-color, #ff0000);
  border-color: var(--missing-color);
  background: linear-gradient(hsl(0 50% 50%), rgba(0, 0, 0, .5));
  gap: var(--local-space);
  padding: var(--ds-space-99);
  font-size: 2rem;
  box-shadow: 0 2px 3px currentColor;
}
</style>`;
  const errors = inspect(source).join('\n');
  for (const expected of [
    'Сырой цвет red',
    'padding',
    'margin-inline',
    '#1234',
    'Сырой цвет blue',
    'gap',
    'border-radius',
    '#ff0000',
    'hsl(',
    'rgba(',
    '--local-space',
    '--ds-space-99',
    '--missing-color',
    'font-size',
    'box-shadow',
  ])
    assert(errors.includes(expected), errors);
});

test('theme variables, color channels, zero, auto and SVG mask references are allowed', () => {
  assert.deepEqual(
    inspect(`<template>
  <main :style="{ padding: 'var(--ds-space-3)' }"><svg><path fill="currentColor" /></svg></main>
</template>
<style>
main {
  color: var(--bs-body-color);
  background: rgba(var(--bs-primary-rgb), .5);
  border-radius: var(--bs-border-radius);
  padding: calc(var(--ds-space-3) * 2);
  margin: 0 auto;
  font-family: var(--bs-font-sans-serif);
  mask: url("#face");
}
</style>`),
    [],
  );
});

test('standalone SVG presentation attributes and styles use tokens', () => {
  const source = '<svg><style>path { stroke: #bada55 }</style><path fill="rebeccapurple"/></svg>';
  const errors = inspect(source, 'shape.svg').join('\n');
  assert.match(errors, /#bada55/);
  assert.match(errors, /rebeccapurple/);
});
