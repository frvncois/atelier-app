<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  icon: FunctionalComponent
  name: string
  description?: string
  active?: boolean
}>(), {
  active: false,
})

const emit = defineEmits<{
  click: []
}>()

const containerClasses = computed(() => ({
  'border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100': !props.active,
  'bg-neutral-800 text-neutral-100 border-white/[0.07]': props.active,
}))

const iconContainerClasses = computed(() => ({
  'border-white/[0.12] bg-neutral-800': !props.active,
  'border-lime-400/40 bg-lime-400/10': props.active,
}))
</script>

<template>
  <div
    class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all border"
    :class="containerClasses"
    @click="emit('click')"
  >
    <div
      class="w-7 h-7 rounded-md border flex items-center justify-center shrink-0"
      :class="iconContainerClasses"
    >
      <component :is="icon" class="size-4" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-xs font-medium">{{ name }}</span>
      <span v-if="description" class="text-[10px] text-neutral-600 mt-0.5">{{ description }}</span>
    </div>
  </div>
</template>
