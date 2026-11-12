<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Eye, EyeOff } from '@lucide/vue'
import AuthShell from '@/components/auth/AuthShell.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import { AuthApiError } from '@/lib/authApi'
import { evaluatePassword } from '@/lib/passwordStrength'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const error = ref('')

const strength = computed(() => evaluatePassword(password.value))
const showStrength = computed(() => password.value.length > 0)
const passwordsMatch = computed(
  () => passwordConfirm.value.length > 0 && password.value === passwordConfirm.value,
)
const passwordReady = computed(
  () => strength.value.checks.every((check) => check.ok) && passwordsMatch.value,
)
const canSubmit = computed(() => passwordReady.value && !auth.pending)

async function onSubmit() {
  error.value = ''
  const login = username.value.trim()
  const mail = email.value.trim()

  if (!login || !mail || !password.value || !passwordConfirm.value) {
    error.value = 'Заполните все поля'
    return
  }
  if (login.length < 3) {
    error.value = 'Логин должен быть не короче 3 символов'
    return
  }
  if (!mail.includes('@')) {
    error.value = 'Введите корректную почту'
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = 'Пароли не совпадают'
    return
  }
  if (!strength.value.checks.every((check) => check.ok)) {
    error.value = 'Сделайте пароль надёжнее — отметьте все пункты ниже'
    return
  }

  try {
    await auth.register({
      username: login,
      email: mail,
      password: password.value,
    })
    await router.push('/cabinet')
  } catch (err) {
    if (err instanceof AuthApiError) {
      error.value =
        err.status === 400
          ? 'Такой логин или почта уже заняты'
          : err.message || 'Не удалось зарегистрироваться'
      return
    }
    error.value = 'Сервер недоступен. Попробуйте позже.'
  }
}
</script>

<template>
  <AuthShell
    title="Регистрация"
    subtitle="Логин, почта и надёжный пароль — дальше можно в гайды."
    image="/reg-img.png"
  >
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="field__label">Логин</span>
        <input
          v-model="username"
          class="field__input"
          type="text"
          autocomplete="username"
          placeholder="yourname"
          minlength="3"
          maxlength="100"
          required
        />
      </label>

      <label class="field">
        <span class="field__label">Почта</span>
        <input
          v-model="email"
          class="field__input"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <div class="password-block">
        <label class="field">
          <span class="field__label">Пароль</span>
          <div class="field__password">
            <input
              v-model="password"
              class="field__input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
              minlength="6"
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

        <div class="strength-slot" :class="{ 'is-open': showStrength }">
          <div class="strength-slot__inner">
            <PasswordStrength :password="password" />
          </div>
        </div>
      </div>

      <label class="field">
        <span class="field__label">Повторите пароль</span>
        <div class="field__password">
          <input
            v-model="passwordConfirm"
            class="field__input"
            :class="{
              'is-ok': passwordsMatch,
              'is-bad': passwordConfirm && !passwordsMatch,
            }"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
          <button
            type="button"
            class="field__toggle"
            :aria-label="showConfirm ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showConfirm = !showConfirm"
          >
            <EyeOff v-if="showConfirm" :size="18" :stroke-width="1.9" />
            <Eye v-else :size="18" :stroke-width="1.9" />
          </button>
        </div>
        <span v-if="passwordConfirm && !passwordsMatch" class="field__hint is-bad">
          Пароли пока не совпадают
        </span>
        <span v-else-if="passwordsMatch" class="field__hint is-ok">Пароли совпадают</span>
      </label>

      <p v-if="error" class="form__error" role="alert">{{ error }}</p>

      <button class="submit" type="submit" :disabled="!canSubmit">
        {{ auth.pending ? 'Создаём…' : 'Создать аккаунт' }}
      </button>

      <p class="form__footer">
        Уже есть аккаунт?
        <RouterLink to="/login">Войти</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.65rem;
}

.form > .submit {
  margin-top: 0.45rem;
}

.password-block {
  display: grid;
  gap: 0;
}

.strength-slot {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.strength-slot.is-open {
  grid-template-rows: 1fr;
}

.strength-slot__inner {
  min-height: 0;
  overflow: hidden;
  padding-top: 0;
  opacity: 0;
  transform: translateY(-8px);
  transition:
    padding-top 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.strength-slot.is-open .strength-slot__inner {
  padding-top: 0.65rem;
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .strength-slot,
  .strength-slot__inner {
    transition: none;
  }
}

.field {
  display: grid;
  gap: 0.28rem;
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
  padding: 0.58rem 0.8rem;
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

.field__input.is-ok {
  border-color: color-mix(in oklab, #34d399 55%, var(--dh-border));
}

.field__input.is-bad {
  border-color: color-mix(in oklab, #f87171 55%, var(--dh-border));
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

.field__hint {
  font-size: 0.78rem;
}

.field__hint.is-ok {
  color: #34d399;
}

.field__hint.is-bad {
  color: #f87171;
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
  padding: 0.68rem 1rem;
  cursor: pointer;
  transition: filter 0.2s ease, opacity 0.2s ease;
}

.submit:hover:not(:disabled) {
  filter: brightness(1.05);
}

.submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
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
