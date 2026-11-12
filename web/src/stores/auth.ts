import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchMe, loginUser, registerUser, type AuthUser } from '@/lib/authApi'

const TOKEN_KEY = 'dh-auth-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(null)
  const pending = ref(false)
  const bootstrapped = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => Boolean(user.value?.is_admin))

  function setToken(value: string | null) {
    token.value = value
    if (value) localStorage.setItem(TOKEN_KEY, value)
    else localStorage.removeItem(TOKEN_KEY)
  }

  async function refreshMe() {
    if (!token.value) {
      user.value = null
      bootstrapped.value = true
      return null
    }
    try {
      user.value = await fetchMe(token.value)
      return user.value
    } catch {
      setToken(null)
      user.value = null
      return null
    } finally {
      bootstrapped.value = true
    }
  }

  async function login(identifier: string, password: string) {
    pending.value = true
    try {
      const result = await loginUser({ identifier, password })
      setToken(result.access_token)
      await refreshMe()
      return result
    } finally {
      pending.value = false
    }
  }

  async function register(payload: { username: string; email: string; password: string }) {
    pending.value = true
    try {
      await registerUser(payload)
      const result = await loginUser({ identifier: payload.username, password: payload.password })
      setToken(result.access_token)
      await refreshMe()
      return result
    } finally {
      pending.value = false
    }
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  return {
    token,
    user,
    pending,
    bootstrapped,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    refreshMe,
  }
})
