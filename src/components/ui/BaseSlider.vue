<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
}>(), {
  min: 0,
  max: 100,
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed(() => `${props.modelValue}${props.unit ?? ''}`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span v-if="label" class="text-xs text-neutral-400">{{ label }}</span>

    <div class="flex items-center gap-3">
      <input
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="flex-1 accent-lime-400 cursor-pointer"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />

      <span class="font-mono text-xs text-neutral-400 w-12 text-right">{{ displayValue }}</span>
    </div>
  </div>
</template>
