<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <div v-if="orientation === 'vertical'" class="w-px bg-white/[0.07] self-stretch" />
  <div v-else-if="label" class="flex items-center">
    <div class="flex-1 h-px bg-white/[0.07]" />
    <span class="text-xs text-neutral-600 px-3 shrink-0">{{ label }}</span>
    <div class="flex-1 h-px bg-white/[0.07]" />
  </div>
  <hr v-else class="border-white/[0.07]" />
</template>
