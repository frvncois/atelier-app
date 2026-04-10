<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: string
}>(), {
  width: 'w-56',
})

defineSlots<{
  header?(): unknown
  default?(): unknown
  footer?(): unknown
}>()
</script>

<template>
  <div
    class="flex flex-col border-r border-white/[0.07] bg-neutral-950 shrink-0 h-full overflow-hidden"
    :class="props.width"
  >
    <div v-if="$slots.header" class="border-b border-white/[0.07] shrink-0">
      <slot name="header" />
    </div>

    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-white/[0.07] shrink-0 mt-auto">
      <slot name="footer" />
    </div>
  </div>
</template>
