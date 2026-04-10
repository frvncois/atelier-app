<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type FunctionalComponent } from 'vue'

const props = withDefaults(defineProps<{
  items: Array<{
    label: string
    icon?: FunctionalComponent
    action: () => void
    destructive?: boolean
    divider?: boolean
  }>
  align?: 'left' | 'right'
}>(), {
  align: 'right',
})

const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function handleItem(action: () => void) {
  action()
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

const panelClasses = computed(() => [
  'absolute z-50 mt-1 bg-neutral-900 border border-white/[0.12] rounded-lg shadow-xl py-1 min-w-[160px]',
  props.align === 'right' ? 'right-0' : 'left-0',
])
</script>

<template>
  <div ref="wrapperRef" class="relative inline-block">
    <div @click.stop="toggle">
      <slot />
    </div>
    <div v-if="open" :class="panelClasses">
      <template v-for="item in items" :key="item.label">
        <div v-if="item.divider" class="h-px bg-white/[0.07] my-1" />
        <div
          :class="[
            'flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer rounded-md mx-1 transition-colors',
            item.destructive
              ? 'text-red-400 hover:bg-red-400/10'
              : 'text-neutral-300 hover:bg-neutral-800',
          ]"
          @click="handleItem(item.action)"
        >
          <component :is="item.icon" v-if="item.icon" class="size-4 shrink-0" />
          {{ item.label }}
        </div>
      </template>
    </div>
  </div>
</template>
