import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { APP_NAME } from '@/config'
import { getGuide } from '@/data/guides'
import { applyPageMeta, guidePageMeta, homePageMeta, type PageMeta } from '@/lib/seo'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/guides/:slug',
      name: 'guide',
      component: () => import('../views/GuideView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/cabinet',
      name: 'cabinet',
      component: () => import('../views/CabinetView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cabinet/guides/:id',
      name: 'cabinet-guide-edit',
      component: () => import('../views/GuideEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

function authPageMeta(kind: 'login' | 'register' | 'cabinet'): PageMeta {
  if (kind === 'login') {
    return {
      title: `Вход | ${APP_NAME}`,
      description: `Войдите в ${APP_NAME} по логину или почте.`,
      imageAlt: `Вход — ${APP_NAME}`,
      type: 'website',
    }
  }
  if (kind === 'register') {
    return {
      title: `Регистрация | ${APP_NAME}`,
      description: `Создайте аккаунт ${APP_NAME}: логин, почта и надёжный пароль.`,
      imageAlt: `Регистрация — ${APP_NAME}`,
      type: 'website',
    }
  }
  return {
    title: `Кабинет | ${APP_NAME}`,
    description: `Личный кабинет ${APP_NAME}.`,
    imageAlt: `Кабинет — ${APP_NAME}`,
    type: 'website',
  }
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.bootstrapped) {
    await auth.refreshMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { next: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'cabinet' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'cabinet' }
  }
  return true
})

router.afterEach((to) => {
  if (to.name === 'guide') {
    const guide = getGuide(String(to.params.slug ?? ''))
    applyPageMeta(guide ? guidePageMeta(guide) : homePageMeta())
    return
  }
  if (to.name === 'login' || to.name === 'register') {
    applyPageMeta(authPageMeta(to.name))
    return
  }
  if (to.name === 'cabinet' || to.name === 'cabinet-guide-edit') {
    applyPageMeta(authPageMeta('cabinet'))
    return
  }
  applyPageMeta(homePageMeta())
})

export default router
