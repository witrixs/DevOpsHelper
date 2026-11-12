<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { APP_NAME } from '@/config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { AuthApiError } from '@/lib/authApi'
import {
  createGuide,
  fetchGuideById,
  updateGuide,
  type GuidePayload,
} from '@/lib/guidesApi'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')
const guideId = computed(() => (isNew.value ? null : Number(route.params.id)))

const form = reactive<GuidePayload>({
  slug: '',
  title: '',
  blurb: '',
  description: '',
  content: '',
  group_name: 'Общее',
  read_time: '5 мин',
  is_published: false,
})

const loading = ref(false)
const saving = ref(false)
const error = ref('')

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function onTitleInput() {
  if (isNew.value && !form.slug) {
    form.slug = slugify(form.title)
  }
}

async function load() {
  if (!auth.token || isNew.value || !guideId.value) return
  loading.value = true
  error.value = ''
  try {
    const found = await fetchGuideById(auth.token, guideId.value)
    Object.assign(form, {
      slug: found.slug,
      title: found.title,
      blurb: found.blurb,
      description: found.description,
      group_name: found.group_name,
      read_time: found.read_time,
      is_published: found.is_published,
      content: found.content,
    })
  } catch (err) {
    error.value = err instanceof AuthApiError ? err.message : 'Не удалось загрузить гайд'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!auth.token) return
  saving.value = true
  error.value = ''
  try {
    if (isNew.value) {
      const created = await createGuide(auth.token, { ...form })
      await router.replace(`/cabinet/guides/${created.id}`)
    } else if (guideId.value) {
      await updateGuide(auth.token, guideId.value, { ...form })
    }
    await router.push('/cabinet')
  } catch (err) {
    error.value = err instanceof AuthApiError ? err.message : 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!auth.bootstrapped) await auth.refreshMe()
  if (!auth.isAuthenticated) {
    router.replace('/login')
    return
  }
  if (!auth.isAdmin) {
    router.replace('/cabinet')
    return
  }
  await load()
})
</script>

<template>
  <div class="editor">
    <header class="top">
      <div class="top__inner">
        <RouterLink class="back" to="/cabinet">← Кабинет</RouterLink>
        <div class="top__actions">
          <ThemeSwitcher />
          <span class="brand">{{ APP_NAME }}</span>
        </div>
      </div>
    </header>

    <main class="main">
      <h1>{{ isNew ? 'Новый гайд' : 'Редактирование' }}</h1>
      <p v-if="loading" class="muted">Загрузка…</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <form v-if="!loading" class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>Название</span>
          <input v-model="form.title" required maxlength="200" @input="onTitleInput" />
        </label>

        <label class="field">
          <span>Slug</span>
          <input v-model="form.slug" required maxlength="120" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
        </label>

        <div class="row">
          <label class="field">
            <span>Группа</span>
            <input v-model="form.group_name" maxlength="100" />
          </label>
          <label class="field">
            <span>Время чтения</span>
            <input v-model="form.read_time" maxlength="40" />
          </label>
        </div>

        <label class="field">
          <span>Короткое описание</span>
          <input v-model="form.blurb" maxlength="300" />
        </label>

        <label class="field">
          <span>SEO / подпись</span>
          <input v-model="form.description" maxlength="500" />
        </label>

        <label class="field">
          <span>Контент (Markdown)</span>
          <textarea v-model="form.content" rows="16" required />
        </label>

        <label class="check">
          <input v-model="form.is_published" type="checkbox" />
          <span>Опубликовать</span>
        </label>

        <div class="actions">
          <button class="btn" type="submit" :disabled="saving">
            {{ saving ? 'Сохраняем…' : 'Сохранить' }}
          </button>
          <RouterLink class="ghost" to="/cabinet">Отмена</RouterLink>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.editor {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--dh-bg);
  color: var(--dh-ink);
}

.top {
  border-bottom: 1px solid var(--dh-border);
  background: color-mix(in oklab, var(--dh-bg) 86%, transparent);
}

.top__inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back,
.ghost {
  color: var(--dh-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.top__actions {
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
}

.brand {
  font-family: var(--dh-font-display);
  font-weight: 650;
  letter-spacing: -0.03em;
}

.main {
  max-width: 860px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;
}

h1 {
  font-family: var(--dh-font-display);
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
}

.form {
  display: grid;
  gap: 0.85rem;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  font-size: 0.8rem;
  color: var(--dh-muted);
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--dh-border);
  border-radius: var(--dh-radius);
  background: var(--dh-elevated);
  color: var(--dh-ink);
  font: inherit;
  padding: 0.65rem 0.8rem;
}

.field textarea {
  font-family: var(--dh-font-mono);
  font-size: 0.86rem;
  line-height: 1.5;
  resize: vertical;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.85rem;
  align-items: center;
}

.btn {
  appearance: none;
  border: 0;
  border-radius: var(--dh-radius);
  background: var(--dh-btn-primary-bg);
  color: var(--dh-btn-primary-fg);
  font: inherit;
  font-weight: 650;
  padding: 0.7rem 1rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.error {
  color: #f87171;
}

.muted {
  color: var(--dh-muted);
}

@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
