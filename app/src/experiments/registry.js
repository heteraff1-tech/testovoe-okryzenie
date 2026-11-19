import { defineAsyncComponent } from 'vue';

const manifests = import.meta.glob('./*/manifest.js', { eager: true, import: 'default' });
const screens = import.meta.glob('./*/Scenario.vue');

export const experiments = Object.entries(manifests)
  .map(([path, manifest]) => {
    const directory = path.slice(0, path.lastIndexOf('/'));
    const loadScreen = screens[`${directory}/Scenario.vue`];
    if (!loadScreen) throw new Error(`Отсутствует Scenario.vue для ${directory}`);
    return {
      ...manifest,
      id: directory.slice(2),
      component: defineAsyncComponent(loadScreen),
    };
  })
  .sort((left, right) => left.title.localeCompare(right.title, 'ru'));
