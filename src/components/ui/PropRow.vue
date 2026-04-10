<script setup lang="ts">
withDefaults(defineProps<{
  label: string
}>(), {})
</script>

<template>
  <div class="flex items-center justify-between gap-2 py-1">
    <span class="text-xs text-neutral-400 shrink-0 w-16">{{ label }}</span>
    <div class="flex-1 flex justify-end">
      <slot />
    </div>
  </div>
</template>
