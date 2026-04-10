<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  pattern: 'top-only' | 'sidebar-only' | 'top-sidebar' | 'none'
  selected?: boolean
}>(), {
  selected: false,
})

const emit = defineEmits<{
  click: []
}>()

const containerClasses = computed(() => [
  'flex flex-col items-center gap-1.5 p-2 rounded-md border cursor-pointer transition-all',
  props.selected
    ? 'border-lime-400/50 bg-lime-400/10'
    : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-neutral-800',
])
</script>

<template>
  <div :class="containerClasses" @click="emit('click')">
    <div class="w-14 h-10 rounded border border-white/[0.12] bg-neutral-800 relative overflow-hidden">
      <template v-if="pattern === 'top-only'">
        <div class="absolute top-0 inset-x-0 h-2 bg-neutral-600 border-b border-white/[0.12]"></div>
      </template>
      <template v-else-if="pattern === 'sidebar-only'">
        <div class="absolute left-0 inset-y-0 w-3 bg-neutral-600 border-r border-white/[0.12]"></div>
      </template>
      <template v-else-if="pattern === 'top-sidebar'">
        <div class="absolute top-0 inset-x-0 h-2 bg-neutral-600 border-b border-white/[0.12]"></div>
        <div class="absolute left-0 inset-y-0 w-3 bg-neutral-600 border-r border-white/[0.12]"></div>
      </template>
      <template v-else>
        <div class="absolute inset-2 rounded bg-neutral-700"></div>
      </template>
    </div>
    <span class="text-[10px]" :class="selected ? 'text-lime-600 font-medium' : 'text-neutral-400'">{{ label }}</span>
  </div>
</template>
