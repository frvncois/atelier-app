<script setup lang="ts">
import { computed, type FunctionalComponent } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  iconBefore?: FunctionalComponent
  iconAfter?: FunctionalComponent
  disabled?: boolean
  mono?: boolean
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const wrapperClasses = computed(() => [
  'relative flex items-center',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
])

const inputClasses = computed(() => [
  'w-full bg-neutral-800 border rounded-md px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/[0.2] transition-colors',
  props.error ? 'border-red-400/40' : 'border-white/[0.07]',
  props.iconBefore ? 'pl-8' : '',
  props.iconAfter ? 'pr-8' : '',
  props.mono ? 'font-mono text-xs' : '',
  props.disabled ? 'cursor-not-allowed' : '',
])
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">
      {{ label }}
    </label>

    <div :class="wrapperClasses">
      <component
        :is="iconBefore"
        v-if="iconBefore"
        class="absolute left-2.5 size-4 text-neutral-500 pointer-events-none"
      />

      <input
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <component
        :is="iconAfter"
        v-if="iconAfter"
        class="absolute right-2.5 size-4 text-neutral-500 pointer-events-none"
      />
    </div>

    <p v-if="error" class="text-xs text-red-400 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-neutral-600 mt-1">{{ hint }}</p>
  </div>
</template>
