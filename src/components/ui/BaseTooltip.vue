<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>(), {
  position: 'top',
})

const positionClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

const tooltipClasses = computed(() => [
  'absolute z-50 px-2 py-1 text-xs text-neutral-100 bg-neutral-800 border border-white/[0.07] rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
  positionClasses[props.position],
])
</script>

<template>
  <div class="relative inline-flex group">
    <slot />
    <span :class="tooltipClasses">{{ content }}</span>
  </div>
</template>
