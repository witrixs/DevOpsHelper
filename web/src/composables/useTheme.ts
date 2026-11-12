import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  applyTheme,
  getStoredThemePreference,
  persistThemePreference,
  resolveTheme,
  type ThemePreference,
} from '@/lib/theme'

const preference = ref<ThemePreference>('system')
const resolved = ref(resolveTheme('system'))
let media: MediaQueryList | null = null
let started = false

function syncResolved() {
  resolved.value = applyTheme(preference.value)
}

function onMediaChange() {
  if (preference.value === 'system') syncResolved()
}

function ensureStarted() {
  if (started || typeof window === 'undefined') return
  started = true
  preference.value = getStoredThemePreference()
  syncResolved()
  media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onMediaChange)
}

export function useTheme() {
  onMounted(() => {
    ensureStarted()
  })

  onUnmounted(() => {
    /* keep listeners for app lifetime — theme is global */
  })

  if (typeof window !== 'undefined') {
    ensureStarted()
  }

  function setPreference(next: ThemePreference) {
    preference.value = next
    persistThemePreference(next)
    syncResolved()
  }

  return {
    preference,
    resolved,
    isDark: computed(() => resolved.value === 'dark'),
    setPreference,
  }
}
