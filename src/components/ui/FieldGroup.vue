<script setup lang="ts">
withDefaults(defineProps<{
  label: string
}>(), {})
</script>

<template>
  <div>
    <div class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest pb-2 border-b border-white/[0.07] mb-3">
      {{ label }}
    </div>
    <div class="flex flex-col gap-3">
      <slot />
    </div>
  </div>
</template>
