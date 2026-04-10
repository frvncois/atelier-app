<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  color?: string
  active?: boolean
}>(), {
  color: 'bg-sky-400',
  active: false,
})

const emit = defineEmits<{
  click: []
}>()

const containerClasses = computed(() => [
  'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-all',
  props.active
    ? 'bg-neutral-800 text-neutral-100 font-medium'
    : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
])
</script>

<template>
  <div :class="containerClasses" @click="emit('click')">
    <div class="w-2 h-2 rounded-full shrink-0" :class="color"></div>
    <span>{{ name }}</span>
  </div>
</template>
