<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  hint?: string
}>(), {})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex justify-between items-baseline mb-1.5">
      <span class="text-xs text-neutral-400">{{ label }}</span>
      <span v-if="hint" class="text-[10px] text-neutral-600">{{ hint }}</span>
    </div>
    <slot />
  </div>
</template>
