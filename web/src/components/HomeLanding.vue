<script setup lang="ts">
import { motion } from 'motion-v'
import { RouterLink } from 'vue-router'
import { APP_NAME } from '@/config'
import { guides } from '@/data/guides'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const ease = [0.22, 1, 0.36, 1] as const
const auth = useAuthStore()
</script>

<template>
  <div class="page">
    <header class="top">
      <div class="top__inner">
        <RouterLink class="logo" to="/" :aria-label="`${APP_NAME} — на главную`">
          <img class="logo__mark" src="/logo.png" alt="" width="48" height="48" />
          <span class="logo__name">{{ APP_NAME }}</span>
        </RouterLink>

        <button class="search" type="button" aria-label="Поиск (скоро)">
          <span class="search__icon" aria-hidden="true">⌕</span>
          <span class="search__label">Поиск инструкций…</span>
          <kbd class="search__kbd">⌘K</kbd>
        </button>

        <div class="top__actions">
          <ThemeSwitcher />
          <nav v-if="!auth.isAuthenticated" class="auth-links" aria-label="Аккаунт">
            <RouterLink class="auth-links__item auth-links__item--primary" to="/login">Войти</RouterLink>
            <span class="auth-links__slash" aria-hidden="true">/</span>
            <RouterLink class="auth-links__item" to="/register">Регистрация</RouterLink>
          </nav>
          <nav v-else class="auth-links" aria-label="Аккаунт">
            <RouterLink class="auth-links__item auth-links__item--primary" to="/cabinet">
              Кабинет
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <section class="hero" aria-label="Главный экран">
      <div class="hero__copy">
        <motion.p
          class="brand"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.55, ease }"
        >
          {{ APP_NAME }}
        </motion.p>

        <motion.h1
          class="headline"
          :initial="{ opacity: 0, y: 18 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.65, delay: 0.08, ease }"
        >
          Инструкции для Linux без хаоса
        </motion.h1>

        <motion.p
          class="lead"
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.16, ease }"
        >
          Чистые Markdown-гайды: установка приложений, настройка сервисов и команды, которые
          можно сразу копировать.
        </motion.p>

        <motion.div
          class="cta"
          :initial="{ opacity: 0, y: 14 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.55, delay: 0.26, ease }"
        >
          <a class="btn btn--primary" href="#guides">Смотреть гайды</a>
          <a class="btn btn--ghost" href="#preview">Как выглядят инструкции</a>
        </motion.div>
      </div>

      <motion.div
        id="preview"
        class="preview"
        aria-hidden="true"
        :initial="{ opacity: 0, y: 28, scale: 0.98 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :transition="{ duration: 0.85, delay: 0.2, ease }"
      >
        <div class="preview__chrome">
          <aside class="preview__nav">
            <div class="preview__brand">
              <img class="preview__logo" src="/logo.png" alt="" width="16" height="16" />
              <span>{{ APP_NAME }}</span>
            </div>
            <div class="preview__search">
              <span>Поиск…</span>
              <kbd>⌘K</kbd>
            </div>
            <nav class="preview__menu">
              <p class="preview__group">Старт</p>
              <span class="preview__item">Введение</span>
              <span class="preview__item preview__item--active">Установка</span>
              <span class="preview__item">Проверка</span>
              <p class="preview__group">Стек</p>
              <span class="preview__item">Docker</span>
              <span class="preview__item">Nginx</span>
            </nav>
          </aside>

          <div class="preview__doc">
            <p class="preview__crumb">Docker / Установка</p>
            <h2 class="preview__h">Установка Docker на Ubuntu</h2>
            <p class="preview__p">
              Обновите пакеты и установите зависимости перед добавлением официального репозитория.
            </p>
            <div class="preview__code">
              <div class="preview__tabs">
                <span class="preview__tab preview__tab--on">Ubuntu</span>
                <span class="preview__tab">Debian</span>
                <span class="preview__tab">Fedora</span>
              </div>
              <pre><code><span class="tok-cmd">sudo</span> apt update
<span class="tok-cmd">sudo</span> apt install -y ca-certificates curl</code></pre>
            </div>
            <p class="preview__p">
              Каталог ключей: <code class="inline">/etc/apt/keyrings</code>
            </p>
          </div>

          <aside class="preview__toc">
            <p class="preview__toc-title">На этой странице</p>
            <span class="preview__toc-item preview__toc-item--on">Установка</span>
            <span class="preview__toc-item">Зависимости</span>
            <span class="preview__toc-item">Репозиторий</span>
            <span class="preview__toc-item">Проверка</span>
          </aside>
        </div>
      </motion.div>
    </section>

    <section id="guides" class="guides" aria-labelledby="guides-title">
      <motion.div
        class="guides__head"
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.4 }"
        :transition="{ duration: 0.6, ease }"
      >
        <h2 id="guides-title" class="section-title">Гайды</h2>
        <p class="section-lead">Начни с базового стека — каждый гайд откроется как страница инструкции.</p>
      </motion.div>

      <ul class="guides__list">
        <motion.li
          v-for="(guide, index) in guides"
          :key="guide.slug"
          :initial="{ opacity: 0, y: 16 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.5 }"
          :transition="{ duration: 0.5, delay: 0.06 * index, ease }"
        >
          <RouterLink
            v-if="guide.ready"
            class="guide"
            :to="`/guides/${guide.slug}`"
          >
            <span class="guide__main">
              <span class="guide__title">{{ guide.title }}</span>
              <span class="guide__blurb">{{ guide.blurb }}</span>
            </span>
            <span class="guide__time">{{ guide.time }}</span>
            <span class="guide__arrow" aria-hidden="true">→</span>
          </RouterLink>
          <div v-else class="guide guide--soon" aria-disabled="true">
            <span class="guide__main">
              <span class="guide__title">{{ guide.title }}</span>
              <span class="guide__blurb">{{ guide.blurb }}</span>
            </span>
            <span class="guide__time">скоро</span>
            <span class="guide__arrow" aria-hidden="true">·</span>
          </div>
        </motion.li>
      </ul>
    </section>

    <section class="format" aria-labelledby="format-title">
      <motion.div
        class="format__inner"
        :initial="{ opacity: 0, y: 22 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.35 }"
        :transition="{ duration: 0.65, ease }"
      >
        <h2 id="format-title" class="section-title">Почему Markdown</h2>
        <p class="section-lead">
          Один файл — одна инструкция. Легко править, версионировать и читать с телефона или
          сервера.
        </p>

        <div class="format__grid">
          <article class="format__item">
            <h3>Шаги без шума</h3>
            <p>Только команды, проверки и короткие пояснения.</p>
          </article>
          <article class="format__item">
            <h3>Копируй и запускай</h3>
            <p>Блоки кода с табами под разные дистрибутивы.</p>
          </article>
          <article class="format__item">
            <h3>Оглавление рядом</h3>
            <p>Быстрый прыжок по разделам длинного гайда.</p>
          </article>
        </div>
      </motion.div>
    </section>

    <footer class="footer">
      <span class="footer__brand">{{ APP_NAME }}</span>
      <span class="footer__note">Markdown-инструкции для Linux</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, var(--dh-accent-soft), transparent 55%),
    var(--dh-bg);
  color: var(--dh-ink);
}

.top {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: color-mix(in oklab, var(--dh-bg) 82%, transparent);
  border-bottom: 1px solid var(--dh-border);
}

@media (max-width: 720px) {
  .top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    transform: translateZ(0);
    padding-top: env(safe-area-inset-top, 0px);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: color-mix(in oklab, var(--dh-bg) 82%, transparent);
  }

  .page {
    padding-top: calc(4.25rem + env(safe-area-inset-top, 0px));
  }
}

.top__inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  justify-self: start;
}

.logo__mark {
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.logo__name {
  font-family: var(--dh-font-display);
  font-weight: 600;
  font-size: 0.98rem;
  letter-spacing: -0.03em;
}

.search {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: min(320px, 42vw);
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--dh-border);
  border-radius: 999px;
  background: var(--dh-elevated);
  color: var(--dh-faint);
  font: inherit;
  cursor: default;
}

.search__icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.search__label {
  flex: 1;
  text-align: left;
  font-size: 0.86rem;
}

.search__kbd {
  font-family: var(--dh-font-mono);
  font-size: 0.7rem;
  color: var(--dh-muted);
  background: var(--dh-surface);
  border: 1px solid var(--dh-border-strong);
  border-radius: 5px;
  padding: 0.12rem 0.35rem;
}

.top__actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.auth-links {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  font-family: var(--dh-font-display);
  font-size: 0.9rem;
  letter-spacing: -0.03em;
}

.auth-links__item {
  color: var(--dh-muted);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.auth-links__item:hover {
  color: var(--dh-ink);
}

.auth-links__item--primary {
  color: var(--dh-ink);
  font-weight: 700;
}

.auth-links__item--primary:hover {
  color: var(--dh-heading);
}

.auth-links__slash {
  color: var(--dh-faint);
  font-size: 1.15em;
  font-weight: 500;
  line-height: 1;
  user-select: none;
}

.hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(2.5rem, 7vh, 4.5rem) 1.25rem clamp(3rem, 8vh, 5rem);
  display: grid;
  gap: clamp(2rem, 5vw, 3.5rem);
  align-items: center;
}

.brand {
  font-family: var(--dh-font-display);
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  margin-bottom: 0.85rem;
  color: var(--dh-heading);
}

.headline {
  font-family: var(--dh-font-display);
  font-size: clamp(2.2rem, 5.5vw, 3.6rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.05;
  max-width: 12ch;
  margin-bottom: 1rem;
  color: var(--dh-heading);
}

.lead {
  font-size: clamp(1rem, 1.8vw, 1.12rem);
  color: var(--dh-muted);
  max-width: 34rem;
  margin-bottom: 1.6rem;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.7rem 1.1rem;
  border-radius: var(--dh-radius-sm);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.btn--primary {
  background: var(--dh-btn-primary-bg);
  color: var(--dh-btn-primary-fg);
}

.btn--primary:hover {
  filter: brightness(1.05);
}

.btn--ghost {
  color: var(--dh-muted);
  border: 1px solid var(--dh-border);
  background: transparent;
}

.btn--ghost:hover {
  color: var(--dh-ink);
  border-color: var(--dh-border-strong);
}

.preview {
  width: 100%;
}

.preview__chrome {
  display: grid;
  grid-template-columns: 11.5rem 1fr 9rem;
  min-height: 22rem;
  border: 1px solid var(--dh-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--dh-surface);
  box-shadow: 0 24px 60px color-mix(in oklab, #000 25%, transparent);
}

.preview__nav {
  border-right: 1px solid var(--dh-border);
  padding: 0.9rem 0.75rem;
  background: var(--dh-sidebar);
}

.preview__brand {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--dh-ink);
}

.preview__logo {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.preview__search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--dh-faint);
  border: 1px solid var(--dh-border);
  border-radius: 999px;
  padding: 0.35rem 0.5rem;
  margin-bottom: 0.9rem;
  background: var(--dh-elevated);
}

.preview__search kbd {
  font-family: var(--dh-font-mono);
  font-size: 0.58rem;
  border: 1px solid var(--dh-border-strong);
  border-radius: 4px;
  padding: 0.05rem 0.25rem;
}

.preview__group {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dh-faint);
  margin: 0.65rem 0 0.35rem;
}

.preview__item {
  display: block;
  font-size: 0.74rem;
  color: var(--dh-muted);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.15rem;
}

.preview__item--active {
  background: var(--dh-nav-active-bg);
  color: var(--dh-nav-active-fg);
  box-shadow: inset 2px 0 0 var(--dh-nav-active-bar);
}

.preview__doc {
  padding: 1.15rem 1.25rem 1.35rem;
  min-width: 0;
}

.preview__crumb {
  font-size: 0.7rem;
  color: var(--dh-faint);
  margin-bottom: 0.55rem;
}

.preview__h {
  font-family: var(--dh-font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.55rem;
}

.preview__p {
  font-size: 0.78rem;
  color: var(--dh-muted);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.preview__code {
  border: 1px solid var(--dh-code-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--dh-code-bg);
  margin-bottom: 0.75rem;
}

.preview__tabs {
  display: flex;
  gap: 0.15rem;
  padding: 0.4rem 0.45rem 0;
  border-bottom: 1px solid var(--dh-border);
}

.preview__tab {
  font-size: 0.65rem;
  color: var(--dh-faint);
  padding: 0.35rem 0.55rem;
  border-radius: 6px 6px 0 0;
}

.preview__tab--on {
  color: var(--dh-ink);
  background: var(--dh-elevated);
}

.preview__code pre {
  margin: 0;
  padding: 0.75rem 0.85rem;
  font-family: var(--dh-font-mono);
  font-size: 0.72rem;
  line-height: 1.55;
  color: var(--dh-code-fg);
  overflow: hidden;
}

.tok-cmd {
  color: var(--dh-tok-keyword);
}

.inline {
  font-family: var(--dh-font-mono);
  font-size: 0.72rem;
  background: var(--dh-code-inline-bg);
  border: 1px solid var(--dh-border);
  border-radius: 4px;
  padding: 0.08rem 0.3rem;
  color: var(--dh-code-inline-fg);
}

.preview__toc {
  border-left: 1px solid var(--dh-border);
  padding: 1.15rem 0.85rem;
  background: var(--dh-sidebar);
}

.preview__toc-title {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dh-faint);
  margin-bottom: 0.55rem;
}

.preview__toc-item {
  display: block;
  font-size: 0.7rem;
  color: var(--dh-muted);
  padding: 0.28rem 0;
}

.preview__toc-item--on {
  color: var(--dh-toc-active);
}

.guides,
.format {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.25rem clamp(3.5rem, 9vw, 5.5rem);
}

.guides__head,
.format__inner {
  margin-bottom: 1.75rem;
}

.section-title {
  font-family: var(--dh-font-display);
  font-size: clamp(1.55rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  margin-bottom: 0.55rem;
}

.section-lead {
  color: var(--dh-muted);
  max-width: 36rem;
  font-size: 1rem;
}

.guides__list {
  list-style: none;
  border-top: 1px solid var(--dh-border);
}

.guide {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1.1rem 0.2rem;
  border-bottom: 1px solid var(--dh-border);
  text-decoration: none;
  transition: background 0.2s ease, padding-left 0.2s ease;
}

.guide:hover {
  background: var(--dh-hover-bg);
  padding-left: 0.4rem;
}

.guide--soon {
  opacity: 0.48;
  cursor: default;
}

.guide--soon:hover {
  background: transparent;
  padding-left: 0.2rem;
}

.guide__main {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.guide__title {
  font-family: var(--dh-font-display);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}

.guide__blurb {
  font-size: 0.9rem;
  color: var(--dh-muted);
}

.guide__time {
  font-family: var(--dh-font-mono);
  font-size: 0.75rem;
  color: var(--dh-faint);
}

.guide__arrow {
  color: var(--dh-accent);
  transition: transform 0.2s ease;
}

.guide:hover .guide__arrow {
  transform: translateX(3px);
}

.format__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.75rem;
}

.format__item {
  padding: 1.15rem 1.1rem;
  border: 1px solid var(--dh-border);
  border-radius: var(--dh-radius);
  background: var(--dh-surface);
}

.format__item h3 {
  font-family: var(--dh-font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 0.4rem;
}

.format__item p {
  font-size: 0.9rem;
  color: var(--dh-muted);
}

.footer {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.25rem 1.25rem 2rem;
  border-top: 1px solid var(--dh-border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  justify-content: space-between;
  color: var(--dh-faint);
  font-size: 0.86rem;
}

.footer__brand {
  font-family: var(--dh-font-display);
  font-weight: 600;
  color: var(--dh-ink);
  letter-spacing: -0.02em;
}

@media (min-width: 960px) {
  .hero {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
    min-height: calc(100vh - 4.5rem);
    min-height: calc(100dvh - 4.5rem);
    padding-top: 0;
    padding-bottom: 0;
  }
}

@media (max-width: 900px) {
  .preview__chrome {
    grid-template-columns: 1fr;
  }

  .preview__nav,
  .preview__toc {
    display: none;
  }

  .format__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .top__inner {
    grid-template-columns: 1fr auto;
  }

  .search {
    display: none;
  }

  .guide {
    grid-template-columns: 1fr auto;
  }

  .guide__time {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guide:hover .guide__arrow {
    transform: none;
  }
}
</style>
