<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { APP_NAME } from '@/config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { AuthApiError } from '@/lib/authApi'
import { deleteGuide, fetchMyGuides, type GuideListItem } from '@/lib/guidesApi'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const guides = ref<GuideListItem[]>([])
const loading = ref(false)
const error = ref('')

async function loadGuides() {
  if (!auth.isAdmin || !auth.token) return
  loading.value = true
  error.value = ''
  try {
    guides.value = await fetchMyGuides(auth.token)
  } catch (err) {
    error.value = err instanceof AuthApiError ? err.message : 'Не удалось загрузить гайды'
  } finally {
    loading.value = false
  }
}

async function onDelete(guide: GuideListItem) {
  if (!auth.token) return
  if (!window.confirm(`Удалить гайд «${guide.title}»?`)) return
  try {
    await deleteGuide(auth.token, guide.id)
    guides.value = guides.value.filter((item) => item.id !== guide.id)
  } catch (err) {
    error.value = err instanceof AuthApiError ? err.message : 'Не удалось удалить'
  }
}

function logout() {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  if (!auth.bootstrapped) await auth.refreshMe()
  if (!auth.isAuthenticated) {
    router.replace('/login')
    return
  }
  await loadGuides()
})
</script>

<template>
  <div class="cabinet">
    <header class="top">
      <div class="top__inner">
        <RouterLink class="logo" to="/" :aria-label="`${APP_NAME} — на главную`">
          <img class="logo__mark" src="/logo.png" alt="" width="40" height="40" />
          <span class="logo__name">{{ APP_NAME }}</span>
        </RouterLink>
        <div class="top__actions">
          <ThemeSwitcher />
          <button type="button" class="ghost" @click="logout">Выйти</button>
        </div>
      </div>
    </header>

    <main class="main">
      <section v-if="auth.isAdmin" class="admin">
        <div class="hero">
          <div>
            <p class="eyebrow">Личный кабинет</p>
            <h1>Гайды</h1>
            <p class="lead">
              Привет, <strong>{{ auth.user?.username }}</strong>. Создавай, редактируй и публикуй
              инструкции.
            </p>
          </div>
          <RouterLink class="btn" to="/cabinet/guides/new">Новый гайд</RouterLink>
        </div>

        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p v-if="loading" class="muted">Загрузка…</p>

        <div v-else-if="!guides.length" class="empty">
          <p>Пока нет гайдов. Создай первый.</p>
          <RouterLink class="btn btn--ghost" to="/cabinet/guides/new">Создать гайд</RouterLink>
        </div>

        <ul v-else class="list">
          <li v-for="guide in guides" :key="guide.id" class="card">
            <div class="card__main">
              <div class="card__meta">
                <span>{{ guide.group_name }}</span>
                <span>·</span>
                <span>{{ guide.read_time }}</span>
                <span
                  class="badge"
                  :class="guide.is_published ? 'badge--on' : 'badge--off'"
                >
                  {{ guide.is_published ? 'Опубликован' : 'Черновик' }}
                </span>
              </div>
              <h2>{{ guide.title }}</h2>
              <p>{{ guide.blurb || guide.description }}</p>
            </div>
            <div class="card__actions">
              <RouterLink class="link" :to="`/cabinet/guides/${guide.id}`">Редактировать</RouterLink>
              <RouterLink v-if="guide.is_published" class="link" :to="`/guides/${guide.slug}`">
                Открыть
              </RouterLink>
              <button type="button" class="danger" @click="onDelete(guide)">Удалить</button>
            </div>
          </li>
        </ul>
      </section>

      <section v-else class="pending">
        <div class="pending__card">
          <p class="eyebrow">Личный кабинет</p>
          <h1>Профиль пока недоступен</h1>
          <p>
            Аккаунт <strong>{{ auth.user?.username }}</strong> зарегистрирован. Дождитесь проверки
            администратором приложения — после этого здесь появится доступ к кабинету.
          </p>
          <RouterLink class="btn" to="/">На главную</RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.cabinet {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 70% 40% at 50% -10%, var(--dh-accent-soft), transparent 70%),
    var(--dh-bg);
  color: var(--dh-ink);
}

.top {
  border-bottom: 1px solid var(--dh-border);
  backdrop-filter: blur(12px);
  background: color-mix(in oklab, var(--dh-bg) 84%, transparent);
}

.top__inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  color: inherit;
}

.logo__mark {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 9px;
  object-fit: cover;
}

.logo__name {
  font-family: var(--dh-font-display);
  font-weight: 650;
  letter-spacing: -0.03em;
}

.top__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.ghost {
  appearance: none;
  border: 1px solid var(--dh-border);
  background: transparent;
  color: var(--dh-muted);
  border-radius: var(--dh-radius-sm);
  padding: 0.45rem 0.75rem;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
}

.ghost:hover {
  color: var(--dh-ink);
  background: var(--dh-hover-bg);
}

.main {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  font-size: 0.78rem;
  color: var(--dh-faint);
  margin-bottom: 0.35rem;
}

h1 {
  font-family: var(--dh-font-display);
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  letter-spacing: -0.04em;
  margin-bottom: 0.4rem;
}

.lead {
  color: var(--dh-muted);
  max-width: 36rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: var(--dh-btn-primary-bg);
  color: var(--dh-btn-primary-fg);
  border-radius: var(--dh-radius);
  padding: 0.7rem 1rem;
  font-weight: 650;
  font-size: 0.9rem;
  border: 0;
}

.btn--ghost {
  background: transparent;
  color: var(--dh-ink);
  border: 1px solid var(--dh-border);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}

.card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--dh-border);
  border-radius: 14px;
  background: color-mix(in oklab, var(--dh-surface) 90%, transparent);
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  color: var(--dh-faint);
  font-size: 0.78rem;
  margin-bottom: 0.35rem;
}

.card h2 {
  font-family: var(--dh-font-display);
  font-size: 1.15rem;
  letter-spacing: -0.03em;
  margin-bottom: 0.25rem;
}

.card p {
  color: var(--dh-muted);
  font-size: 0.9rem;
}

.badge {
  border-radius: 999px;
  padding: 0.12rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 650;
}

.badge--on {
  background: color-mix(in oklab, #34d399 18%, transparent);
  color: #34d399;
}

.badge--off {
  background: var(--dh-hover-bg);
  color: var(--dh-muted);
}

.card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.link {
  color: var(--dh-ink);
  font-weight: 600;
  font-size: 0.86rem;
  text-decoration: none;
  border-bottom: 1px solid var(--dh-border-strong);
}

.danger {
  appearance: none;
  border: 0;
  background: transparent;
  color: #f87171;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
}

.empty,
.muted,
.error {
  color: var(--dh-muted);
}

.error {
  color: #f87171;
  margin-bottom: 0.75rem;
}

.pending {
  display: grid;
  place-items: center;
  min-height: 60vh;
}

.pending__card {
  width: min(520px, 100%);
  padding: 1.6rem 1.4rem;
  border: 1px solid var(--dh-border);
  border-radius: 16px;
  background: color-mix(in oklab, var(--dh-surface) 90%, transparent);
  text-align: left;
}

.pending__card h1 {
  margin-bottom: 0.7rem;
}

.pending__card p {
  color: var(--dh-muted);
  margin-bottom: 1.2rem;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
