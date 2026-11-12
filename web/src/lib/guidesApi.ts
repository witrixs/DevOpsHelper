import { apiUrl } from '@/config'
import { AuthApiError } from '@/lib/authApi'

export type GuideListItem = {
  id: number
  slug: string
  title: string
  blurb: string
  description: string
  group_name: string
  read_time: string
  is_published: boolean
  author_id: number
  created_at: string
  updated_at: string
}

export type Guide = GuideListItem & {
  content: string
}

export type GuidePayload = {
  slug: string
  title: string
  blurb: string
  description: string
  content: string
  group_name: string
  read_time: string
  is_published: boolean
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* ignore */
  }
  if (response.status === 429) return 'Слишком много запросов. Подождите.'
  return 'Не удалось выполнить запрос'
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchMyGuides(token: string): Promise<GuideListItem[]> {
  const response = await fetch(apiUrl('/api/v1/guides/mine'), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
  return (await response.json()) as GuideListItem[]
}

export async function fetchGuideBySlug(slug: string): Promise<Guide> {
  const response = await fetch(apiUrl(`/api/v1/guides/${encodeURIComponent(slug)}`))
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
  return (await response.json()) as Guide
}

export async function fetchGuideById(token: string, id: number): Promise<Guide> {
  const response = await fetch(apiUrl(`/api/v1/guides/id/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
  return (await response.json()) as Guide
}

export async function createGuide(token: string, payload: GuidePayload): Promise<Guide> {
  const response = await fetch(apiUrl('/api/v1/guides'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
  return (await response.json()) as Guide
}

export async function updateGuide(
  token: string,
  id: number,
  payload: Partial<GuidePayload>,
): Promise<Guide> {
  const response = await fetch(apiUrl(`/api/v1/guides/${id}`), {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
  return (await response.json()) as Guide
}

export async function deleteGuide(token: string, id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/v1/guides/${id}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new AuthApiError(await readError(response), response.status)
}
