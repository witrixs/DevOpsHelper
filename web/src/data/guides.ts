import guidesMeta from './guides-meta.json'

export type GuideMeta = {
  slug: string
  title: string
  blurb: string
  /** SEO / share caption for this guide. */
  description: string
  time: string
  group: string
  ready: boolean
}

export const guides: GuideMeta[] = guidesMeta

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((guide) => guide.slug === slug)
}

export const guideGroups = [...new Set(guides.map((guide) => guide.group))]
