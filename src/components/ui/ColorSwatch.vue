<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  color: string
  selected?: boolean
  size?: 'sm' | 'md'
}>(), {
  selected: false,
  size: 'md',
})

const emit = defineEmits<{
  click: []
}>()

const sizeClasses: Record<string, string> = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
}

const classes = computed(() => [
  'rounded-md border border-white/[0.12] transition-all cursor-pointer',
  sizeClasses[props.size],
  props.selected ? 'ring-2 ring-white ring-offset-1 ring-offset-neutral-900' : '',
])
</script>

<template>
  <button
    :class="classes"
    :style="{ backgroundColor: color }"
    @click="emit('click')"
  />
</template>
