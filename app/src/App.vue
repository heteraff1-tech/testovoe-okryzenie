<script setup>
import { computed, onMounted, onScopeDispose, ref } from 'vue';
import CatalogPage from './pages/catalog/CatalogPage.vue';
import PreviewPage from './pages/preview/PreviewPage.vue';

const route = ref(window.location.hash);
const experimentId = computed(() => route.value.match(/^#experiment\/([a-z0-9-]+)$/)?.[1] ?? '');

function syncRoute() {
  route.value = window.location.hash;
}

function selectExperiment(id) {
  const hash = id ? `#experiment/${id}` : '';
  window.history.pushState(null, '', hash || window.location.pathname + window.location.search);
  syncRoute();
}

onMounted(() => window.addEventListener('hashchange', syncRoute));
onScopeDispose(() => window.removeEventListener('hashchange', syncRoute));
</script>

<template>
  <CatalogPage v-if="route === '#library'" />
  <PreviewPage v-else :experiment-id="experimentId" @select="selectExperiment" />
</template>
