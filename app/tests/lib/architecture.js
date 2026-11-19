import { dirname, relative, resolve } from 'node:path';
import valueParser from 'postcss-value-parser';
import { scriptAst, sourceBlocks, sourceRoot, stylesheet, walkScript } from './source.js';

function importsIn(source, file) {
  const dependencies = [];
  const { scripts, styles } = sourceBlocks(source, file);
  for (const script of scripts) {
    const offset = script.loc.start.line - 1;
    if (script.src) dependencies.push([script.src, offset + 1]);
    walkScript(scriptAst(script.content), (node) => {
      const line = node.loc.start.line + offset;
      if (
        ['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(
          node.type,
        ) &&
        node.source
      ) {
        dependencies.push([node.source.value, line]);
      }
      if (node.type === 'TSImportEqualsDeclaration' && node.moduleReference.expression) {
        dependencies.push([node.moduleReference.expression.value, line]);
      }
      if (
        node.type === 'ImportExpression' ||
        (node.type === 'CallExpression' && node.callee.name === 'require')
      ) {
        const target = node.source ?? node.arguments[0];
        const value =
          target?.type === 'StringLiteral'
            ? target.value
            : target?.type === 'TemplateLiteral' && target.expressions.length === 0
              ? target.quasis[0].value.cooked
              : null;
        dependencies.push([value, line]);
      }
    });
  }
  for (const style of styles) {
    const offset = style.loc.start.line - 1;
    if (style.src) dependencies.push([style.src, offset + 1]);
    stylesheet(style.content).walkAtRules(/^(import|use|forward)$/, (rule) => {
      const parts = valueParser(rule.params).nodes;
      const targets = rule.name === 'import' ? parts : parts.slice(0, 1);
      for (const part of targets) {
        const target = part.type === 'function' && part.value === 'url' ? part.nodes[0] : part;
        if (target?.type === 'string' || (part !== target && target?.type === 'word')) {
          dependencies.push([target.value, rule.source.start.line + offset]);
        }
      }
    });
  }
  return dependencies;
}

function importPath(file, specifier) {
  const path = specifier.split(/[?#]/, 1)[0].replaceAll('\\', '/');
  if (path.startsWith('@/')) return resolve(sourceRoot, path.slice(2));
  if (/^\/?src\//.test(path)) return resolve(sourceRoot, path.replace(/^\/?src\//, ''));
  if (path.startsWith('.')) return resolve(dirname(file), path);
  return null;
}

/** Проверяет потоки импортов между слоями и изоляцию экспериментов. */
export function architectureViolations(source, file) {
  const [layer, name] = relative(sourceRoot, file).split('/');
  return importsIn(source, file).flatMap(([specifier, line]) => {
    const location = file + ':' + line + ': ';
    if (specifier === null) return [location + 'Укажи статический путь для import/require.'];
    const path = importPath(file, specifier);
    if (!path) return [];
    const [targetLayer, targetName, ...targetPath] = relative(sourceRoot, path).split('/');
    const forbidden =
      (layer === 'shared' && ['features', 'pages', 'experiments'].includes(targetLayer)) ||
      (layer === 'features' && ['pages', 'experiments'].includes(targetLayer)) ||
      (layer === 'features' && targetLayer === 'features' && name !== targetName) ||
      (layer === 'experiments' && targetLayer === 'experiments' && name !== targetName);
    if (forbidden) return [location + 'Импорт ' + specifier + ' нарушает изоляцию слоёв.'];
    if (
      targetLayer === 'features' &&
      (layer !== 'features' || name !== targetName) &&
      targetPath.length &&
      !/^index(?:\.[cm]?[jt]s)?$/.test(targetPath.join('/'))
    ) {
      return [location + 'Импортируй feature через её index.js.'];
    }
    return [];
  });
}
