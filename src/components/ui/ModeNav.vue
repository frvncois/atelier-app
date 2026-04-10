<script setup lang="ts">
withDefaults(defineProps<{
  items: Array<{ id: string; label: string }>
  modelValue: string
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="item in items"
      :key="item.id"
      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer"
      :class="item.id === modelValue
        ? 'bg-neutral-800 text-neutral-100'
        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'"
      @click="emit('update:modelValue', item.id)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
