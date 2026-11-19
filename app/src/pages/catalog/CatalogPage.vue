<script setup>
import { computed, ref } from 'vue';
import { figmaUrl, searchComponents } from '@/shared/design-system/catalog.js';

const query = ref('');
const components = computed(() => searchComponents(query.value));
const dark = ref(false);
</script>

<template>
  <div :data-bs-theme="dark ? 'dark' : 'light'" class="min-vh-100 bg-body text-body">
    <main class="container py-4 py-md-5">
      <header class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 class="display-6 mb-2">Bootstrap 5.3</h1>
          <a :href="figmaUrl">Библиотека компонентов Figma</a>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :aria-pressed="dark"
          @click="dark = !dark"
        >
          Тёмная тема
        </button>
      </header>

      <section aria-labelledby="catalog-title">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <h2 id="catalog-title" class="h4 mb-0">Привязки компонентов</h2>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#translation-help"
          >
            Как перенести макет
          </button>
        </div>
        <label class="form-label" for="component-search">Компонент, класс или ключ Figma</label>
        <input id="component-search" v-model="query" type="search" class="form-control mb-3" />
        <p aria-live="polite" class="text-body-secondary">Найдено: {{ components.length }}</p>
        <p v-if="!components.length">Нет совпадений. Проверьте имя или ключ компонента.</p>
        <ul v-else class="list-group">
          <li v-for="component in components" :key="component.figmaKey" class="list-group-item">
            <div class="d-flex flex-wrap justify-content-between gap-2">
              <a :href="component.source" class="text-break">{{ component.figmaName }}</a>
              <code v-if="component.implementation">{{ component.implementation }}</code>
              <span v-else class="badge text-bg-secondary align-self-start">Нужна Vue-обёртка</span>
            </div>
            <span class="small text-body-secondary">{{ component.role }}</span>
          </li>
        </ul>
      </section>

      <div
        id="translation-help"
        class="modal fade"
        tabindex="-1"
        aria-labelledby="translation-title"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="translation-title" class="modal-title fs-5">Перенос из Figma</h2>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Закрыть"
              ></button>
            </div>
            <div class="modal-body">
              <ol class="mb-0">
                <li>Найдите опубликованный компонент по имени или ключу Figma.</li>
                <li>Откройте его строку в каталоге, чтобы проверить вариант и назначение.</li>
                <li>Возьмите указанный класс Bootstrap для разметки Vue.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
