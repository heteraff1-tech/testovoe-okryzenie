import { indexExperiments, validateManifest } from '@/features/catalog';

const manifests = import.meta.glob('./*/manifest.js', { eager: true, import: 'default' });
const scenarios = import.meta.glob('./*/Scenario.vue');

/** Готовит каталог и связывает каждый манифест с лениво загружаемым сценарием. */
export const experiments = indexExperiments(
  Object.entries(manifests).map(([path, manifest]) => {
    const [, slug] = path.split('/');
    const load = scenarios[`./${slug}/Scenario.vue`];
    if (!load) throw new Error(`Добавьте Scenario.vue для эксперимента ${slug}`);
    return { ...validateManifest(slug, manifest), load };
  }),
);

export const experimentsBySlug = new Map(experiments.map((entry) => [entry.slug, entry]));
