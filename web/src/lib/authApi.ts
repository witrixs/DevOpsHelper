import { apiUrl } from '@/config'

export type AuthUser = {
  id: number
  email: string
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export type AuthToken = {
  access_token: string
  token_type: string
}

export class AuthApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg: unknown }).msg)
          }
          return String(item)
        })
        .join('. ')
    }
  } catch {
    /* ignore */
  }
  if (response.status === 429) return 'Слишком много попыток. Подождите минуту.'
  return 'Не удалось выполнить запрос'
}

export async function registerUser(payload: {
  username: string
  email: string
  password: string
}): Promise<AuthUser> {
  const response = await fetch(apiUrl('/api/v1/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }

  return (await response.json()) as AuthUser
}

/** Login with either username or email in `identifier`. */
export async function loginUser(payload: {
  identifier: string
  password: string
}): Promise<AuthToken> {
  const body = new URLSearchParams()
  body.set('username', payload.identifier)
  body.set('password', payload.password)

  const response = await fetch(apiUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }

  return (await response.json()) as AuthToken
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(apiUrl('/api/v1/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new AuthApiError(await readError(response), response.status)
  }

  return (await response.json()) as AuthUser
}
