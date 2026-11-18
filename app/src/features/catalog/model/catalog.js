const titleOrder = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
const kinds = new Set(['hypothesis', 'feature']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Возвращает дату для отображения. Принимает проверенную дату ISO без часового пояса. */
export function formatDate(date) {
  return date.split('-').reverse().join('.');
}

function searchText(text) {
  return text
    .toLocaleLowerCase('ru')
    .replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Проверяет данные записи и нормализует внешний вид пробелов в названии и описании. */
export function validateManifest(slug, manifest) {
  const { kind, title, date, summary = '' } = manifest ?? {};
  const parsedDate = typeof date === 'string' ? new Date(date) : new Date(NaN);
  if (
    !slugPattern.test(slug) ||
    !kinds.has(kind) ||
    typeof title !== 'string' ||
    !title.trim() ||
    typeof summary !== 'string' ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(
      `Проверьте slug, kind, title, date и summary в experiments/${slug}/manifest.js`,
    );
  }
  return { slug, kind, title: title.trim(), date, summary: summary.trim() };
}

/** Создаёт поисковый индекс и сортирует записи от новых к старым. */
export function indexExperiments(entries) {
  return entries
    .map((entry) => ({
      ...entry,
      searchText: searchText(
        `${entry.title} ${entry.slug} ${entry.summary} ${formatDate(entry.date)}`,
      ),
    }))
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        titleOrder.compare(a.title, b.title) ||
        a.slug.localeCompare(b.slug),
    );
}

/** Выбирает записи по типу и всем словам запроса, не меняя исходный порядок. */
export function filterExperiments(entries, query, kind) {
  const words = searchText(query).split(' ').filter(Boolean);
  return entries.filter(
    (entry) =>
      (kind === 'all' || entry.kind === kind) &&
      words.every((word) => entry.searchText.includes(word)),
  );
}

/** Разбирает адрес каталога или сценария, сохраняя slug для прямых ссылок. */
export function parseCatalogRoute(hash) {
  if (hash === '' || hash === '#' || hash === '#catalog') return { view: 'catalog' };
  const slug = hash.match(/^#experiment\/([a-z0-9-]+)$/)?.[1];
  return slug && slugPattern.test(slug) ? { view: 'experiment', slug } : { view: 'missing' };
}
