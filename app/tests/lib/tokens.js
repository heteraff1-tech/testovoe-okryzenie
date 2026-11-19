import { fileURLToPath } from 'node:url';
import { compile } from 'sass';
import { stylesheet } from './source.js';

const appPath = (path) => fileURLToPath(new URL('../../' + path, import.meta.url));

/** Компилирует тот же Sass Bootstrap и шкалу, которые использует приложение. */
export function compileTheme() {
  return compile(appPath('src/styles/bootstrap.scss'), {
    loadPaths: [appPath('node_modules')],
    quietDeps: true,
    silenceDeprecations: ['import'],
  }).css;
}

export const themeCss = compileTheme();
export const themeTokens = new Map();
stylesheet(themeCss).walkDecls(/^--(?:bs|ds)-/, ({ prop, value }) => themeTokens.set(prop, value));
