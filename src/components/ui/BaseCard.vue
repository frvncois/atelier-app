<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  selected?: boolean
}>(), {
  padding: 'md',
  hoverable: false,
  selected: false,
})

const paddingClasses: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const classes = computed(() => [
  'bg-neutral-900 rounded-xl border',
  props.selected ? 'border-lime-400/60' : 'border-white/[0.07]',
  paddingClasses[props.padding],
  props.hoverable ? 'cursor-pointer hover:border-white/[0.12] transition-colors' : '',
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
