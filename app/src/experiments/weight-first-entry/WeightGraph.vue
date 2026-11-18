<template>
  <figure class="graph" aria-label="Динамика веса">
    <figcaption>
      <p v-if="weight === null" class="heading-h2">Динамика веса</p>
      <template v-else>
        <p class="heading-h2" role="status">Запись сохранена</p>
        <p class="graph-note text-small">Первый замер</p>
      </template>
    </figcaption>

    <div class="plot">
      <div class="grid" aria-hidden="true"></div>
      <div class="reading" :class="{ 'reading--saved': weight !== null }">
        <span class="point" aria-hidden="true"></span>
        <span v-if="weight !== null" class="value text-label">{{ weight }} кг</span>
      </div>
    </div>

    <p class="graph-note today text-caption">Сегодня</p>
    <p v-if="weight === null" class="text-body">
      Запишите вес. Со временем здесь будет видно, как он меняется.
    </p>
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
  border-radius: var(--radius-24);
  background: var(--color-bg-surface);
  overflow-wrap: anywhere;
}

.graph-note {
  color: var(--color-neutral-on-container);
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
  border: 1px solid var(--color-neutral-on-container);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
}

.reading--saved .point {
  border-color: var(--color-accent-default);
  background: var(--color-accent-default);
}

.value {
  background: var(--color-bg-surface);
}

.today {
  padding-inline-start: var(--spacing-2);
}
</style>
