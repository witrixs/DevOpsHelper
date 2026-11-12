<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { APP_NAME, APP_TAGLINE } from '@/config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

withDefaults(
  defineProps<{
    title: string
    subtitle: string
    image?: string
  }>(),
  {
    image: '/auth-img.png',
  },
)
</script>

<template>
  <div class="auth">
    <aside class="auth__visual" aria-hidden="true">
      <img class="auth__image" :src="image" alt="" />
      <div class="auth__visual-fade" />
      <div class="auth__visual-copy">
        <p class="auth__visual-brand">{{ APP_NAME }}</p>
        <p class="auth__visual-tag">{{ APP_TAGLINE }}</p>
      </div>
    </aside>

    <section class="auth__side">
      <header class="auth__top">
        <RouterLink class="logo" to="/" :aria-label="`${APP_NAME} — на главную`">
          <img class="logo__mark" src="/logo.png" alt="" width="44" height="44" />
          <span class="logo__text">
            <span class="logo__name">{{ APP_NAME }}</span>
            <span class="logo__tag">{{ APP_TAGLINE }}</span>
          </span>
        </RouterLink>
        <ThemeSwitcher />
      </header>

      <main class="auth__main">
        <div class="panel">
          <div class="panel__intro">
            <h1 class="panel__title">{{ title }}</h1>
            <p class="panel__subtitle">{{ subtitle }}</p>
          </div>
          <div class="panel__body">
            <slot />
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<style scoped>
.auth {
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  color: var(--dh-ink);
  background: var(--dh-bg);
  overflow: hidden;
}

.auth__visual {
  position: relative;
  overflow: hidden;
  border-right: 1px solid var(--dh-border);
  background: #050505;
}

.auth__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 5.5rem;
}

.auth__visual-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.72) 0%, transparent 38%);
  pointer-events: none;
}

.auth__visual-copy {
  position: absolute;
  left: 2rem;
  right: 2rem;
  bottom: 2rem;
  z-index: 1;
}

.auth__visual-brand {
  font-family: var(--dh-font-display);
  font-size: clamp(1.6rem, 2.4vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #fff;
  margin-bottom: 0.25rem;
}

.auth__visual-tag {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.72);
}

.auth__side {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
  height: 100%;
  background:
    radial-gradient(ellipse 70% 45% at 80% -10%, var(--dh-accent-soft), transparent 70%),
    var(--dh-bg);
}

.auth__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.15rem;
  padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: inherit;
}

.logo__mark {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 9px;
  object-fit: cover;
}

.logo__text {
  display: grid;
  gap: 0.05rem;
}

.logo__name {
  font-family: var(--dh-font-display);
  font-weight: 650;
  font-size: 0.98rem;
  letter-spacing: -0.03em;
}

.logo__tag {
  font-size: 0.72rem;
  color: var(--dh-faint);
}

.auth__main {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 0;
  padding: 0.75rem 1.15rem 1.15rem;
}

.panel {
  width: min(360px, 100%);
}

.panel__intro {
  margin-bottom: 0.85rem;
}

.panel__title {
  font-family: var(--dh-font-display);
  font-size: clamp(1.35rem, 2.2vw, 1.65rem);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.12;
  color: var(--dh-heading);
  margin-bottom: 0.3rem;
}

.panel__subtitle {
  font-size: 0.84rem;
  color: var(--dh-muted);
  line-height: 1.4;
}

.panel__body {
  padding: 0;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    overflow: auto;
  }

  .auth__visual {
    display: none;
  }

  .auth__side {
    min-height: 100vh;
    min-height: 100dvh;
  }
}
</style>
