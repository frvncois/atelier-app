<script setup lang="ts">
import { computed, type FunctionalComponent } from 'vue'
import { Bars2Icon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  icon: FunctionalComponent
  label: string
  target: string
  targetVariant?: 'view' | 'component' | 'action'
}>(), {
  targetVariant: 'view',
})

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const targetColorMap: Record<string, string> = {
  view: 'text-sky-400',
  component: 'text-violet-400',
  action: 'text-red-400',
}

const targetColorClass = computed(() => targetColorMap[props.targetVariant])
</script>

<template>
  <div class="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-800 border border-white/[0.07] rounded-md group">
    <Bars2Icon class="size-4 text-neutral-600 cursor-grab shrink-0" />
    <div class="w-5 h-5 rounded bg-neutral-700 flex items-center justify-center shrink-0">
      <component :is="icon" class="size-3.5 text-neutral-400" />
    </div>
    <span class="flex-1 text-xs text-neutral-100">{{ label }}</span>
    <span class="text-[10px] font-mono" :class="targetColorClass">{{ target }}</span>
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click.stop="emit('edit')" class="p-0.5 text-neutral-500 hover:text-neutral-100 transition-colors">
        <PencilIcon class="size-3.5" />
      </button>
      <button @click.stop="emit('remove')" class="p-0.5 text-neutral-500 hover:text-red-400 transition-colors">
        <TrashIcon class="size-3.5" />
      </button>
    </div>
  </div>
</template>
