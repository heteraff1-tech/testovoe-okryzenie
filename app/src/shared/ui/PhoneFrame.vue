<script setup>
import { onMounted, onScopeDispose, ref } from 'vue';

defineProps({ active: Boolean });

const frame = ref(null);
const scale = ref(1);
const caseWidth = 434;
let observer;

onMounted(() => {
  const measure = () => {
    scale.value = frame.value.getBoundingClientRect().width / caseWidth;
  };
  measure();
  observer = new ResizeObserver(measure);
  observer.observe(frame.value);
});

onScopeDispose(() => observer?.disconnect());
</script>

<template>
  <div
    ref="frame"
    class="phone"
    :style="{ '--device-scale': scale }"
    aria-label="Мокап iPhone 18 Pro"
    role="group"
  >
    <div class="case">
      <div class="rail" aria-hidden="true"></div>
      <div class="display bg-body" :data-bs-theme="active ? 'light' : 'dark'">
        <div v-if="active" class="surface">
          <slot />
        </div>
        <div
          class="status d-flex justify-content-between align-items-center fw-semibold"
          aria-hidden="true"
        >
          <span>9:41</span>
          <div class="status-icons d-flex align-items-center gap-1">
            <span class="signal d-flex align-items-end"> <i></i><i></i><i></i><i></i> </span>
            <span class="battery"></span>
          </div>
        </div>
        <div class="island" aria-hidden="true"></div>
        <div class="home-indicator" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Геометрия корпуса и экрана взята из PhonePreview СберЗдоровья.
.phone {
  position: relative;
  width: min(434px, 100cqw, calc(100cqh * 434 / 906));
  aspect-ratio: 434 / 906;
}

.case {
  position: absolute;
  width: 434px;
  height: 906px;
  transform: scale(var(--device-scale));
  transform-origin: top left;
  border-radius: calc(2 * var(--bs-border-radius-xxl) + var(--ds-space-1));
  background: linear-gradient(
    145deg,
    var(--bs-gray-500),
    var(--bs-gray-800) 20%,
    var(--bs-gray-600) 37%,
    var(--bs-gray-900) 69%,
    var(--bs-gray-700)
  );
}

.case::before {
  content: '';
  position: absolute;
  inset: var(--ds-space-1);
  border: var(--bs-border-width) solid var(--bs-gray-700);
  border-radius: calc(2 * var(--bs-border-radius-xxl));
  background: var(--bs-black);
}

.rail,
.rail::before,
.rail::after,
.case::after {
  position: absolute;
  width: 3px;
  border-radius: var(--bs-border-radius-sm);
  background: var(--bs-gray-600);
}

.rail {
  top: 179px;
  left: -2px;
  height: 28px;
}

.rail::before,
.rail::after,
.case::after {
  content: '';
}

.rail::before {
  top: 49px;
  height: 61px;
}

.rail::after {
  top: 121px;
  height: 61px;
}

.case::after {
  top: 248px;
  right: -2px;
  height: 89px;
}

.display {
  position: absolute;
  inset: var(--ds-space-3);
  isolation: isolate;
  overflow: hidden;
  border-radius: calc(
    var(--bs-border-radius-xxl) + var(--bs-border-radius-xl) + var(--bs-border-radius)
  );
  color: var(--bs-body-color);
}

.display[data-bs-theme='dark'] {
  --bs-body-bg-rgb: var(--bs-black-rgb);
}

.surface {
  position: absolute;
  inset: 54px 0 24px;
  overflow: auto;
  overscroll-behavior: contain;
}

.status {
  position: absolute;
  inset: 0 var(--ds-space-4) auto;
  height: 54px;
  pointer-events: none;
  padding-inline: var(--ds-space-3);
}

.signal {
  height: 12px;
}

.signal i {
  width: 3px;
  background: currentColor;
  border-radius: var(--bs-border-radius-sm);
  margin-inline-end: calc(var(--ds-space-1) / 4);
}

.signal i:nth-child(1) {
  height: 30%;
}
.signal i:nth-child(2) {
  height: 50%;
}
.signal i:nth-child(3) {
  height: 75%;
}
.signal i:nth-child(4) {
  height: 100%;
}

.battery {
  width: 22px;
  height: 11px;
  border: var(--bs-border-width) solid currentColor;
  border-radius: var(--bs-border-radius-sm);
  background: linear-gradient(90deg, currentColor 75%, transparent 75%);
}

.island {
  position: absolute;
  top: 13px;
  left: 50%;
  width: 112px;
  height: 30px;
  transform: translateX(-50%);
  border: var(--bs-border-width) solid var(--bs-gray-900);
  border-radius: var(--bs-border-radius-pill);
  background: var(--bs-black);
  pointer-events: none;
}

.home-indicator {
  position: absolute;
  bottom: var(--ds-space-2);
  left: 50%;
  width: 134px;
  height: 5px;
  transform: translateX(-50%);
  border-radius: var(--bs-border-radius-pill);
  background: currentColor;
  opacity: 0.55;
  pointer-events: none;
}
</style>
