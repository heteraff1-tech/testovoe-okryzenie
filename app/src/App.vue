<template>
  <header class="masthead">
    <div class="container topbar">
      <a href="#catalog" class="brand">Стенд сценариев</a>
      <nav aria-label="Разделы стенда">
        <a href="#catalog" :aria-current="route.view === 'catalog' ? 'page' : undefined">Каталог</a>
      </nav>
    </div>
  </header>

  <main ref="mainElement" class="container content">
    <CatalogPage v-show="route.view === 'catalog'" :entries="experiments" />
    <section v-if="route.view !== 'catalog'" aria-labelledby="scenario-title">
      <a href="#catalog" class="back">← К каталогу</a>
      <template v-if="selected">
        <h1 id="scenario-title" tabindex="-1">{{ selected.title }}</h1>
        <div class="scenario-content" data-theme="light">
          <Suspense>
            <component :is="scenario" :key="selected.slug" />
            <template #fallback><p role="status">Загружаем сценарий…</p></template>
          </Suspense>
        </div>
      </template>
      <template v-else>
        <h1 id="scenario-title" tabindex="-1">Сценарий не найден</h1>
        <p class="scenario-content">Проверьте ссылку или выберите другой сценарий.</p>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, watch } from 'vue';
import { experiments, experimentsBySlug } from '@/experiments/registry.js';
import { parseCatalogRoute } from '@/features/catalog';
import CatalogPage from '@/pages/catalog/CatalogPage.vue';
import ScenarioLoadError from '@/pages/catalog/ScenarioLoadError.vue';
import { useLocationHash } from '@/shared/composables/useLocationHash.js';

const hash = useLocationHash();
const mainElement = ref(null);
const route = computed(() => parseCatalogRoute(hash.value));
const selected = computed(() => experimentsBySlug.get(route.value.slug));
const scenario = computed(
  () =>
    selected.value &&
    defineAsyncComponent({
      loader: selected.value.load,
      errorComponent: ScenarioLoadError,
    }),
);

watch(route, async ({ view }) => {
  await nextTick();
  const headingId = view === 'catalog' ? '#catalog-title' : '#scenario-title';
  mainElement.value?.querySelector(headingId)?.focus();
  window.scrollTo(0, 0);
});
</script>

<style scoped lang="scss">
.masthead {
  border-bottom: 1px solid var(--stand-color-border-default);
  background: var(--stand-color-bg-surface);
}

.container {
  width: min(100%, var(--width-catalog));
  margin-inline: auto;
  padding-inline: var(--spacing-5);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  gap: var(--spacing-4);
}

.topbar a {
  display: inline-flex;
  align-items: center;
  min-height: var(--size-touch);
  color: var(--stand-color-fg-default);
  text-decoration: none;
}

.topbar a:hover {
  text-decoration: underline;
}

.brand {
  font-weight: 750;
}

.topbar [aria-current='page'] {
  color: var(--stand-color-accent-default);
  font-weight: 650;
}

.content {
  padding-block: clamp(var(--spacing-7), 6vw, var(--spacing-10));
}

.back {
  display: inline-flex;
  align-items: center;
  min-height: var(--size-touch);
  margin-bottom: var(--spacing-2);
}

.scenario-content {
  margin-top: var(--spacing-5);
}

#scenario-title {
  overflow-wrap: anywhere;
}
</style>
