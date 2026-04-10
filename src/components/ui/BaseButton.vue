<script setup lang="ts">
import { computed, type FunctionalComponent } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  label?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  iconBefore?: FunctionalComponent
  iconAfter?: FunctionalComponent
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<string, string> = {
  default: 'bg-neutral-100 text-neutral-950 hover:bg-white',
  secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
  outline: 'border border-white/[0.12] text-neutral-300 hover:bg-neutral-800',
  ghost: 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
  danger: 'bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20',
}

const sizeClasses: Record<string, string> = {
  xs: 'text-xs px-2 py-1 gap-1.5 rounded',
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2 gap-2 rounded-md',
  lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg',
}

const iconSizeClasses: Record<string, string> = {
  xs: 'size-3',
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium cursor-pointer transition-colors',
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
  props.loading ? 'pointer-events-none opacity-70' : '',
])

const iconClass = computed(() => iconSizeClasses[props.size])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button :class="buttonClasses" @click="handleClick">
    <ArrowPathIcon v-if="loading" :class="[iconClass, 'animate-spin']" />
    <component :is="iconBefore" v-else-if="iconBefore" :class="iconClass" />
    {{ label }}
    <component :is="iconAfter" v-if="iconAfter && !loading" :class="iconClass" />
  </button>
</template>
