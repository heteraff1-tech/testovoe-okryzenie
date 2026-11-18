<template>
  <div class="experiment">
    <div v-if="!pinnedVariant" class="variants" role="group" aria-label="Вариант сценария">
      <UiButton
        v-for="option in variants"
        :key="option"
        class="variant"
        variant="secondary"
        pill
        :aria-pressed="variant === option"
        @click="chooseVariant(option)"
      >
        Вариант {{ option }}
      </UiButton>
    </div>

    <section class="phone" aria-labelledby="weight-heading">
      <h2 id="weight-heading" ref="heading" class="heading-h1" tabindex="-1">
        {{ editing ? 'Добавить вес' : 'Вес' }}
      </h2>

      <form v-if="editing" class="entry" novalidate @submit.prevent="saveWeight">
        <div class="input-area">
          <label class="text-label" for="weight-entry">Вес, кг</label>
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
          <p v-if="showError" id="weight-entry-error" class="entry-error text-small" role="alert">
            Введите вес в килограммах
          </p>
        </div>

        <div class="actions">
          <UiButton type="submit" class="primary" pill>Сохранить вес</UiButton>
          <UiButton variant="quiet" pill @click="cancelEntry">Отмена</UiButton>
        </div>
      </form>

      <WeightGraph v-else-if="savedWeight !== null" :weight="savedWeight" />

      <template v-else>
        <p class="empty-note text-body">Записей пока нет</p>
        <WeightGraph v-if="variant === 'B'" />
        <UiButton ref="addButton" class="primary start" pill @click="openEntry">
          Добавить вес
        </UiButton>
      </template>
    </section>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { UiButton } from '@/shared/ui';
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

.variant[aria-pressed='true'] {
  background: var(--color-accent-container-default);
  color: var(--color-accent-on-container);
}

.phone {
  display: flex;
  flex-direction: column;
  min-block-size: min(45rem, 65svh);
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-16);
  background: var(--color-bg-page);
}

.empty-note {
  color: var(--color-neutral-on-container);
}

.primary {
  min-block-size: var(--spacing-9);
  color: var(--color-fg-default);
}

.primary:hover:not(:active) {
  color: var(--color-accent-on-accent);
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

.input-area input {
  inline-size: 100%;
  min-inline-size: 0;
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-neutral-soft);
  border-radius: var(--radius-16);
  background: var(--color-bg-surface);
  color: var(--color-fg-default);
  font: 600 var(--heading-h1-size) / var(--heading-h1-line) var(--font-display);
}

.input-area input[aria-invalid='true'] {
  border-color: var(--color-error-default);
  border-width: 2px;
}

.entry-error {
  color: var(--color-error-on-container);
}

.actions {
  margin-block-start: auto;
}
</style>
