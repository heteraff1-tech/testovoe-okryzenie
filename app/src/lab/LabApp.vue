<template>
  <header class="lab-header">
    <div class="lab-container">
      <h1 class="heading-h1">Тестовое окружение</h1>
      <nav aria-label="Сценарии" class="lab-nav">
        <a href="#catalog" :aria-current="!route ? 'page' : undefined">Все сценарии</a>
        <a
          v-for="experiment in experiments"
          :key="experiment.slug"
          :href="`#experiment/${experiment.slug}`"
          :aria-current="activeExperiment === experiment ? 'page' : undefined"
        >
          {{ experiment.title }}
        </a>
      </nav>
    </div>
  </header>
  <main class="lab-container lab-content">
    <component
      :is="activeExperiment.component"
      v-if="activeExperiment"
      :key="activeExperiment.slug"
    />
    <section v-else-if="route" class="lab-empty">
      <h2 class="heading-h2">Сценарий не найден</h2>
      <a href="#catalog">Вернуться ко всем сценариям</a>
    </section>
    <section v-else-if="!experiments.length" class="lab-empty">
      <h2 class="heading-h2">Пока нет сценариев</h2>
    </section>
    <ul v-else class="lab-list">
      <li v-for="experiment in experiments" :key="experiment.slug">
        <a :href="`#experiment/${experiment.slug}`">{{ experiment.title }}</a>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useLocationHash } from '@/shared/composables/useLocationHash';
import { experiments } from './experiments';

const hash = useLocationHash();
const route = computed(() => (hash.value === '#catalog' ? '' : hash.value));
const activeExperiment = computed(() =>
  experiments.find((experiment) => route.value === `#experiment/${experiment.slug}`),
);
</script>

<style scoped lang="scss">
.lab-header {
  border-bottom: 1px solid var(--color-border-default);
}

.lab-container {
  width: min(100%, 72rem);
  margin-inline: auto;
  padding-inline: var(--spacing-6);
}

.lab-header h1 {
  margin: 0;
  padding-block: var(--spacing-7) var(--spacing-5);
}

.lab-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.lab-nav a {
  display: grid;
  align-items: center;
  min-height: var(--size-44);
  padding-inline: var(--spacing-3);
  border-bottom: 2px solid transparent;
  color: var(--color-neutral-default);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.lab-nav a[aria-current='page'] {
  border-color: var(--color-accent-on-container);
  color: var(--color-accent-on-container);
}

.lab-content {
  padding-block: var(--spacing-7);
}

.lab-empty {
  padding: var(--spacing-7);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-16);
  background: var(--color-bg-surface);
}

.lab-empty h2 {
  margin: 0;
}

.lab-empty a {
  display: inline-block;
  margin-top: var(--spacing-3);
  color: var(--color-accent-on-container);
}

.lab-list {
  display: grid;
  gap: var(--spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.lab-list a {
  display: block;
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-12);
  color: var(--color-accent-on-container);
  overflow-wrap: anywhere;
}
</style>
