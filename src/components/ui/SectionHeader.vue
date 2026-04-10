<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  breadcrumb?: string
}>(), {})

defineSlots<{
  actions?(): unknown
}>()
</script>

<template>
  <header class="h-11 flex items-center px-5 border-b border-white/[0.07] gap-2 shrink-0">
    <template v-if="breadcrumb">
      <span class="text-xs text-neutral-600">{{ breadcrumb }}</span>
      <span class="text-xs text-neutral-600">›</span>
    </template>
    <span class="text-sm font-medium text-neutral-100 tracking-tight">{{ title }}</span>
    <div class="ml-auto flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
