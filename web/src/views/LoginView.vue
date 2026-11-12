<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff } from '@lucide/vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import { AuthApiError } from '@/lib/authApi'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  const id = identifier.value.trim()
  if (!id || !password.value) {
    error.value = 'Заполните все поля'
    return
  }

  try {
    await auth.login(id, password.value)
    const next = typeof route.query.next === 'string' ? route.query.next : '/cabinet'
    await router.push(next || '/cabinet')
  } catch (err) {
    if (err instanceof AuthApiError) {
      error.value =
        err.status === 401
          ? 'Неверный логин/почта или пароль'
          : err.message || 'Не удалось войти'
      return
    }
    error.value = 'Сервер недоступен. Попробуйте позже.'
  }
}
</script>

<template>
  <AuthShell
    title="Вход"
    subtitle="Введите логин или почту и пароль."
    image="/auth-img.png"
  >
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="field__label">Логин или почта</span>
        <input
          v-model="identifier"
          class="field__input"
          type="text"
          inputmode="email"
          autocomplete="username"
          placeholder="yourname или you@example.com"
          required
        />
      </label>

      <label class="field">
        <span class="field__label">Пароль</span>
        <div class="field__password">
          <input
            v-model="password"
            class="field__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="field__toggle"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="18" :stroke-width="1.9" />
            <Eye v-else :size="18" :stroke-width="1.9" />
          </button>
        </div>
      </label>

      <p v-if="error" class="form__error" role="alert">{{ error }}</p>

      <button class="submit" type="submit" :disabled="auth.pending">
        {{ auth.pending ? 'Входим…' : 'Войти' }}
      </button>

      <p class="form__footer">
        Нет аккаунта?
        <RouterLink to="/register">Зарегистрироваться</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.7rem;
}

.form > .submit {
  margin-top: 0.55rem;
}

.field {
  display: grid;
  gap: 0.3rem;
}

.field__label {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--dh-muted);
}

.field__input {
  width: 100%;
  appearance: none;
  border: 1px solid var(--dh-border);
  border-radius: var(--dh-radius);
  background: var(--dh-elevated);
  color: var(--dh-ink);
  font: inherit;
  font-size: 0.9rem;
  padding: 0.62rem 0.8rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field__input:focus {
  border-color: color-mix(in oklab, var(--dh-accent) 55%, var(--dh-border-strong));
  box-shadow: 0 0 0 3px var(--dh-accent-soft);
}

.field__input::placeholder {
  color: var(--dh-faint);
  opacity: 0.9;
}

.field__input[type='password']::placeholder {
  letter-spacing: 0.22em;
}

.field__password {
  position: relative;
}

.field__password .field__input {
  padding-right: 2.8rem;
}

.field__toggle {
  position: absolute;
  top: 50%;
  right: 0.45rem;
  transform: translateY(-50%);
  display: inline-grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dh-faint);
  cursor: pointer;
}

.field__toggle:hover {
  color: var(--dh-ink);
  background: var(--dh-hover-bg);
}

.form__error {
  margin: 0;
  font-size: 0.86rem;
  color: #f87171;
  background: color-mix(in oklab, #f87171 12%, transparent);
  border: 1px solid color-mix(in oklab, #f87171 28%, transparent);
  border-radius: var(--dh-radius-sm);
  padding: 0.65rem 0.8rem;
}

.submit {
  appearance: none;
  border: 0;
  border-radius: var(--dh-radius);
  background: var(--dh-btn-primary-bg);
  color: var(--dh-btn-primary-fg);
  font: inherit;
  font-weight: 650;
  font-size: 0.9rem;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: filter 0.2s ease, opacity 0.2s ease;
}

.submit:hover:not(:disabled) {
  filter: brightness(1.05);
}

.submit:disabled {
  opacity: 0.65;
  cursor: wait;
}

.form__footer {
  margin: 0.15rem 0 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--dh-muted);
}

.form__footer a {
  color: var(--dh-ink);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid var(--dh-border-strong);
}

.form__footer a:hover {
  border-bottom-color: var(--dh-ink);
}
</style>
