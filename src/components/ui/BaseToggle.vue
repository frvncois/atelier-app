<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const trackClasses = computed(() => [
  'rounded-full transition-colors flex-shrink-0',
  props.modelValue ? 'bg-lime-400' : 'bg-neutral-700',
  props.size === 'sm' ? 'w-8 h-4' : 'w-10 h-5',
])

const thumbClasses = computed(() => [
  'bg-white rounded-full transition-transform absolute top-1/2 -translate-y-1/2',
  props.size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
  props.size === 'sm'
    ? (props.modelValue ? 'translate-x-4' : 'translate-x-0.5')
    : (props.modelValue ? 'translate-x-5' : 'translate-x-0.5'),
])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="flex items-center gap-2.5">
    <button
      role="switch"
      :aria-checked="modelValue"
      :class="['relative', props.size === 'sm' ? 'w-8 h-4' : 'w-10 h-5', 'cursor-pointer']"
      @click="toggle"
    >
      <div :class="trackClasses" class="w-full h-full" />
      <span :class="thumbClasses" />
    </button>

    <span v-if="label" class="text-sm text-neutral-300">{{ label }}</span>
  </div>
</template>
