<template>
  <figure class="graph" aria-label="Динамика веса">
    <figcaption>
      <p v-if="weight === null" class="graph-title">Динамика веса</p>
      <template v-else>
        <p class="graph-title" role="status">Запись сохранена</p>
        <p class="graph-note">Первый замер</p>
      </template>
    </figcaption>

    <div class="plot">
      <div class="grid" aria-hidden="true"></div>
      <div class="reading" :class="{ 'reading--saved': weight !== null }">
        <span class="point" aria-hidden="true"></span>
        <span v-if="weight !== null" class="value">{{ weight }} кг</span>
      </div>
    </div>

    <p class="graph-note today">Сегодня</p>
    <p v-if="weight === null">Запишите вес. Со временем здесь будет видно, как он меняется.</p>
  </figure>
</template>

<script setup>
defineProps({
  weight: { type: String, default: null },
});
</script>

<style scoped lang="scss">
.graph {
  display: grid;
  gap: var(--spacing-2);
  margin: 0;
  padding: var(--spacing-4);
  border-radius: var(--radius-16);
  background: var(--color-bg-page);
  overflow-wrap: anywhere;
}

.graph-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.graph-note {
  color: var(--color-fg-muted);
  font-size: 0.8125rem;
}

.plot {
  position: relative;
  display: grid;
  min-block-size: 4.25rem;
  align-items: center;
}

.grid {
  position: absolute;
  inset: 0;
  border-block: 1px solid var(--color-border-default);
  background: linear-gradient(var(--color-border-default), var(--color-border-default)) center /
    100% 1px no-repeat;
}

.grid::after {
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(var(--spacing-4) + var(--spacing-1));
  border-inline-start: 1px solid var(--color-border-default);
  content: '';
}

.reading {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline-start: var(--spacing-4);
}

.point {
  inline-size: var(--spacing-2);
  block-size: var(--spacing-2);
  flex: none;
  border: 1px solid var(--color-fg-muted);
  border-radius: var(--radius-full);
  background: var(--color-bg-page);
}

.reading--saved .point {
  border-color: var(--color-accent-default);
  background: var(--color-accent-default);
}

.value {
  background: var(--color-bg-page);
  font-size: 0.875rem;
  font-weight: 650;
}

.today {
  padding-inline-start: var(--spacing-2);
}
</style>
