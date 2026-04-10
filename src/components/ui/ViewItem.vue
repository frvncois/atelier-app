<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  componentCount?: number
  active?: boolean
}>(), {
  active: false,
})

const emit = defineEmits<{
  click: []
}>()

const containerClasses = computed(() => [
  'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer border transition-all',
  props.active
    ? 'bg-neutral-800 text-neutral-100 border-white/[0.07]'
    : 'border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200',
])

const thumbnailClasses = computed(() => [
  'w-7 h-[22px] rounded border flex flex-col justify-center gap-[3px] px-1 shrink-0',
  props.active
    ? 'border-lime-400/40 bg-neutral-800'
    : 'border-white/[0.12] bg-neutral-800',
])

const lineClasses = computed(() =>
  props.active ? 'bg-lime-600' : 'bg-neutral-700'
)
</script>

<template>
  <div :class="containerClasses" @click="emit('click')">
    <div :class="thumbnailClasses">
      <div class="h-[2px] rounded-full" :class="lineClasses"></div>
      <div class="h-[2px] rounded-full w-3/4" :class="lineClasses"></div>
      <div class="h-[2px] rounded-full w-1/2" :class="lineClasses"></div>
    </div>
    <span class="text-xs font-medium flex-1">{{ name }}</span>
    <span v-if="componentCount !== undefined" class="text-[10px] text-neutral-600 bg-neutral-800 px-1.5 rounded">{{ componentCount }}</span>
  </div>
</template>
