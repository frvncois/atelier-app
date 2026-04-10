<script setup lang="ts">
withDefaults(defineProps<{
  type?: string
  title?: string
}>(), {})

defineSlots<{
  tabs?(): unknown
  default?(): unknown
}>()
</script>

<template>
  <div class="flex flex-col border-l border-white/[0.07] bg-neutral-950 shrink-0 h-full overflow-hidden w-72">
    <div v-if="type || title" class="px-4 pt-4 pb-3 border-b border-white/[0.07] shrink-0">
      <div v-if="type" class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider font-mono">
        {{ type }}
      </div>
      <div v-if="title" class="text-sm font-medium text-neutral-100 mt-0.5">
        {{ title }}
      </div>
    </div>

    <div v-if="$slots.tabs" class="border-b border-white/[0.07] shrink-0">
      <slot name="tabs" />
    </div>

    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>
  </div>
</template>
