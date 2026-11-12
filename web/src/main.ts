import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router'
import { applyTheme, getStoredThemePreference } from './lib/theme'

applyTheme(getStoredThemePreference())

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
