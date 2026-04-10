<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

withDefaults(defineProps<{
  items: Array<{ label: string; id?: string }>
}>(), {})

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <template v-for="(item, index) in items" :key="index">
      <ChevronRightIcon v-if="index > 0" class="size-3 text-neutral-600 shrink-0" />
      <button
        v-if="index < items.length - 1"
        class="text-neutral-500 hover:text-neutral-300 text-xs transition-colors"
        @click="item.id && emit('select', item.id)"
      >
        {{ item.label }}
      </button>
      <span v-else class="text-xs text-neutral-200 font-medium">
        {{ item.label }}
      </span>
    </template>
  </div>
</template>
