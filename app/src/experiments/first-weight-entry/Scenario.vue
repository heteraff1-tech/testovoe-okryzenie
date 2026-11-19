<script setup>
import { ref } from 'vue';

defineProps({ step: String, variant: String, parameters: Object });
const emit = defineEmits(['navigate']);
const weight = ref('');
</script>

<template>
  <section class="p-4">
    <h1 class="h3 mb-4">Вес</h1>

    <button
      v-if="step === 'start'"
      type="button"
      class="btn btn-primary w-100"
      @click="emit('navigate', 'entry')"
    >
      Добавить вес
    </button>

    <form v-else-if="step === 'entry'" @submit.prevent="emit('navigate', 'saved')">
      <label for="demo-weight" class="form-label">Вес, кг</label>
      <input
        id="demo-weight"
        v-model="weight"
        class="form-control mb-3"
        type="number"
        min="0.1"
        step="0.1"
        required
      />
      <button type="submit" class="btn btn-primary w-100">Сохранить</button>
    </form>

    <div v-else-if="step === 'saved'" class="alert alert-success" role="status">
      {{ weight ? `Замер сохранён · ${weight} кг` : 'Замер сохранён' }}
    </div>
  </section>
</template>
