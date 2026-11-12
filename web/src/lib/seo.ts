import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, APP_TITLE } from '@/config'
import type { GuideMeta } from '@/data/guides'

export const OG_IMAGE_PATH = '/og-images.png'
export const OG_IMAGE_WIDTH = '1672'
export const OG_IMAGE_HEIGHT = '941'

export type PageMeta = {
  title: string
  description: string
  imageAlt: string
  type: 'website' | 'article'
}

/** Home / default share card. */
export function homePageMeta(): PageMeta {
  return {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    imageAlt: APP_TITLE,
    type: 'website',
  }
}

/**
 * Guide share card: same OG image, title/description from the guide.
 * New guides only need fields in guides-meta.json — meta follows automatically.
 */
export function guidePageMeta(guide: GuideMeta): PageMeta {
  const description = guide.description?.trim() || `${guide.blurb}. ${APP_TAGLINE}.`
  return {
    title: `${guide.title} — инструкции для Linux | ${APP_NAME}`,
    description,
    imageAlt: `${guide.title} — ${APP_NAME}`,
    type: 'article',
  }
}

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Apply page meta for the current SPA route (tab title + OG/Twitter tags). */
export function applyPageMeta(meta: PageMeta): void {
  document.title = meta.title

  upsertMeta('name', 'description', meta.description)

  upsertMeta('property', 'og:type', meta.type)
  upsertMeta('property', 'og:site_name', APP_NAME)
  upsertMeta('property', 'og:title', meta.title)
  upsertMeta('property', 'og:description', meta.description)
  upsertMeta('property', 'og:image', OG_IMAGE_PATH)
  upsertMeta('property', 'og:image:type', 'image/png')
  upsertMeta('property', 'og:image:width', OG_IMAGE_WIDTH)
  upsertMeta('property', 'og:image:height', OG_IMAGE_HEIGHT)
  upsertMeta('property', 'og:image:alt', meta.imageAlt)

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', meta.title)
  upsertMeta('name', 'twitter:description', meta.description)
  upsertMeta('name', 'twitter:image', OG_IMAGE_PATH)
  upsertMeta('name', 'twitter:image:alt', meta.imageAlt)
}
