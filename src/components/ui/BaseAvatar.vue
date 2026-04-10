<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'blue' | 'purple' | 'amber' | 'green'
}>(), {
  size: 'md',
  color: 'blue',
})

const sizeClasses: Record<string, string> = {
  xs: 'w-4 h-4 text-[8px]',
  sm: 'w-5 h-5 text-[9px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-9 h-9 text-sm',
}

const colorClasses: Record<string, string> = {
  blue: 'bg-sky-400/20 text-sky-400',
  purple: 'bg-violet-400/10 text-violet-400',
  amber: 'bg-amber-400/10 text-amber-400',
  green: 'bg-emerald-400/10 text-emerald-400',
}

const baseClasses = 'rounded-full flex items-center justify-center shrink-0 font-medium overflow-hidden'

const wrapperClasses = computed(() => [
  baseClasses,
  sizeClasses[props.size],
  !props.src ? colorClasses[props.color] : '',
])

const imgClasses = computed(() => [
  'rounded-full object-cover',
  sizeClasses[props.size],
])

const initials = computed(() => {
  if (!props.name) return ''
  const words = props.name.trim().split(/\s+/)
  if (words.length === 1) return words[0]?.[0]?.toUpperCase() ?? ''
  return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase()
})
</script>

<template>
  <div :class="wrapperClasses">
    <img v-if="src" :src="src" :class="imgClasses" :alt="name" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
