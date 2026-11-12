import docker from './docker.md?raw'

const modules: Record<string, string> = {
  docker,
}

export function loadGuideMarkdown(slug: string): string | null {
  return modules[slug] ?? null
}
