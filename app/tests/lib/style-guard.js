import { parseExpression } from '@babel/parser';
import colorNames from 'color-name';
import valueParser from 'postcss-value-parser';
import { sourceBlocks, scriptAst, stylesheet, walkScript } from './source.js';

const colorFunctions = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|device-cmyk)$/i;
const colorLiteral = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const colorChannelToken = /^var\(--bs-[\w-]+-rgb\)(?:\s*(?:,|\/)\s*(?:[\d.]+%?))?$/;
const protectedProperty =
  /^(?:-webkit-)?(?:(?:margin|padding)(?:-[\w-]+)?|(?:column-|row-)?gap|border(?:-[\w-]+)?-radius|box-shadow|text-shadow|font(?:-family|-size|-weight)?|line-height)$/;
const bootstrapScaleProperty =
  /^--(?:bs|ds)-[\w-]*(?:space|padding|gutter|spacer|radius|shadow|font|line-height)[\w-]*$/;
const visualAttribute = /^(?:fill|stroke|color|bgcolor|stop-color|flood-color|lighting-color)$/;
const colorProperty = /(?:^|-)color$|^background$|^border(?:-top|-right|-bottom|-left)?$|^outline$/;
const nonzeroDimension = /^[+-]?(?:\d*\.)?\d+(?:[a-z%]+)?$/i;
const geometryFunctions = /^(?:calc|min|max|clamp)$/i;
const computedStyleBinds = /^(?:v-bind|attr)$/i;

const cssProperty = (name) => name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
const own = (object, key) => Object.hasOwn(object, key);
const ignoredNamedColors = new Set(['transparent', 'currentcolor']);
const systemColors = new Set(
  'accentcolor accentcolortext activetext buttonborder buttonface buttontext canvas canvastext field fieldtext graytext highlight highlighttext linktext mark marktext selecteditem selecteditemtext visitedtext'.split(
    ' ',
  ),
);

function issuesInValue(property, value, tokens, useNamedColors = true) {
  const issues = new Set();
  const restricted = protectedProperty.test(property) || bootstrapScaleProperty.test(property);
  const needsToken = restricted || colorProperty.test(property) || visualAttribute.test(property);
  valueParser(value).walk((node) => {
    const word = node.value.toLowerCase();
    if (node.type === 'function') {
      if (word === 'url') {
        if (/^['"]?data:/i.test(valueParser.stringify(node.nodes).trim())) {
          issues.add('Вынеси data: из стилей в отдельный проверяемый ресурс.');
        }
        return false;
      }
      if (word === 'var') {
        const name = node.nodes.find((part) => part.type === 'word')?.value;
        if (
          name?.startsWith('--') &&
          !tokens.has(name) &&
          (needsToken || /^--(?:bs|ds)-/.test(name))
        ) {
          issues.add('Укажи существующий токен Bootstrap: ' + name);
        }
        if (restricted && name && !bootstrapScaleProperty.test(name)) {
          issues.add('Для ' + property + ' выбери токен из шкалы Bootstrap.');
        }
      }
      if (
        colorFunctions.test(word) &&
        !(/^rgba?$/.test(word) && colorChannelToken.test(valueParser.stringify(node.nodes).trim()))
      ) {
        issues.add('Сырой цвет ' + word + '(...). Используй переменную Bootstrap.');
      }
      if (restricted && computedStyleBinds.test(word)) {
        issues.add('Для ' + property + ' используй класс Bootstrap или токен.');
      }
      return;
    }
    if (node.type !== 'word') {
      if (restricted && node.type === 'string') {
        issues.add('Для ' + property + ' используй класс Bootstrap или токен.');
      }
      return;
    }
    if (
      colorLiteral.test(word) ||
      (useNamedColors &&
        !ignoredNamedColors.has(word) &&
        (own(colorNames, word) || systemColors.has(word)))
    ) {
      issues.add('Сырой цвет ' + node.value + '. Используй переменную Bootstrap.');
    }
    if (
      restricted &&
      (word.startsWith('$') ||
        (nonzeroDimension.test(word) &&
          Number.parseFloat(word) !== 0 &&
          (!geometryFunctions.test(value.trim().split('(')[0]) || /[a-z%]$/i.test(word))))
    ) {
      issues.add('Для ' + property + ' используй класс Bootstrap или токен.');
    }
  });
  return issues;
}

function valueFromScript(node) {
  if (['StringLiteral', 'NumericLiteral'].includes(node.type)) return String(node.value);
  if (node.type === 'TemplateElement') return node.value.cooked ?? node.value.raw;
  return null;
}

function parentProperty(node, parent) {
  if (parent?.type === 'ObjectProperty' && parent.value === node) {
    return cssProperty(parent.key.name ?? String(parent.key.value));
  }
  if (
    parent?.type === 'AssignmentExpression' &&
    parent.right === node &&
    parent.left.type === 'MemberExpression'
  ) {
    return cssProperty(parent.left.property.name ?? String(parent.left.property.value));
  }
  if (
    parent?.type === 'CallExpression' &&
    parent.callee.property?.name === 'setProperty' &&
    parent.arguments[1] === node &&
    parent.arguments[0].type === 'StringLiteral'
  ) {
    return parent.arguments[0].value;
  }
  return '';
}

function walkTemplate(node, visit) {
  if (!node) return;
  if (node.type === 1) visit(node);
  for (const child of node.children ?? []) walkTemplate(child, visit);
}

/** Проверяет стили, inline-атрибуты и статические значения Vue/JS. */
export function styleViolations(source, file, tokens) {
  const { scripts, styles, template } = sourceBlocks(source, file);
  const violations = [];
  const check = (property, value, line, named = true) => {
    for (const issue of issuesInValue(property, value, tokens, named)) {
      violations.push(file + ':' + line + ': ' + issue);
    }
  };
  const checkSheet = (text, firstLine) =>
    stylesheet(text).walkDecls((decl) => {
      check(decl.prop, decl.value, firstLine + decl.source.start.line - 1);
    });
  const checkAst = (ast, firstLine, attribute = '') => {
    walkScript(ast, (node, parent) => {
      const value = valueFromScript(node);
      if (value === null) return;
      if (
        parent?.type === 'CallExpression' &&
        ['querySelector', 'querySelectorAll'].includes(parent.callee.property?.name)
      )
        return;
      const property = attribute || parentProperty(node, parent);
      const named =
        visualAttribute.test(property) ||
        /color|background|shadow|^(?:border|outline|filter)$/i.test(property);
      check(property, value, firstLine + (node.loc?.start.line ?? 1) - 1, named);
    });
  };

  for (const style of styles) checkSheet(style.content, style.loc.start.line);
  for (const script of scripts) checkAst(scriptAst(script.content), script.loc.start.line);
  if (template)
    walkTemplate(template.ast, (element) => {
      if (element.tag === 'style' || element.tag === 'script') {
        for (const child of element.children) {
          if (child.type !== 2) continue;
          const line = child.loc.start.line + template.loc.start.line - 1;
          if (element.tag === 'style') checkSheet(child.content, line);
          else if (
            element.props.every(
              (prop) => prop.name !== 'type' || !prop.value?.content?.includes('json'),
            )
          )
            checkAst(scriptAst(child.content), line);
        }
      }
      for (const prop of element.props) {
        const line = prop.loc.start.line + template.loc.start.line - 1;
        if (prop.type === 6 && prop.value) {
          if (prop.name === 'style') checkSheet(prop.value.content, line);
          if (visualAttribute.test(prop.name)) check(prop.name, prop.value.content, line);
        }
        if (prop.type === 7 && prop.name === 'bind' && prop.exp?.content) {
          const attribute = prop.arg?.content;
          if (attribute === 'style' || (attribute && visualAttribute.test(attribute))) {
            const ast = parseExpression(prop.exp.content, { plugins: ['typescript', 'jsx'] });
            if (attribute === 'style' && ast.type === 'StringLiteral') checkSheet(ast.value, line);
            else checkAst(ast, line, attribute === 'style' ? '' : attribute);
          }
        }
      }
    });
  return violations;
}
