import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { stylesheet } from '../lib/source.js';
import { themeCss, themeTokens } from '../lib/tokens.js';

const require = createRequire(import.meta.url);
const bootstrapCss = readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8');

function rgbChannels(value) {
  const percentages = value.match(/^rgb\(([\d.]+)%, ([\d.]+)%, ([\d.]+)%\)$/);
  if (percentages) return percentages.slice(1).map((channel) => (Number(channel) / 100) * 255);
  if (/^#[\da-f]{6}$/i.test(value)) {
    return value
      .slice(1)
      .match(/../g)
      .map((channel) => Number.parseInt(channel, 16));
  }
  return null;
}

function colorsForTheme(css, selector) {
  const result = {};
  stylesheet(css).walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls(/^--bs-[\w-]+$/, ({ prop, value }) => {
        result[prop] = value.trim();
      });
    }
  });
  return result;
}

test('light and dark theme values match the installed Bootstrap package', () => {
  for (const theme of ['light', 'dark']) {
    const selector = '[data-bs-theme=' + theme + ']';
    const expected = colorsForTheme(bootstrapCss, selector);
    assert(expected['--bs-body-color'], theme);
    const actual = colorsForTheme(themeCss, selector);
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort());
    for (const [name, value] of Object.entries(expected)) {
      if (actual[name] === value) continue;
      // Current Sass keeps fractional channels while the distributed CSS rounds to 8-bit hex.
      const fromSass = rgbChannels(actual[name]);
      const fromDistribution = rgbChannels(value);
      assert(
        fromSass &&
          fromDistribution &&
          fromSass.every(
            (channel, index) => Math.abs(channel - fromDistribution[index]) <= 0.500001,
          ),
        theme + ' ' + name + ': ' + actual[name] + ' вместо ' + value,
      );
    }
  }
});

test('spacing variables match the corresponding Bootstrap utility values', () => {
  const utilities = new Map();
  stylesheet(bootstrapCss).walkRules(/^\.p-\d+$/, (rule) => {
    rule.walkDecls('padding', ({ value }) => utilities.set(rule.selector.slice(3), value));
  });
  assert(utilities.size > 0);
  const spacing = [...themeTokens].filter(([name]) => name.startsWith('--ds-space-'));
  assert.deepEqual(
    spacing,
    [...utilities].map(([step, value]) => ['--ds-space-' + step, value]),
  );
});
