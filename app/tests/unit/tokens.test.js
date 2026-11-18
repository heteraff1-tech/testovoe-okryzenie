import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'sass';

test('light and dark themes supply the same color tokens', () => {
  const { css } = compile('src/assets/styles/tokens/color.scss');
  const blocks = [...css.matchAll(/\{([^}]+)\}/g)].map((match) =>
    Object.fromEntries(
      [...match[1].matchAll(/(--[\w-]+):\s*(#[\da-f]+);/gi)].map((item) => [
        item[1],
        item[2].toLowerCase(),
      ]),
    ),
  );
  assert.equal(blocks.length, 2);
  const [light, dark] = blocks;
  assert(Object.keys(light).length > 0);
  assert.deepEqual(Object.keys(light).sort(), Object.keys(dark).sort());
  assert.notEqual(light['--color-bg-page'], dark['--color-bg-page']);
  assert.notEqual(light['--color-fg-default'], dark['--color-fg-default']);
});

test('global styles resolve their references and keep feature animation settings local', () => {
  const { css } = compile('src/assets/styles/main.scss');
  const declared = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map((match) => match[1]));
  const references = new Set([...css.matchAll(/var\(--([\w-]+)/g)].map((match) => match[1]));
  assert.deepEqual(
    [...references].filter((name) => !declared.has(name)),
    [],
  );
  assert(!/--(?:preview-|onboarding-|motion-(?:portrait|doctor|intro))/.test(css));
  assert(!/--(?:heading|text|display)-[\w-]*-weight/.test(css));
  const markup = compile('src/assets/styles/tokens/markup.scss').css;
  const spacing = [...markup.matchAll(/--spacing-\d+:\s*(\d+)px/g)].map((match) =>
    Number(match[1]),
  );
  assert.deepEqual(spacing, [4, 8, 12, 16, 20, 24, 32, 40, 48, 56]);
});
