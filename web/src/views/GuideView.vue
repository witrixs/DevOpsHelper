<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DocsLayout from '@/components/docs/DocsLayout.vue'
import { getGuide } from '@/data/guides'
import { loadGuideMarkdown } from '@/content/guides'
import { renderGuideMarkdown } from '@/lib/markdown'

const route = useRoute()

const slug = computed(() => String(route.params.slug ?? ''))

const guide = computed(() => getGuide(slug.value))

const rendered = computed(() => {
  const source = loadGuideMarkdown(slug.value)
  if (!source) return null
  return renderGuideMarkdown(source)
})

async function onMarkdownClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const button = target.closest('.code-block__copy')
  if (!(button instanceof HTMLButtonElement)) return

  const block = button.closest('.code-block')
  const code = block?.querySelector('code')
  const text = code?.textContent ?? ''
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    button.classList.add('is-copied')
    button.setAttribute('aria-label', 'Скопировано')
    button.setAttribute('title', 'Скопировано')
    window.setTimeout(() => {
      button.classList.remove('is-copied')
      button.setAttribute('aria-label', 'Копировать')
      button.setAttribute('title', 'Копировать')
    }, 1600)
  } catch {
    button.setAttribute('title', 'Не удалось скопировать')
  }
}
</script>

<template>
  <DocsLayout v-if="guide && rendered && guide.ready" :guide="guide" :toc="rendered.toc">
    <div class="md" v-html="rendered.html" @click="onMarkdownClick" />
  </DocsLayout>

  <div v-else class="missing">
    <h1>Гайд не найден</h1>
    <p>Такой инструкции ещё нет или она в черновике.</p>
    <RouterLink to="/">На главную</RouterLink>
  </div>
</template>

<style scoped>
.missing {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  text-align: center;
  padding: 2rem;
  background: var(--dh-bg);
  color: var(--dh-ink);
}

.missing h1 {
  font-family: var(--dh-font-display);
  letter-spacing: -0.03em;
}

.missing p {
  color: var(--dh-muted);
}

.missing a {
  color: var(--dh-accent);
}

.md :deep(h1) {
  font-family: var(--dh-font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.15;
  margin: 0 0 1.15rem;
  color: var(--dh-heading);
}

.md :deep(h2) {
  font-family: var(--dh-font-display);
  font-size: clamp(1.45rem, 2.4vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  margin: 2.5rem 0 1rem;
  padding-top: 0.35rem;
  color: var(--dh-heading);
  scroll-margin-top: 1.25rem;
}

.md :deep(h3) {
  font-family: var(--dh-font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 1.75rem 0 0.75rem;
  color: var(--dh-ink);
  scroll-margin-top: 1.25rem;
}

.md :deep(p),
.md :deep(li) {
  color: var(--dh-body);
  font-size: 1.05rem;
  line-height: 1.75;
}

.md :deep(p) {
  margin: 0 0 1.15rem;
}

.md :deep(ul),
.md :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.35rem;
}

.md :deep(li + li) {
  margin-top: 0.45rem;
}

.md :deep(a) {
  color: var(--dh-accent);
  text-decoration: none;
}

.md :deep(a:hover) {
  text-decoration: underline;
}

.md :deep(strong) {
  color: var(--dh-ink);
  font-weight: 600;
}

.md :deep(code) {
  font-family: var(--dh-font-mono);
  font-size: 0.9em;
  background: var(--dh-code-inline-bg);
  border: 1px solid var(--dh-border);
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
  color: var(--dh-code-inline-fg);
}

.md :deep(.code-block) {
  /* PasarGuard / fumadocs: bg-fd-card + rounded-xl + border */
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  margin: 0 0 1.4rem;
  border: 1px solid var(--dh-code-border);
  border-radius: 0.75rem;
  background: var(--dh-code-bg);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.md :deep(.code-block--single) {
  align-items: center;
  min-height: 3rem;
}

.md :deep(.code-block__copy) {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0.5rem 0 0;
  padding: 0;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--dh-code-copy);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.md :deep(.code-block--single .code-block__copy) {
  margin-top: 0;
}

.md :deep(.code-block__copy:hover) {
  color: var(--dh-code-copy-hover);
}

.md :deep(.code-block__icon) {
  width: 1rem;
  height: 1rem;
}

.md :deep(.code-block__icon--check) {
  display: none;
}

.md :deep(.code-block__copy.is-copied) {
  color: #86efac;
}

.md :deep(.code-block__copy.is-copied .code-block__icon--copy) {
  display: none;
}

.md :deep(.code-block__copy.is-copied .code-block__icon--check) {
  display: block;
}

.md :deep(.code-block pre) {
  grid-column: 1;
  grid-row: 1;
  margin: 0;
  padding: 0.875rem 0.65rem 0.875rem 1rem;
  min-width: 0;
  overflow-x: auto;
  background: transparent;
}

.md :deep(.code-block pre code) {
  border: 0;
  background: transparent;
  padding: 0;
  font-family: var(--dh-font-mono);
  /* text-[13px] + text-sm wrapper как у PasarGuard */
  font-size: 13px;
  font-weight: 450;
  line-height: 1.65;
  color: var(--dh-code-fg);
  white-space: pre;
  /* subpixel = плотнее/насыщеннее, чем body antialiased */
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}

/* Shiki github-dark / github-light */
.md :deep(.tok-keyword),
.md :deep(.tok-command) {
  color: var(--dh-tok-keyword);
}

.md :deep(.tok-flag) {
  color: var(--dh-tok-flag);
}

.md :deep(.tok-string),
.md :deep(.tok-punct),
.md :deep(.tok-url),
.md :deep(.tok-variable),
.md :deep(.tok-plain) {
  color: var(--dh-tok-string);
}

.md :deep(.tok-operator) {
  color: var(--dh-tok-operator);
}

.md :deep(.tok-comment) {
  color: var(--dh-tok-comment);
}

.md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1.5rem;
  font-size: 0.98rem;
}

.md :deep(th),
.md :deep(td) {
  border: 1px solid var(--dh-border);
  padding: 0.65rem 0.75rem;
  text-align: left;
}

.md :deep(th) {
  background: var(--dh-elevated);
  color: var(--dh-ink);
  font-weight: 600;
}

.md :deep(td) {
  color: var(--dh-muted);
}

.md :deep(hr) {
  border: 0;
  border-top: 1px solid var(--dh-border);
  margin: 2rem 0;
}

.md :deep(blockquote) {
  margin: 0 0 1.15rem;
  padding: 0.15rem 0 0.15rem 0.9rem;
  border-left: 3px solid var(--dh-border-strong);
  color: var(--dh-muted);
}
</style>
