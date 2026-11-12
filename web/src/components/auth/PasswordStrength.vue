<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from '@lucide/vue'
import { evaluatePassword } from '@/lib/passwordStrength'

const props = defineProps<{
  password: string
}>()

const strength = computed(() => evaluatePassword(props.password))
</script>

<template>
  <div class="strength" :data-score="strength.score" aria-live="polite">
    <div class="strength__head">
      <span class="strength__label">Сложность пароля</span>
      <span class="strength__value">{{ strength.label }}</span>
    </div>

    <div class="strength__bars" role="meter" :aria-valuenow="strength.score" aria-valuemin="0" aria-valuemax="4">
      <span
        v-for="index in 4"
        :key="index"
        class="strength__bar"
        :class="{ 'is-on': strength.score >= index }"
      />
    </div>

    <ul class="strength__checks">
      <li
        v-for="check in strength.checks"
        :key="check.id"
        class="strength__check"
        :class="{ 'is-ok': check.ok }"
      >
        <span class="strength__icon" aria-hidden="true">
          <Check v-if="check.ok" :size="14" :stroke-width="2.4" />
          <X v-else :size="14" :stroke-width="2.4" />
        </span>
        <span>{{ check.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.strength {
  display: grid;
  gap: 0.45rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--dh-radius);
  border: 1px solid var(--dh-border);
  background: color-mix(in oklab, var(--dh-elevated) 88%, transparent);
}

.strength__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.strength__label {
  font-size: 0.78rem;
  color: var(--dh-faint);
  letter-spacing: 0.02em;
}

.strength__value {
  font-family: var(--dh-font-display);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--dh-muted);
  transition: color 0.2s ease;
}

.strength[data-score='1'] .strength__value {
  color: #f87171;
}
.strength[data-score='2'] .strength__value {
  color: #fb923c;
}
.strength[data-score='3'] .strength__value {
  color: #fbbf24;
}
.strength[data-score='4'] .strength__value {
  color: #34d399;
}

.strength__bars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.strength__bar {
  height: 0.28rem;
  border-radius: 999px;
  background: var(--dh-border-strong);
  transition: background 0.25s ease;
}

.strength[data-score='1'] .strength__bar.is-on {
  background: #f87171;
}
.strength[data-score='2'] .strength__bar.is-on {
  background: #fb923c;
}
.strength[data-score='3'] .strength__bar.is-on {
  background: #fbbf24;
}
.strength[data-score='4'] .strength__bar.is-on {
  background: #34d399;
}

.strength__checks {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.28rem 0.55rem;
  margin: 0;
  padding: 0;
}

.strength__check {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--dh-faint);
  transition: color 0.2s ease;
}

.strength__check:last-child {
  grid-column: 1 / -1;
}

.strength__check.is-ok {
  color: var(--dh-ink);
}

.strength__icon {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--dh-hover-bg);
  color: var(--dh-faint);
}

.strength__check.is-ok .strength__icon {
  background: color-mix(in oklab, #34d399 18%, transparent);
  color: #34d399;
}
</style>
