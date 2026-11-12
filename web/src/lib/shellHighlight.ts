const KEYWORDS = new Set([
  'sudo',
  'do',
  'done',
  'if',
  'then',
  'else',
  'elif',
  'fi',
  'for',
  'while',
  'until',
  'in',
  'case',
  'esac',
  'function',
  'return',
  'exit',
  'export',
  'local',
  'readonly',
  'declare',
  'typeset',
  'select',
  'time',
  'coproc',
])

const SHELL_BINARIES = new Set(['bash', 'sh', 'zsh', 'fish', 'dash'])

const COMMANDS = new Set([
  'apt',
  'apt-get',
  'yum',
  'dnf',
  'pacman',
  'zypper',
  'apk',
  'curl',
  'wget',
  'docker',
  'docker-compose',
  'systemctl',
  'service',
  'chmod',
  'chown',
  'mkdir',
  'rm',
  'cp',
  'mv',
  'cat',
  'echo',
  'printf',
  'grep',
  'sed',
  'awk',
  'tee',
  'install',
  'usermod',
  'useradd',
  'groupadd',
  'nginx',
  'certbot',
  'git',
  'npm',
  'pnpm',
  'yarn',
  'node',
  'python',
  'python3',
  'pip',
  'pip3',
  'ssh',
  'scp',
  'rsync',
  'tar',
  'unzip',
  'journalctl',
  'ufw',
  'firewall-cmd',
  'crontab',
  'env',
  'which',
  'command',
  'type',
  'cd',
  'ls',
  'pwd',
  'source',
  'true',
  'false',
  'test',
  'read',
  'wait',
  'kill',
  'ps',
  'top',
  'htop',
  'df',
  'du',
  'free',
  'uname',
  'hostnamectl',
  'ip',
  'ss',
  'netstat',
  'ping',
  'openssl',
  'gpg',
  'dpkg',
  'snap',
  'flatpak',
  'helm',
  'kubectl',
  'k3s',
])

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function span(kind: string, value: string): string {
  return `<span class="tok-${kind}">${escapeHtml(value)}</span>`
}

function highlightString(raw: string, quote: '"' | "'"): string {
  const inner = raw.slice(1, -1)
  let out = span('string', quote)
  let i = 0

  while (i < inner.length) {
    if (quote === '"' && inner[i] === '$' && inner[i + 1] === '(') {
      let depth = 1
      let j = i + 2
      while (j < inner.length && depth > 0) {
        if (inner[j] === '(') depth += 1
        else if (inner[j] === ')') depth -= 1
        j += 1
      }
      const chunk = inner.slice(i, j)
      out += span('punct', '$(')
      out += highlightShellLine(chunk.slice(2, -1))
      out += span('punct', ')')
      i = j
      continue
    }

    if (quote === '"' && inner[i] === '$' && /[A-Za-z_]/.test(inner[i + 1] ?? '')) {
      let j = i + 1
      while (j < inner.length && /[A-Za-z0-9_]/.test(inner[j]!)) j += 1
      out += span('variable', inner.slice(i, j))
      i = j
      continue
    }

    const url = inner.slice(i).match(/^https?:\/\/[^\s'"\\]+/)
    if (url) {
      out += span('url', url[0])
      i += url[0].length
      continue
    }

    let j = i + 1
    while (
      j < inner.length &&
      !(quote === '"' && inner[j] === '$') &&
      !inner.slice(j).startsWith('http://') &&
      !inner.slice(j).startsWith('https://')
    ) {
      j += 1
    }
    out += span('string', inner.slice(i, j))
    i = j
  }

  out += span('string', quote)
  return out
}

function highlightShellLine(line: string): string {
  const trimmedStart = line.match(/^\s*/)?.[0] ?? ''
  const rest = line.slice(trimmedStart.length)

  if (rest.startsWith('#')) {
    return escapeHtml(trimmedStart) + span('comment', rest)
  }

  let out = escapeHtml(trimmedStart)
  let i = 0
  let expectCommand = true

  while (i < rest.length) {
    const ch = rest[i]!

    if (/\s/.test(ch)) {
      let j = i + 1
      while (j < rest.length && /\s/.test(rest[j]!)) j += 1
      out += escapeHtml(rest.slice(i, j))
      i = j
      continue
    }

    if (ch === '\\' && i + 1 < rest.length) {
      out += span('punct', rest.slice(i, i + 2))
      i += 2
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      while (j < rest.length) {
        if (rest[j] === '\\') {
          j += 2
          continue
        }
        if (rest[j] === quote) {
          j += 1
          break
        }
        j += 1
      }
      out += highlightString(rest.slice(i, j), quote)
      i = j
      expectCommand = false
      continue
    }

    if (ch === '$' && rest[i + 1] === '(') {
      let depth = 1
      let j = i + 2
      while (j < rest.length && depth > 0) {
        if (rest[j] === '(') depth += 1
        else if (rest[j] === ')') depth -= 1
        j += 1
      }
      out += span('punct', '$(')
      out += highlightShellLine(rest.slice(i + 2, j - 1))
      out += span('punct', ')')
      i = j
      expectCommand = false
      continue
    }

    if (ch === '$' && /[A-Za-z_{]/.test(rest[i + 1] ?? '')) {
      let j = i + 1
      if (rest[j] === '{') {
        j += 1
        while (j < rest.length && rest[j] !== '}') j += 1
        if (rest[j] === '}') j += 1
      } else {
        while (j < rest.length && /[A-Za-z0-9_]/.test(rest[j]!)) j += 1
      }
      out += span('variable', rest.slice(i, j))
      i = j
      expectCommand = false
      continue
    }

    const url = rest.slice(i).match(/^https?:\/\/[^\s;&|<>'"]+/)
    if (url) {
      out += span('url', url[0])
      i += url[0].length
      expectCommand = false
      continue
    }

    if (ch === '-' && /[A-Za-z0-9]/.test(rest[i + 1] ?? '')) {
      let j = i + 1
      while (j < rest.length && /[A-Za-z0-9_=-]/.test(rest[j]!)) j += 1
      out += span('flag', rest.slice(i, j))
      i = j
      expectCommand = false
      continue
    }

    if ('|&;()<>'.includes(ch)) {
      out += span(ch === '|' ? 'operator' : 'punct', ch)
      i += 1
      if (ch === '|' || ch === ';' || ch === '&' || ch === '(') expectCommand = true
      continue
    }

    let j = i + 1
    while (j < rest.length && !/[\s"'`$|&;()<>]/.test(rest[j]!)) j += 1
    const word = rest.slice(i, j)

    if (KEYWORDS.has(word)) {
      out += span('keyword', word)
      expectCommand = word === 'sudo' || word === 'time' || word === 'command' || word === 'env'
    } else if (expectCommand) {
      if (SHELL_BINARIES.has(word)) {
        out += span('plain', word)
      } else {
        out += span(COMMANDS.has(word) ? 'command' : 'plain', word)
      }
      expectCommand = false
    } else {
      out += span('plain', word)
      expectCommand = false
    }

    i = j
  }

  return out
}

export function highlightShell(source: string): string {
  const endedWithNewline = source.endsWith('\n')
  const lines = source.replace(/\n$/, '').split('\n')
  const html = lines.map(highlightShellLine).join('\n')
  return endedWithNewline ? `${html}\n` : html
}

export function isShellLanguage(lang: string): boolean {
  const normalized = lang.trim().toLowerCase()
  return (
    normalized === '' ||
    normalized === 'bash' ||
    normalized === 'sh' ||
    normalized === 'shell' ||
    normalized === 'zsh' ||
    normalized === 'console' ||
    normalized === 'terminal'
  )
}
