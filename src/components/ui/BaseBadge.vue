<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  variant?: 'default' | 'accent' | 'blue' | 'purple' | 'amber' | 'red' | 'green'
  size?: 'sm' | 'md'
  dot?: boolean
  mono?: boolean
}>(), {
  variant: 'default',
  size: 'sm',
  dot: false,
  mono: false,
})

const variantClasses: Record<string, string> = {
  default: 'bg-neutral-800 text-neutral-400',
  accent: 'bg-lime-400/10 text-lime-600',
  blue: 'bg-sky-400/[0.12] text-sky-400',
  purple: 'bg-violet-400/10 text-violet-400',
  amber: 'bg-amber-400/10 text-amber-400',
  red: 'bg-red-400/10 text-red-400',
  green: 'bg-emerald-400/10 text-emerald-400',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded',
  md: 'text-xs px-2 py-1 rounded-md',
}

const classes = computed(() => [
  'inline-flex items-center gap-1 font-medium',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.mono ? 'font-mono' : '',
])

const dotClasses = computed(() => [
  'w-1.5 h-1.5 rounded-full shrink-0 bg-current',
])
</script>

<template>
  <span :class="classes">
    <span v-if="dot" :class="dotClasses" />
    {{ label }}
  </span>
</template>
