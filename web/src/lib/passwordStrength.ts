export type PasswordCheckId = 'length' | 'lower' | 'upper' | 'number' | 'symbol'

export type PasswordCheck = {
  id: PasswordCheckId
  label: string
  ok: boolean
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  checks: PasswordCheck[]
}

export function evaluatePassword(password: string): PasswordStrength {
  const checks: PasswordCheck[] = [
    { id: 'length', label: 'Минимум 8 символов', ok: password.length >= 8 },
    { id: 'lower', label: 'Строчная буква', ok: /[a-zа-яё]/.test(password) },
    { id: 'upper', label: 'Заглавная буква', ok: /[A-ZА-ЯЁ]/.test(password) },
    { id: 'number', label: 'Цифра', ok: /\d/.test(password) },
    { id: 'symbol', label: 'Спецсимвол', ok: /[^A-Za-zА-Яа-яЁё0-9]/.test(password) },
  ]

  const passed = checks.filter((check) => check.ok).length
  const score = Math.min(4, passed) as PasswordStrength['score']

  const labels = ['Очень слабый', 'Слабый', 'Нормальный', 'Хороший', 'Отличный'] as const

  return {
    score: password ? score : 0,
    label: password ? labels[score] : 'Введите пароль',
    checks,
  }
}
