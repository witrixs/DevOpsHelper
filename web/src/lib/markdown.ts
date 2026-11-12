import { marked, type Tokens } from 'marked'
import { highlightShell, isShellLanguage } from './shellHighlight'

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base || 'section'
  let n = 2
  while (used.has(id)) {
    id = `${base}-${n}`
    n += 1
  }
  used.add(id)
  return id
}

export function renderGuideMarkdown(source: string): { html: string; toc: TocItem[]; title: string } {
  const usedIds = new Set<string>()
  const toc: TocItem[] = []
  let title = ''

  const renderer = new marked.Renderer()

  renderer.heading = ({ text, depth }: Tokens.Heading) => {
    const plain = text.replace(/<[^>]+>/g, '')
    const id = uniqueId(slugify(plain), usedIds)

    if (depth === 1 && !title) {
      title = plain
      return `<h1 id="${id}">${text}</h1>\n`
    }

    if (depth === 2 || depth === 3) {
      toc.push({ id, text: plain, level: depth })
    }

    return `<h${depth} id="${id}">${text}</h${depth}>\n`
  }

  renderer.code = ({ text, lang }: Tokens.Code) => {
    const language = (lang ?? '').trim()
    const className = language ? ` class="language-${escapeHtml(language)}"` : ''
    const singleLine = !text.includes('\n')
    const body = isShellLanguage(language) ? highlightShell(text) : escapeHtml(text)
    return [
      `<div class="code-block${singleLine ? ' code-block--single' : ''}">`,
      `<pre><code${className}>${body}</code></pre>`,
      `<button type="button" class="code-block__copy" aria-label="Копировать" title="Копировать">`,
      `<svg class="code-block__icon code-block__icon--copy" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`,
      `<rect x="9" y="9" width="13" height="13" rx="2"></rect>`,
      `<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>`,
      `</svg>`,
      `<svg class="code-block__icon code-block__icon--check" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`,
      `<path d="M20 6 9 17l-5-5"></path>`,
      `</svg>`,
      `</button>`,
      `</div>\n`,
    ].join('')
  }

  const html = marked.parse(source, {
    renderer,
    gfm: true,
    breaks: false,
  }) as string

  return { html, toc, title }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
