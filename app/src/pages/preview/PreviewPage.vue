<script setup>
import { computed, ref, watch } from 'vue';
import { experiments } from '@/experiments/registry.js';
import PhoneFrame from '@/shared/ui/PhoneFrame.vue';

const props = defineProps({ experimentId: { type: String, default: '' } });
const emit = defineEmits(['select']);
const experiment = computed(() => experiments.find(({ id }) => id === props.experimentId));
const variant = ref(null);
const step = ref('');
const parameters = ref({});
const variants = computed(() => experiment.value?.variants ?? []);
const steps = computed(() => variant.value?.steps ?? experiment.value?.steps ?? []);
const parameterFields = computed(() => experiment.value?.parameters ?? []);

watch(
  experiment,
  () => {
    variant.value = variants.value[0] ?? null;
    step.value = steps.value[0]?.id ?? '';
    parameters.value = Object.fromEntries(
      parameterFields.value.map(({ id, options }) => [id, options[0].id]),
    );
  },
  { immediate: true },
);

function selectVariant(selected) {
  variant.value = selected;
  step.value = steps.value[0]?.id ?? '';
}

function navigate(id) {
  if (steps.value.some((entry) => entry.id === id)) step.value = id;
}
</script>

<template>
  <main class="stage bg-black text-light p-3 p-lg-4" data-bs-theme="dark">
    <aside class="controls" aria-label="Управление гипотезой">
      <div>
        <label class="form-label small" for="experiment">Гипотеза</label>
        <select
          id="experiment"
          class="form-select"
          :value="experiment?.id ?? ''"
          @change="emit('select', $event.target.value)"
        >
          <option value="">Выберите гипотезу</option>
          <option v-for="entry in experiments" :key="entry.id" :value="entry.id">
            {{ entry.title }}
          </option>
        </select>
      </div>

      <fieldset v-if="variants.length > 1" class="mt-3">
        <legend class="form-label small float-none w-auto">Вариант</legend>
        <div class="btn-group">
          <template v-for="entry in variants" :key="entry.id">
            <input
              :id="'variant-' + entry.id"
              class="btn-check"
              type="radio"
              name="experiment-variant"
              :checked="variant?.id === entry.id"
              @change="selectVariant(entry)"
            />
            <label class="btn btn-outline-light btn-sm px-3" :for="'variant-' + entry.id">
              {{ entry.label }}
            </label>
          </template>
        </div>
      </fieldset>

      <div v-for="field in parameterFields" :key="field.id" class="mt-3">
        <label class="form-label small" :for="'parameter-' + field.id">{{ field.label }}</label>
        <select
          :id="'parameter-' + field.id"
          v-model="parameters[field.id]"
          class="form-select form-select-sm"
        >
          <option v-for="option in field.options" :key="option.id" :value="option.id">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div v-if="steps.length > 1" class="mt-3">
        <label class="form-label small" for="experiment-step">Переход</label>
        <select id="experiment-step" v-model="step" class="form-select form-select-sm">
          <option v-for="entry in steps" :key="entry.id" :value="entry.id">
            {{ entry.label }}
          </option>
        </select>
      </div>
    </aside>

    <div class="device-area">
      <PhoneFrame :active="Boolean(experiment)">
        <component
          :is="experiment.component"
          v-if="experiment"
          :key="experiment.id + (variant?.id ?? '')"
          :variant="variant?.id"
          :step="step"
          :parameters="parameters"
          @navigate="navigate"
        />
      </PhoneFrame>
    </div>
  </main>
</template>

<style scoped lang="scss">
.stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(22rem, 1fr);
  gap: var(--ds-space-3);
  min-height: 100dvh;
}

.controls {
  width: min(100%, 17rem);
  justify-self: end;
  align-self: start;
}

.device-area {
  container-type: size;
  display: grid;
  place-items: center;
}

@media (min-width: 992px) {
  .stage {
    grid-template-columns: minmax(0, 1fr) min(45%, 434px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    min-height: 24rem;
    height: 100dvh;
  }

  .controls {
    grid-area: 1 / 3;
  }

  .device-area {
    grid-area: 1 / 2;
  }
}
</style>
