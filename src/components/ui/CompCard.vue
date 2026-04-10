<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from './BaseBadge.vue'

const props = withDefaults(defineProps<{
  type: string
  name: string
  preview?: string
  dataTags?: string[]
  actionCount?: number
  selected?: boolean
}>(), {
  selected: false,
})

const emit = defineEmits<{
  click: []
}>()

const typeVariantMap: Record<string, 'accent' | 'blue' | 'purple' | 'amber' | 'default'> = {
  UiStats: 'accent',
  UiCard: 'blue',
  UiTable: 'purple',
  UiForm: 'amber',
}

const typeVariant = computed(() =>
  typeVariantMap[props.type] ?? 'default'
)

const containerClasses = computed(() => [
  'flex-1 min-w-[140px] bg-neutral-800 border rounded-md p-2.5 cursor-pointer transition-all flex flex-col gap-1.5',
  props.selected
    ? 'border-lime-400/50 bg-lime-400/[0.05]'
    : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-neutral-700',
])
</script>

<template>
  <div :class="containerClasses" @click="emit('click')">
    <BaseBadge :label="type" :variant="typeVariant" size="sm" />
    <span class="text-xs font-medium text-neutral-200">{{ name }}</span>
    <span v-if="preview" class="text-[10px] text-neutral-600 leading-relaxed">{{ preview }}</span>
    <div v-if="dataTags?.length" class="flex flex-wrap gap-1">
      <BaseBadge v-for="tag in dataTags" :key="tag" :label="tag" variant="default" size="sm" />
    </div>
    <BaseBadge
      v-if="actionCount && actionCount > 0"
      :label="`${actionCount} action${actionCount > 1 ? 's' : ''}`"
      variant="purple"
      size="sm"
    />
  </div>
</template>
