import { resolveComponent } from '../src/shared/design-system/catalog.js';

const identifiers = process.argv.slice(2);
if (!identifiers.length) {
  console.error('Использование: npm run design:lookup -- <ключ-или-имя-Figma> […]');
  process.exitCode = 1;
} else {
  const results = identifiers.map((identifier) => {
    const component = resolveComponent(identifier);
    if (!component) return { identifier, status: 'unmapped' };
    return {
      identifier,
      status: component.implementation ? 'bootstrap' : 'custom-required',
      ...component,
    };
  });
  console.log(JSON.stringify(results, null, 2));
  if (results.some(({ status }) => status === 'unmapped')) process.exitCode = 1;
}
