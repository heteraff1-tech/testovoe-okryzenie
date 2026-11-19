import { readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseJavaScript } from '@babel/parser';
import { parse as parseVue } from '@vue/compiler-sfc';
import scss from 'postcss-scss';

export const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url));
const scriptExtensions = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx']);
const styleExtensions = new Set(['.css', '.scss']);

/** Перечисляет исходники без перехода по симлинкам. */
export function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = resolve(directory, entry.name);
      const extension = extname(path);
      if (entry.isDirectory()) return sourceFiles(path);
      if (!entry.isFile()) return [];
      return scriptExtensions.has(extension) ||
        styleExtensions.has(extension) ||
        ['.vue', '.html', '.svg'].includes(extension)
        ? [path]
        : [];
    })
    .sort();
}

/** Разделяет Vue SFC на шаблон, скрипты и таблицы стилей. */
export function sourceBlocks(source, file) {
  const extension = extname(file);
  if (extension === '.vue' || extension === '.html' || extension === '.svg') {
    const markup = extension === '.vue' ? source : '<template>' + source + '</template>';
    const { descriptor, errors } = parseVue(markup, { filename: file });
    if (errors.length) throw new Error(file + ': ' + errors.join('\n'));
    return {
      scripts: [descriptor.script, descriptor.scriptSetup].filter(Boolean),
      styles: descriptor.styles,
      template: descriptor.template,
    };
  }
  const block = { content: source, loc: { start: { line: 1 } } };
  return styleExtensions.has(extension)
    ? { scripts: [], styles: [block] }
    : { scripts: [block], styles: [] };
}

/** Обходит только узлы Babel AST. */
export function walkScript(node, visit, parent) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parent);
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) {
      for (const item of child) walkScript(item, visit, node);
    } else {
      walkScript(child, visit, node);
    }
  }
}

/** Извлекает AST из исходного скрипта, включая TS и JSX. */
export function scriptAst(content) {
  return parseJavaScript(content, {
    sourceType: 'unambiguous',
    createImportExpressions: true,
    plugins: ['typescript', 'jsx'],
  });
}

/** Возвращает дерево CSS или SCSS. */
export function stylesheet(content) {
  return scss.parse(content);
}
