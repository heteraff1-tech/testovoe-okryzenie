import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import test from 'node:test';
import {
  filterExperiments,
  indexExperiments,
  parseCatalogRoute,
  validateManifest,
} from '../../src/features/catalog/model/catalog.js';

test('каталог сортирует и фильтрует 120 записей по словам, типу, дате и slug', () => {
  const entries = Array.from({ length: 120 }, (_, i) =>
    validateManifest(`bonus-${i + 1}`, {
      title: `Начисление баллов ${i + 1}`,
      summary: 'Зачёт бонусов',
      date: i < 60 ? '2026-01-11' : '2026-02-12',
      kind: i % 2 === 0 ? 'hypothesis' : 'feature',
    }),
  );
  const sorted = indexExperiments(entries);
  assert.equal(sorted[0].slug, 'bonus-61');
  assert.equal(sorted.at(-1).slug, 'bonus-60');
  assert.equal(filterExperiments(sorted, 'зачет 12.02.2026', 'hypothesis').length, 30);
  assert.deepEqual(filterExperiments(sorted, '  БОНУСЫ  несуществующее ', 'all'), []);
  const exact = filterExperiments(sorted, 'bonus-120', 'feature');
  assert.equal(exact[0].slug, 'bonus-120');
  assert.equal(exact.length, 1);
  assert.equal(filterExperiments(sorted, '', 'all').length, 120);
  assert.equal(entries[0].slug, 'bonus-1');
});

test('адреса валидируются, отсутствующий slug не теряет состояние каталога', () => {
  for (const hash of ['', '#', '#catalog'])
    assert.deepEqual(parseCatalogRoute(hash), { view: 'catalog' });
  assert.deepEqual(parseCatalogRoute('#experiment/bonus-120'), {
    view: 'experiment',
    slug: 'bonus-120',
  });
  for (const hash of ['#experiment/', '#experiment/../bonus', '#experiment/bad--slug', '#else']) {
    assert.deepEqual(parseCatalogRoute(hash), { view: 'missing' });
  }
});

test('манифест требует название, тип, корректную дату и slug', () => {
  const fields = { title: ' Смена цели ', date: '2026-01-11', kind: 'hypothesis' };
  assert.equal(validateManifest('change-goal', fields).title, 'Смена цели');
  for (const invalid of [
    { title: ' ' },
    { date: '2026-02-30' },
    { date: '11.01.26' },
    { date: Symbol('date') },
    { kind: 'all' },
    { summary: 123 },
  ]) {
    assert.throws(() => validateManifest('change-goal', { ...fields, ...invalid }), /manifest\.js/);
  }
  assert.throws(() => validateManifest('change/goal', fields), /manifest\.js/);
});

test('каждая папка сценария содержит корректный манифест и Vue-экран', async () => {
  const root = new URL('../../src/experiments/', import.meta.url);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const folder = new URL(`${entry.name}/`, root);
    const { default: manifest } = await import(new URL('manifest.js', folder).href);
    validateManifest(entry.name, manifest);
    assert(statSync(new URL('Scenario.vue', folder)).isFile());
  }
});
