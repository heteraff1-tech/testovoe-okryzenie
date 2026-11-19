import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const [checkout, ref = 'HEAD'] = process.argv.slice(2);
if (!checkout) throw new Error('Укажи путь к checkout desingSystem и при необходимости Git ref.');

const git = (...args) =>
  execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim();
const revision = git('rev-parse', '--verify', '--end-of-options', ref + '^{commit}');
const upstream = 'https://github.com/heteraff1-tech/desingSystem';
const figmaUrl =
  'https://www.figma.com/design/z0mUSQgmrlvdYjKAixYr41/Bootstrap-5-Design-System---UI-Kit--Community-?node-id=0-1';
const sections = [
  'bootstrap-mapping',
  'bootstrap-controls',
  'bootstrap-forms',
  'bootstrap-content',
];
const unquote = (value) => value.replace(/^`|`$/g, '');
const components = sections.flatMap((section) => {
  const path = 'catalog/' + section + '.md';
  return git('show', revision + ':' + path)
    .split('\n')
    .flatMap((line, index) => {
      if (!line.startsWith('|')) return [];
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => unquote(cell.trim()));
      const [role, figmaName, implementation, variants, avoidWhen, figmaKey] = cells;
      if (!figmaKey) return [];
      if (figmaKey === 'Ключ Figma' || /^-+$/.test(figmaKey)) return [];
      if (!/^[a-f0-9]{40}$/.test(figmaKey) || !/^(\.[\w-]+|hr|Custom)$/.test(implementation)) {
        throw new Error(path + ':' + (index + 1) + ': неполная или неизвестная привязка.');
      }
      return [
        {
          figmaKey,
          figmaName,
          role,
          implementation: implementation === 'Custom' ? null : implementation,
          variants,
          avoidWhen,
          source: upstream + '/blob/' + revision + '/' + path + '#L' + (index + 1),
        },
      ];
    });
});

if (
  !components.length ||
  new Set(components.map(({ figmaKey }) => figmaKey)).size !== components.length
) {
  throw new Error('В каталоге нет записей или повторяются ключи Figma.');
}

const target = fileURLToPath(new URL('../design-system/bootstrap-catalog.json', import.meta.url));
const options = await prettier.resolveConfig(target);
const content = await prettier.format(
  JSON.stringify({ upstream, revision, figmaUrl, components }),
  {
    ...options,
    filepath: target,
  },
);
writeFileSync(target, content);
console.log('Обновлено привязок: ' + components.length + '. Источник: ' + revision);
