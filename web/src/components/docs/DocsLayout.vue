<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown, PanelLeft, Search } from '@lucide/vue'
import { APP_NAME } from '@/config'
import { guides, type GuideMeta } from '@/data/guides'
import type { TocItem } from '@/lib/markdown'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const props = defineProps<{
  guide: GuideMeta
  toc: TocItem[]
}>()

const navGuides = guides
const activeId = ref('')
const navOpen = ref(false)
const tocOpen = ref(false)
const mobileChromeEl = ref<HTMLElement | null>(null)
const mobileChromeHeight = ref(0)
let chromeObserver: ResizeObserver | null = null

const mainStyle = computed(() =>
  mobileChromeHeight.value > 0
    ? ({ '--mobile-chrome-h': `${mobileChromeHeight.value}px` } as Record<string, string>)
    : undefined,
)

function syncMobileChromeHeight() {
  if (!mobileChromeEl.value) {
    mobileChromeHeight.value = 0
    return
  }
  // Низ триггера TOC / хедера — без выпадающей панели
  const end =
    (mobileChromeEl.value.querySelector('.mobile-toc__trigger') as HTMLElement | null) ??
    (mobileChromeEl.value.querySelector('.mobile-bar') as HTMLElement | null)
  mobileChromeHeight.value = end ? Math.ceil(end.getBoundingClientRect().bottom) : 0
}

const tocIds = computed(() => props.toc.map((item) => item.id))

const activeIndex = computed(() => {
  const idx = tocIds.value.indexOf(activeId.value)
  return idx >= 0 ? idx : 0
})

const activeTocItem = computed(() => {
  if (!props.toc.length) return null
  return props.toc[activeIndex.value] ?? props.toc[0] ?? null
})

/** Прогресс чтения 0..1 для кольца */
const tocProgress = computed(() => {
  const total = props.toc.length
  if (total <= 0) return 0
  if (total === 1) return 1
  return (activeIndex.value + 1) / total
})

const ringStyle = computed(() => {
  const size = 18
  const stroke = 1.75
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - tocProgress.value)
  return {
    size,
    stroke,
    radius,
    circumference,
    offset,
  }
})

function syncActiveFromScroll() {
  const ids = tocIds.value
  if (!ids.length) return

  const offset = 120
  const scrollY = window.scrollY
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  const positions: { id: string; top: number }[] = []
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    positions.push({ id, top: el.getBoundingClientRect().top + scrollY })
  }
  if (!positions.length) return

  if (scrollY < 8) {
    activeId.value = positions[0]!.id
    return
  }

  const marker = scrollY + offset
  let index = 0
  for (let i = 0; i < positions.length; i++) {
    if (positions[i]!.top <= marker) index = i
    else break
  }

  let lastReachable = positions.length - 1
  while (lastReachable > 0 && positions[lastReachable]!.top > maxScroll + offset) {
    lastReachable -= 1
  }

  const remaining = positions.length - 1 - lastReachable
  if (remaining > 0 && index >= lastReachable) {
    const start = Math.max(0, positions[lastReachable]!.top - offset)
    const range = Math.max(1, maxScroll - start)
    const t = Math.min(1, Math.max(0, (scrollY - start) / range))
    const slot = t >= 1 ? remaining : Math.floor(t * remaining)
    index = lastReachable + slot
  }

  if (maxScroll > 0 && scrollY >= maxScroll - 2) {
    index = positions.length - 1
  }

  activeId.value = positions[index]!.id
}

function onScroll() {
  syncActiveFromScroll()
}

function openNav() {
  navOpen.value = true
  tocOpen.value = false
}

function closeNav() {
  navOpen.value = false
}

function toggleToc() {
  tocOpen.value = !tocOpen.value
}

function onTocNavigate(id: string) {
  activeId.value = id
  tocOpen.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    navOpen.value = false
    tocOpen.value = false
  }
}

watch(
  tocIds,
  async (ids) => {
    activeId.value = ids[0] ?? ''
    await nextTick()
    syncActiveFromScroll()
  },
  { immediate: true },
)

watch(navOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', syncMobileChromeHeight, { passive: true })
  document.addEventListener('keydown', onKey)
  syncActiveFromScroll()
  nextTick(() => {
    syncMobileChromeHeight()
    if (mobileChromeEl.value && typeof ResizeObserver !== 'undefined') {
      chromeObserver = new ResizeObserver(() => syncMobileChromeHeight())
      chromeObserver.observe(mobileChromeEl.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', syncMobileChromeHeight)
  document.removeEventListener('keydown', onKey)
  chromeObserver?.disconnect()
  chromeObserver = null
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="docs" :class="{ 'docs--nav-open': navOpen }">
    <div
      v-if="navOpen"
      class="nav-backdrop"
      aria-hidden="true"
      @click="closeNav"
    />

    <aside class="sidebar" aria-label="Навигация по гайдам">
      <RouterLink class="brand" to="/" :aria-label="`${APP_NAME} — на главную`" @click="closeNav">
        <img class="brand__mark" src="/logo.png" alt="" width="44" height="44" />
        <span class="brand__name">{{ APP_NAME }}</span>
      </RouterLink>

      <button class="search" type="button" aria-label="Поиск (скоро)">
        <Search class="search__lucide" :stroke-width="2" aria-hidden="true" />
        <span class="search__label">Поиск…</span>
        <kbd>⌘K</kbd>
      </button>

      <nav class="nav">
        <p class="nav__group">Старт</p>
        <RouterLink class="nav__link" to="/" @click="closeNav">Главная</RouterLink>

        <p class="nav__group">Гайды</p>
        <template v-for="item in navGuides" :key="item.slug">
          <RouterLink
            v-if="item.ready"
            class="nav__link"
            :class="{ 'nav__link--active': item.slug === guide.slug }"
            :to="`/guides/${item.slug}`"
            @click="closeNav"
          >
            {{ item.title }}
          </RouterLink>
          <span v-else class="nav__link nav__link--soon" :title="'Скоро'">
            {{ item.title }}
            <em>soon</em>
          </span>
        </template>
      </nav>

      <div class="sidebar__foot">
        <span class="sidebar__meta">Markdown · Linux</span>
        <ThemeSwitcher />
      </div>
    </aside>

    <div class="main" :style="mainStyle">
      <!-- На body: иначе iOS/WebKit двигает fixed+blur вместе со скроллом -->
      <Teleport to="body">
        <div ref="mobileChromeEl" class="mobile-chrome">
          <header class="mobile-bar">
            <RouterLink class="brand brand--compact" to="/">
              <img class="brand__mark" src="/logo.png" alt="" width="44" height="44" />
              <span class="brand__name">{{ APP_NAME }}</span>
            </RouterLink>

            <div class="mobile-bar__actions">
              <button class="icon-btn" type="button" aria-label="Поиск (скоро)">
                <Search :size="18" :stroke-width="2" aria-hidden="true" />
              </button>
              <button
                class="icon-btn"
                type="button"
                aria-label="Открыть меню"
                :aria-expanded="navOpen"
                @click="openNav"
              >
                <PanelLeft :size="18" :stroke-width="2" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div v-if="toc.length" class="mobile-toc">
            <button
              type="button"
              class="mobile-toc__trigger"
              :aria-expanded="tocOpen"
              aria-controls="mobile-toc-panel"
              @click="toggleToc"
            >
              <span class="mobile-toc__status" aria-hidden="true">
                <svg
                  :width="ringStyle.size"
                  :height="ringStyle.size"
                  :viewBox="`0 0 ${ringStyle.size} ${ringStyle.size}`"
                >
                  <circle
                    class="mobile-toc__ring-track"
                    :cx="ringStyle.size / 2"
                    :cy="ringStyle.size / 2"
                    :r="ringStyle.radius"
                    fill="none"
                    :stroke-width="ringStyle.stroke"
                  />
                  <circle
                    class="mobile-toc__ring-value"
                    :cx="ringStyle.size / 2"
                    :cy="ringStyle.size / 2"
                    :r="ringStyle.radius"
                    fill="none"
                    :stroke-width="ringStyle.stroke"
                    :stroke-dasharray="ringStyle.circumference"
                    :stroke-dashoffset="ringStyle.offset"
                    stroke-linecap="round"
                    :transform="`rotate(-90 ${ringStyle.size / 2} ${ringStyle.size / 2})`"
                  />
                </svg>
              </span>

              <span class="mobile-toc__label">{{ activeTocItem?.text ?? guide.title }}</span>

              <ChevronDown
                class="mobile-toc__chevron"
                :class="{ 'mobile-toc__chevron--open': tocOpen }"
                :size="16"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>

            <nav
              v-show="tocOpen"
              id="mobile-toc-panel"
              class="mobile-toc__panel"
              aria-label="На этой странице"
            >
              <p class="mobile-toc__heading">
                <span class="mobile-toc__heading-icon" aria-hidden="true">
                  <span /><span /><span />
                </span>
                На этой странице
              </p>
              <div class="mobile-toc__list">
                <a
                  v-for="item in toc"
                  :key="item.id"
                  class="mobile-toc__link"
                  :class="{
                    'mobile-toc__link--h3': item.level === 3,
                    'mobile-toc__link--active': item.id === activeId,
                  }"
                  :href="`#${item.id}`"
                  :aria-current="item.id === activeId ? 'location' : undefined"
                  @click="onTocNavigate(item.id)"
                >
                  {{ item.text }}
                </a>
              </div>
            </nav>
          </div>
        </div>
      </Teleport>

      <article class="article">
        <p class="crumb">
          <RouterLink to="/">Гайды</RouterLink>
          <span aria-hidden="true">/</span>
          <span>{{ guide.title }}</span>
        </p>
        <slot />
      </article>
    </div>

    <aside v-if="toc.length" class="toc" aria-label="На этой странице">
      <p class="toc__title">
        <span class="toc__title-icon" aria-hidden="true">
          <span /><span /><span />
        </span>
        На этой странице
      </p>
      <nav class="toc__nav">
        <a
          v-for="item in toc"
          :key="item.id"
          class="toc__link"
          :class="{
            'toc__link--h3': item.level === 3,
            'toc__link--active': item.id === activeId,
          }"
          :href="`#${item.id}`"
          :aria-current="item.id === activeId ? 'location' : undefined"
          @click="activeId = item.id"
        >
          {{ item.text }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
.docs {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 17rem minmax(0, 1fr) 18rem;
  background: var(--dh-bg);
  color: var(--dh-ink);
}

.nav-backdrop {
  display: none;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 0.9rem 1.25rem;
  border-right: 1px solid var(--dh-border);
  background: var(--dh-sidebar);
  overflow: auto;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  color: inherit;
  padding: 0.25rem 0.35rem;
}

.brand__mark {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 9px;
  object-fit: cover;
  flex-shrink: 0;
}

.brand__name {
  font-family: var(--dh-font-display);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.03em;
}

.search {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--dh-border);
  border-radius: 999px;
  background: var(--dh-elevated);
  color: var(--dh-faint);
  font: inherit;
  font-size: 0.82rem;
  cursor: default;
}

.search__lucide {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
}

.search__label {
  flex: 1;
  text-align: left;
}

.search kbd {
  font-family: var(--dh-font-mono);
  font-size: 0.65rem;
  border: 1px solid var(--dh-border-strong);
  border-radius: 4px;
  padding: 0.1rem 0.3rem;
  color: var(--dh-muted);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.nav__group {
  margin: 0.85rem 0 0.35rem;
  padding: 0 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dh-faint);
}

.nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem;
  border-radius: 7px;
  text-decoration: none;
  color: var(--dh-muted);
  font-size: 0.88rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav__link:hover {
  color: var(--dh-ink);
  background: var(--dh-hover-bg);
}

.nav__link--active {
  color: var(--dh-nav-active-fg);
  background: var(--dh-nav-active-bg);
  box-shadow: inset 2px 0 0 var(--dh-nav-active-bar);
}

.nav__link--soon {
  opacity: 0.55;
  cursor: default;
}

.nav__link--soon em {
  font-style: normal;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dh-faint);
}

.sidebar__foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.15rem 0.15rem;
  border-top: 1px solid var(--dh-border);
  padding-top: 0.75rem;
}

.sidebar__meta {
  font-size: 0.75rem;
  color: var(--dh-faint);
}

.main {
  min-width: 0;
}

.mobile-chrome {
  display: none;
}

.mobile-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--dh-border);
  background: transparent;
  isolation: isolate;
}

.mobile-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: color-mix(in oklab, var(--dh-bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.mobile-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dh-muted);
  cursor: pointer;
}

.icon-btn:hover {
  color: var(--dh-ink);
  background: var(--dh-hover-bg);
}

.mobile-toc {
  position: relative;
  border-bottom: 1px solid var(--dh-border);
}

.mobile-toc__trigger {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 0;
  background: transparent;
  color: var(--dh-muted);
  font: inherit;
  font-size: 0.92rem;
  text-align: left;
  cursor: pointer;
  isolation: isolate;
}

.mobile-toc__trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: color-mix(in oklab, var(--dh-bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.mobile-toc__status {
  display: inline-flex;
  width: 18px;
  height: 18px;
}

.mobile-toc__ring-track {
  stroke: color-mix(in oklab, var(--dh-faint) 45%, transparent);
}

.mobile-toc__ring-value {
  stroke: var(--dh-ink);
  transition: stroke-dashoffset 0.25s ease;
}

.mobile-toc__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-toc__chevron {
  color: var(--dh-faint);
  transition: transform 0.2s ease;
}

.mobile-toc__chevron--open {
  transform: rotate(180deg);
}

.mobile-toc__panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 35;
  max-height: min(55vh, 24rem);
  overflow: auto;
  padding: 0.85rem 1rem 1rem;
  border-bottom: 1px solid var(--dh-border);
  background: color-mix(in oklab, var(--dh-bg) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 28px color-mix(in oklab, #000 22%, transparent);
}

.mobile-toc__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--dh-faint);
}

.mobile-toc__heading-icon {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5px;
  width: 0.8rem;
}

.mobile-toc__heading-icon span {
  display: block;
  height: 1.5px;
  background: var(--dh-faint);
  border-radius: 1px;
}

.mobile-toc__list {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--dh-toc-rail);
}

.mobile-toc__link {
  position: relative;
  padding: 0.5rem 0.85rem 0.5rem 1rem;
  color: var(--dh-toc-fg);
  text-decoration: none;
  font-size: 0.92rem;
  line-height: 1.45;
  transition: color 0.15s ease;
}

.mobile-toc__link:hover {
  color: var(--dh-ink);
}

.mobile-toc__link--h3 {
  padding-left: 1.75rem;
  font-size: 0.88rem;
}

.mobile-toc__link--active {
  color: var(--dh-toc-active);
}

.mobile-toc__link--active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0.2rem;
  bottom: 0.2rem;
  width: 2px;
  background: var(--dh-nav-active-bar);
  border-radius: 1px;
}

.article {
  max-width: 52rem;
  margin: 0;
  padding: clamp(2rem, 4vw, 3rem) clamp(1.75rem, 4vw, 3rem) 3.5rem;
}

.crumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.9rem;
  color: var(--dh-faint);
  margin-bottom: 1.5rem;
}

.crumb a {
  color: var(--dh-muted);
  text-decoration: none;
}

.crumb a:hover {
  color: var(--dh-accent);
}

.toc {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  padding: 2rem 1.35rem 2rem 0.85rem;
  overflow: auto;
}

.toc__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--dh-faint);
  margin-bottom: 1rem;
}

.toc__title-icon {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.5px;
  width: 0.8rem;
}

.toc__title-icon span {
  display: block;
  height: 1.5px;
  background: var(--dh-faint);
  border-radius: 1px;
}

.toc__nav {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--dh-toc-rail);
}

.toc__link {
  position: relative;
  font-size: 0.92rem;
  color: var(--dh-toc-fg);
  text-decoration: none;
  padding: 0.5rem 0.85rem 0.5rem 1rem;
  line-height: 1.45;
  transition: color 0.15s ease;
}

.toc__link:hover {
  color: var(--dh-ink);
}

.toc__link--active {
  color: var(--dh-toc-active);
}

.toc__link--active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0.2rem;
  bottom: 0.2rem;
  width: 2px;
  background: var(--dh-nav-active-bar);
  border-radius: 1px;
}

.toc__link--h3 {
  padding-left: 1.75rem;
  font-size: 0.88rem;
}

@media (max-width: 1200px) {
  .docs {
    grid-template-columns: 16rem minmax(0, 1fr) 16rem;
  }
}

@media (max-width: 1100px) {
  .docs {
    grid-template-columns: 15rem minmax(0, 1fr);
  }

  .toc {
    display: none;
  }
}

@media (max-width: 800px) {
  .docs {
    grid-template-columns: 1fr;
  }

  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.55);
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    width: min(18.5rem, 88vw);
    height: 100dvh;
    transform: translateX(-105%);
    transition: transform 0.22s ease;
    border-right: 1px solid var(--dh-border);
    box-shadow: 8px 0 30px rgba(0, 0, 0, 0.35);
  }

  .docs--nav-open .sidebar {
    transform: translateX(0);
  }

  .mobile-chrome {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    overflow: visible;
    padding-top: env(safe-area-inset-top, 0px);
    /* Отдельный композитный слой — не едет со страницей на WebKit */
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .main {
    padding-top: var(--mobile-chrome-h, 6.5rem);
  }

  .article {
    padding: 1.35rem 1rem 3rem;
  }
}
</style>
