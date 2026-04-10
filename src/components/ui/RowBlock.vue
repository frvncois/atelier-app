<script setup lang="ts">
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  label: string
  tag?: string
  componentCount?: number
  selected?: boolean
  collapsed?: boolean
}>(), {
  tag: 'row',
  selected: false,
  collapsed: false,
})

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div
    class="border rounded-xl overflow-hidden transition-colors group"
    :class="selected ? 'border-lime-400/50' : 'border-white/[0.07] hover:border-white/[0.12]'"
  >
    <div
      class="flex items-center gap-2 px-3 py-2 bg-neutral-800 border-b border-white/[0.07] cursor-pointer"
      @click="emit('toggle')"
    >
      <span class="text-[10px] px-1.5 py-0.5 rounded font-mono bg-violet-400/10 text-violet-400">{{ tag }}</span>
      <span class="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{{ label }}</span>
      <span v-if="componentCount !== undefined" class="text-[10px] text-neutral-600">{{ componentCount }}</span>
      <div class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <slot name="actions" />
      </div>
      <ChevronDownIcon
        class="size-3.5 text-neutral-500 transition-transform ml-1"
        :class="collapsed ? '-rotate-180' : ''"
      />
    </div>
    <div v-show="!collapsed" class="p-2 flex flex-wrap gap-2">
      <slot />
    </div>
  </div>
</template>
