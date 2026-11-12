export const APP_NAME = import.meta.env.VITE_APP_NAME || 'DevOpsHelper'
export const APP_TAGLINE = 'Инструкции для Linux'
export const APP_TITLE = `${APP_NAME} — инструкции для Linux`
export const APP_DESCRIPTION =
  'Чистые Markdown-гайды по Linux: установка приложений, настройка сервисов и команды, которые можно сразу копировать.'

/** Base URL for API. Empty string = same origin (prod via FastAPI). */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${normalized}`
}
