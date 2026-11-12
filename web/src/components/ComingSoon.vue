<script setup lang="ts">
import { motion } from 'motion-v'
import { APP_NAME } from '@/config'
import heroImage from '@/assets/images/hero-servers.jpg'

const tech = [
  { name: 'Docker', detail: 'Контейнеры и образы' },
  { name: 'Kubernetes', detail: 'Оркестрация кластеров' },
  { name: 'Nginx', detail: 'Прокси и балансировка' },
  { name: 'Linux', detail: 'Базовая настройка серверов' },
] as const

const ease = [0.22, 1, 0.36, 1] as const
</script>

<template>
  <div class="page">
    <section class="hero" aria-label="Главный экран">
      <motion.div
        class="hero__media"
        :initial="{ scale: 1.08, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :transition="{ duration: 1.6, ease }"
      >
        <img
          class="hero__image"
          :src="heroImage"
          alt="Серверная инфраструктура"
          width="1920"
          height="1080"
        />
        <div class="hero__veil" aria-hidden="true" />
        <div class="hero__grid" aria-hidden="true" />
      </motion.div>

      <div class="hero__content">
        <motion.p
          class="brand"
          :initial="{ opacity: 0, y: 18 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.7, delay: 0.15, ease }"
        >
          {{ APP_NAME }}
        </motion.p>

        <motion.h1
          class="headline"
          :initial="{ opacity: 0, y: 28 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.28, ease }"
        >
          Идёт разработка
        </motion.h1>

        <motion.p
          class="lead"
          :initial="{ opacity: 0, y: 22 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.75, delay: 0.42, ease }"
        >
          Скоро здесь появится помощник для установки и настройки Docker, Kubernetes, Nginx и
          других приложений на ваших серверах.
        </motion.p>

        <motion.div
          class="cta"
          :initial="{ opacity: 0, y: 18 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.7, delay: 0.56, ease }"
        >
          <a class="cta__link" href="#stack">Что готовим</a>
          <span class="status">
            <span class="status__pulse" aria-hidden="true" />
            В разработке
          </span>
        </motion.div>
      </div>
    </section>

    <section id="stack" class="stack">
      <motion.div
        class="stack__inner"
        :initial="{ opacity: 0, y: 36 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true, amount: 0.35 }"
        :transition="{ duration: 0.8, ease }"
      >
        <h2 class="stack__title">Помощь с инфраструктурой</h2>
        <p class="stack__lead">
          Один интерфейс для установки и базовой настройки популярных серверных инструментов.
        </p>

        <ul class="stack__list">
          <motion.li
            v-for="(item, index) in tech"
            :key="item.name"
            class="stack__item"
            :initial="{ opacity: 0, x: -16 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :viewport="{ once: true, amount: 0.6 }"
            :transition="{ duration: 0.55, delay: 0.08 * index, ease }"
          >
            <span class="stack__name">{{ item.name }}</span>
            <span class="stack__detail">{{ item.detail }}</span>
          </motion.li>
        </ul>
      </motion.div>
    </section>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--dh-ink);
  background: var(--dh-deep);
}

.hero {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  align-items: end;
  overflow: hidden;
  padding: clamp(1.5rem, 4vw, 3.5rem);
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform-origin: center;
  animation: drift 28s ease-in-out infinite alternate;
}

.hero__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(8, 22, 28, 0.28) 0%, rgba(8, 22, 28, 0.55) 42%, rgba(6, 16, 22, 0.88) 100%),
    radial-gradient(ellipse 70% 55% at 70% 20%, rgba(34, 168, 168, 0.22), transparent 60%);
}

.hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(232, 244, 242, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232, 244, 242, 0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, transparent, #000 35%, #000 70%, transparent);
  opacity: 0.55;
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 42rem;
  padding-bottom: clamp(1rem, 6vh, 4rem);
}

.brand {
  font-family: var(--dh-font-display);
  font-size: clamp(1.65rem, 4.2vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #f4fbf9;
  margin-bottom: 1.1rem;
}

.headline {
  font-family: var(--dh-font-display);
  font-size: clamp(2.4rem, 7vw, 5.2rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 0.95;
  color: #f7fcfb;
  margin-bottom: 1.15rem;
  max-width: 10ch;
}

.lead {
  font-family: var(--dh-font-body);
  font-size: clamp(1.02rem, 2.1vw, 1.22rem);
  line-height: 1.55;
  color: rgba(226, 240, 236, 0.86);
  max-width: 36rem;
  margin-bottom: 1.75rem;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.4rem;
}

.cta__link {
  font-family: var(--dh-font-body);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #061016;
  background: #d8f5ee;
  text-decoration: none;
  padding: 0.75rem 1.2rem;
  border-radius: 2px;
  transition: background 0.25s ease, transform 0.25s ease;
}

.cta__link:hover {
  background: #ecfffa;
  transform: translateY(-1px);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--dh-font-body);
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #dff7f1;
  border-bottom: 1px solid rgba(214, 246, 236, 0.45);
  padding: 0.35rem 0;
}

.status__pulse {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: #3fd0b6;
  animation: pulse 2.2s ease-out infinite;
}

.stack {
  padding: clamp(4rem, 10vw, 7rem) clamp(1.5rem, 4vw, 3.5rem);
  background:
    linear-gradient(180deg, #061016 0%, #0a1c24 55%, #0d242c 100%);
}

.stack__inner {
  max-width: 52rem;
  margin: 0 auto;
}

.stack__title {
  font-family: var(--dh-font-display);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #f4fbf9;
  margin-bottom: 0.75rem;
}

.stack__lead {
  font-family: var(--dh-font-body);
  font-size: 1.05rem;
  color: rgba(226, 240, 236, 0.78);
  max-width: 34rem;
  margin-bottom: 2.5rem;
}

.stack__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid rgba(214, 246, 236, 0.16);
}

.stack__item {
  display: grid;
  grid-template-columns: minmax(7rem, 12rem) 1fr;
  gap: 1rem;
  align-items: baseline;
  padding: 1.15rem 0;
  border-bottom: 1px solid rgba(214, 246, 236, 0.16);
}

.stack__name {
  font-family: var(--dh-font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #e8fff8;
}

.stack__detail {
  font-family: var(--dh-font-body);
  color: rgba(226, 240, 236, 0.72);
}

@media (min-width: 900px) {
  .hero {
    align-items: center;
  }

  .hero__content {
    padding-bottom: 0;
  }
}

@media (max-width: 560px) {
  .stack__item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}

@keyframes drift {
  from {
    transform: scale(1.02) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.08) translate3d(-1.5%, -1%, 0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(63, 208, 182, 0.5);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(63, 208, 182, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 208, 182, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__image,
  .status__pulse {
    animation: none;
  }
}
</style>
