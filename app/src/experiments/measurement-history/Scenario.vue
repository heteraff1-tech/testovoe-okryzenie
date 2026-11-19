<script setup>
defineProps({ parameters: Object, step: String, variant: String });
</script>

<template>
  <section class="p-4">
    <h1 class="h3 mb-4">История замеров</h1>
    <p v-if="parameters.data === 'empty'" class="text-body-secondary mb-0">Замеров пока нет.</p>
    <ul v-else class="list-group">
      <li class="list-group-item d-flex justify-content-between">
        <span>Сегодня</span><strong>72 кг</strong>
      </li>
      <li class="list-group-item d-flex justify-content-between">
        <span>Вчера</span><strong>73 кг</strong>
      </li>
    </ul>
  </section>
</template>
