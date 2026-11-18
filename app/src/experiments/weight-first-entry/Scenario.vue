<template>
  <div class="experiment">
    <div v-if="!pinnedVariant" class="variants" role="group" aria-label="Вариант сценария">
      <button
        v-for="option in variants"
        :key="option"
        class="variant"
        type="button"
        :aria-pressed="variant === option"
        @click="chooseVariant(option)"
      >
        Вариант {{ option }}
      </button>
    </div>

    <section class="phone" aria-labelledby="weight-heading">
      <h2 id="weight-heading" ref="heading" tabindex="-1">
        {{ editing ? 'Добавить вес' : 'Вес' }}
      </h2>

      <form v-if="editing" class="entry" novalidate @submit.prevent="saveWeight">
        <div class="input-area">
          <label for="weight-entry">Вес, кг</label>
          <input
            id="weight-entry"
            ref="weightInput"
            v-model="draft"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            :aria-invalid="showError ? 'true' : undefined"
            :aria-describedby="showError ? 'weight-entry-error' : undefined"
            placeholder="—"
            @input="showError = false"
          />
          <p v-if="showError" id="weight-entry-error" class="entry-error" role="alert">
            Введите вес в килограммах
          </p>
        </div>

        <div class="actions">
          <button type="submit" class="primary">Сохранить вес</button>
          <button type="button" class="quiet" @click="cancelEntry">Отмена</button>
        </div>
      </form>

      <WeightGraph v-else-if="savedWeight !== null" :weight="savedWeight" />

      <template v-else>
        <p class="empty-note">Записей пока нет</p>
        <WeightGraph v-if="variant === 'B'" />
        <button ref="addButton" type="button" class="primary start" @click="openEntry">
          Добавить вес
        </button>
      </template>
    </section>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import WeightGraph from './WeightGraph.vue';
import { parseWeight } from './model/weight.js';

const variants = ['A', 'B'];
const requestedVariant = new URLSearchParams(window.location.search).get('variant');
const pinnedVariant = variants.includes(requestedVariant) ? requestedVariant : null;
const variant = ref(pinnedVariant ?? 'A');
const editing = ref(false);
const draft = ref('');
const savedWeight = ref(null);
const showError = ref(false);
const weightInput = ref(null);
const addButton = ref(null);
const heading = ref(null);

function resetDraft() {
  draft.value = '';
  showError.value = false;
}

function chooseVariant(option) {
  if (variant.value === option) return;
  variant.value = option;
  editing.value = false;
  savedWeight.value = null;
  resetDraft();
}

async function openEntry() {
  resetDraft();
  editing.value = true;
  await nextTick();
  weightInput.value?.focus();
}

async function cancelEntry() {
  editing.value = false;
  resetDraft();
  await nextTick();
  addButton.value?.focus();
}

async function saveWeight() {
  const value = parseWeight(draft.value);
  if (value === null) {
    showError.value = true;
    await nextTick();
    weightInput.value?.focus();
    return;
  }

  savedWeight.value = value;
  editing.value = false;
  resetDraft();
  await nextTick();
  heading.value?.focus();
}
</script>

<style scoped lang="scss">
.experiment {
  display: grid;
  inline-size: min(100%, 25.125rem);
  gap: var(--spacing-4);
}

.variants {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

button {
  min-block-size: var(--spacing-9);
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-weight: 650;
  cursor: pointer;
}

.variant {
  border-color: var(--color-border-control);
  background: var(--color-bg-surface);
}

.variant[aria-pressed='true'] {
  border-color: var(--color-accent-default);
  background: var(--color-accent-soft);
  color: var(--color-accent-default);
}

.phone {
  display: flex;
  flex-direction: column;
  min-block-size: min(45rem, 65svh);
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-16);
  background: var(--color-bg-surface);
}

.phone h2 {
  font-size: 1.5rem;
  line-height: 1.25;
}

.empty-note {
  color: var(--color-fg-muted);
}

.primary {
  background: var(--color-accent-default);
  color: var(--color-bg-surface);
}

.primary:hover {
  text-decoration: underline;
}

.quiet {
  background: var(--color-bg-surface);
}

.quiet:hover {
  background: var(--color-bg-page);
}

.start {
  margin-block-start: auto;
}

.entry {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
  gap: var(--spacing-5);
}

.input-area,
.actions {
  display: grid;
  gap: var(--spacing-2);
}

.input-area label {
  font-weight: 650;
}

.input-area input {
  inline-size: 100%;
  min-inline-size: 0;
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border-control);
  border-radius: var(--radius-12);
  background: var(--color-bg-page);
  color: var(--color-fg-default);
  font-size: 1.75rem;
}

.input-area input[aria-invalid='true'] {
  border-color: var(--color-fg-default);
  border-width: 2px;
}

.entry-error {
  font-weight: 650;
}

.actions {
  margin-block-start: auto;
}
</style>
