<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  modelValue: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  label?: string
  disabled?: boolean
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const wrapperClasses = computed(() => [
  'relative flex items-center',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
])
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="text-xs font-medium text-neutral-400 uppercase tracking-wide block mb-1.5">
      {{ label }}
    </label>

    <div :class="wrapperClasses">
      <select
        :value="modelValue"
        :disabled="disabled"
        class="w-full bg-neutral-800 border border-white/[0.07] rounded-md pl-3 pr-8 py-1.5 text-sm text-neutral-100 outline-none focus:border-white/[0.2] transition-colors appearance-none cursor-pointer"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled :selected="modelValue === ''">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <ChevronDownIcon class="absolute right-2.5 size-4 text-neutral-500 pointer-events-none" />
    </div>
  </div>
</template>
