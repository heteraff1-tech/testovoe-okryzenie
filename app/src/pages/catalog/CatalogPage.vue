<template>
  <section aria-labelledby="catalog-title">
    <div class="catalog-heading">
      <h1 id="catalog-title" tabindex="-1">Каталог сценариев</h1>
      <p v-if="entries.length">Гипотезы и фичи для ручного прогона.</p>
    </div>

    <section v-if="!entries.length" class="empty">
      <h2>Пока нет сценариев</h2>
      <p>Здесь появятся опубликованные гипотезы и фичи.</p>
    </section>

    <template v-else>
      <div class="controls">
        <label for="scenario-search">Поиск по каталогу</label>
        <input
          id="scenario-search"
          v-model="query"
          type="search"
          placeholder="Название, описание или идентификатор"
        />
        <div class="filters" role="group" aria-label="Тип сценария">
          <button
            v-for="option in filters"
            :key="option.value"
            type="button"
            :aria-pressed="kind === option.value"
            @click="kind = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <p class="result-count" role="status">Найдено {{ matches.length }} из {{ entries.length }}</p>

      <div v-if="!matches.length" class="empty">
        <h2>Сценарии не найдены</h2>
        <button type="button" @click="resetFilters">Сбросить поиск и фильтры</button>
      </div>

      <ul v-else class="scenarios">
        <li v-for="entry in visibleEntries" :key="entry.slug">
          <a class="scenario" :href="`#experiment/${entry.slug}`">
            <span class="scenario-meta">
              <span>{{ entry.kind === 'hypothesis' ? 'Гипотеза' : 'Фича' }}</span>
              <time :datetime="entry.date">{{ formatDate(entry.date) }}</time>
            </span>
            <strong>{{ entry.title }}</strong>
            <span v-if="entry.summary" class="summary">{{ entry.summary }}</span>
          </a>
        </li>
      </ul>

      <nav v-if="pageCount > 1" class="pagination" aria-label="Страницы каталога">
        <button type="button" :disabled="page === 1" @click="page -= 1">Назад</button>
        <span aria-live="polite">Страница {{ page }} из {{ pageCount }}</span>
        <button type="button" :disabled="page === pageCount" @click="page += 1">Дальше</button>
      </nav>
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { filterExperiments, formatDate } from '@/features/catalog';

const props = defineProps({ entries: { type: Array, required: true } });
const pageSize = 12;
const filters = [
  { value: 'all', label: 'Все' },
  { value: 'hypothesis', label: 'Гипотезы' },
  { value: 'feature', label: 'Фичи' },
];

const query = ref('');
const kind = ref('all');
const page = ref(1);
const matches = computed(() => filterExperiments(props.entries, query.value, kind.value));
const pageCount = computed(() => Math.max(1, Math.ceil(matches.value.length / pageSize)));
const visibleEntries = computed(() =>
  matches.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);

watch([query, kind], () => {
  page.value = 1;
});
watch(pageCount, (count) => {
  page.value = Math.min(page.value, count);
});

function resetFilters() {
  query.value = '';
  kind.value = 'all';
}
</script>

<style scoped lang="scss">
.catalog-heading {
  margin-bottom: var(--spacing-7);
}

h1 {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.catalog-heading p {
  margin-top: var(--spacing-2);
  color: var(--color-fg-muted);
}

.controls {
  display: grid;
  gap: var(--spacing-2);
}

.controls label {
  font-weight: 650;
}

.controls input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border-control);
  border-radius: var(--radius-12);
  background: var(--color-bg-surface);
  color: var(--color-fg-default);
}

.filters,
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
}

.filters {
  margin-top: var(--spacing-2);
}

button {
  min-height: var(--size-touch);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border-control);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  cursor: pointer;
}

button[aria-pressed='true'] {
  border-color: var(--color-accent-default);
  background: var(--color-accent-soft);
  color: var(--color-accent-default);
  font-weight: 650;
}

button:disabled {
  opacity: 0.55;
  cursor: default;
}

.result-count {
  margin-block: var(--spacing-6) var(--spacing-3);
  color: var(--color-fg-muted);
  font-size: 0.875rem;
}

.scenarios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: var(--spacing-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.scenario {
  display: grid;
  align-content: start;
  gap: var(--spacing-2);
  height: 100%;
  padding: var(--spacing-5);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-16);
  background: var(--color-bg-surface);
  color: var(--color-fg-default);
  overflow-wrap: anywhere;
  text-decoration: none;
}

.scenario:hover {
  border-color: var(--color-accent-default);
}

.scenario:hover strong {
  color: var(--color-accent-default);
  text-decoration: underline;
}

.scenario-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-2);
  color: var(--color-fg-muted);
  font-size: 0.8125rem;
}

.scenario-meta time {
  white-space: nowrap;
}

.summary {
  color: var(--color-fg-muted);
}

.pagination {
  justify-content: center;
  margin-top: var(--spacing-7);
}

.pagination span {
  color: var(--color-fg-muted);
  font-size: 0.875rem;
}

.empty {
  display: grid;
  justify-items: start;
  gap: var(--spacing-2);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-16);
  background: var(--color-bg-surface);
}

.empty h2 {
  font-size: 1.25rem;
}

.empty p {
  color: var(--color-fg-muted);
}
</style>
