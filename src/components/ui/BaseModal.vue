<script setup lang="ts">
import { computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses: Record<string, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-lg',
  lg: 'w-full max-w-2xl',
}

const panelClasses = computed(() => [
  'bg-neutral-900 border border-white/[0.12] rounded-xl shadow-2xl flex flex-col',
  sizeClasses[props.size],
])

function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      @click="onOverlayClick"
    >
      <div :class="panelClasses">
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span class="text-sm font-medium text-neutral-100">{{ title }}</span>
          <XMarkIcon
            class="size-4 text-neutral-400 hover:text-neutral-100 cursor-pointer transition-colors"
            @click="emit('close')"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t border-white/[0.07] px-5 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
