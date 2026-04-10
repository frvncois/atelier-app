<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  label?: string
  rows?: number
  mono?: boolean
}>(), {
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaClasses = computed(() => [
  'w-full bg-neutral-800 border border-white/[0.07] rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/[0.2] transition-colors resize-none',
  props.mono ? 'font-mono text-xs' : '',
])
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">
      {{ label }}
    </label>

    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :class="textareaClasses"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>
