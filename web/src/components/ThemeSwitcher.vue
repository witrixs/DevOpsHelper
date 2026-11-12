<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type Component } from 'vue'
import { Monitor, Moon, Sun } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import type { ThemePreference } from '@/lib/theme'

const { preference, resolved, setPreference } = useTheme()
const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
/** up = над кнопкой (футер сайдбара), down = под кнопкой (шапка) */
const placement = ref<'up' | 'down'>('down')

const options: { id: ThemePreference; label: string; icon: Component }[] = [
  { id: 'light', label: 'Светлая', icon: Sun },
  { id: 'dark', label: 'Тёмная', icon: Moon },
  { id: 'system', label: 'Системная', icon: Monitor },
]

const TriggerIcon = computed(() => (resolved.value === 'light' ? Sun : Moon))

function updatePlacement() {
  if (!rootEl.value) return
  const rect = rootEl.value.getBoundingClientRect()
  const menuApproxHeight = 150
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  placement.value =
    spaceBelow < menuApproxHeight && spaceAbove > spaceBelow ? 'up' : 'down'
}

function toggle() {
  if (!open.value) updatePlacement()
  open.value = !open.value
}

function choose(id: ThemePreference) {
  setPreference(id)
  open.value = false
}

function onDocPointer(event: PointerEvent) {
  if (!open.value || !rootEl.value) return
  if (event.target instanceof Node && !rootEl.value.contains(event.target)) {
    open.value = false
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="rootEl" class="theme">
    <div
      v-if="open"
      class="theme__menu"
      :class="placement === 'up' ? 'theme__menu--up' : 'theme__menu--down'"
      role="menu"
      aria-label="Тема оформления"
    >
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="theme__option"
        :class="{ 'theme__option--active': preference === option.id }"
        role="menuitemradio"
        :aria-checked="preference === option.id"
        @click="choose(option.id)"
      >
        <component :is="option.icon" class="theme__icon" :stroke-width="2" aria-hidden="true" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <button
      type="button"
      class="theme__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="`Тема: ${options.find((o) => o.id === preference)?.label}`"
      @click="toggle"
    >
      <component :is="TriggerIcon" class="theme__trigger-icon" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.theme {
  position: relative;
  display: inline-flex;
}

.theme__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dh-faint);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.theme__trigger:hover {
  color: var(--dh-ink);
  background: var(--dh-hover-bg);
}

.theme__trigger-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.theme__menu {
  position: absolute;
  right: 0;
  z-index: 40;
  min-width: 10.5rem;
  padding: 0.3rem;
  border: 1px solid var(--dh-border);
  border-radius: 10px;
  background: var(--dh-popover);
  box-shadow: var(--dh-popover-shadow);
}

.theme__menu--down {
  top: calc(100% + 0.45rem);
}

.theme__menu--up {
  bottom: calc(100% + 0.45rem);
}

.theme__option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dh-ink);
  font: inherit;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;
}

.theme__option:hover {
  background: var(--dh-hover-bg);
}

.theme__option--active {
  background: var(--dh-elevated);
}

.theme__icon {
  width: 1rem;
  height: 1rem;
  color: var(--dh-faint);
  flex-shrink: 0;
}

.theme__option--active .theme__icon {
  color: var(--dh-ink);
}
</style>
