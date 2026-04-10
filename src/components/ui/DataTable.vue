<script setup lang="ts">
import BaseBadge from './BaseBadge.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

defineProps<{
  fields: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
    description?: string
    usedIn?: string[]
  }>
}>()

const emit = defineEmits<{
  addField: []
}>()

type BadgeVariant = 'default' | 'accent' | 'blue' | 'purple' | 'amber' | 'red' | 'green'

const typeVariantMap: Record<string, BadgeVariant> = {
  string: 'blue',
  number: 'purple',
  boolean: 'amber',
  date: 'accent',
  array: 'red',
  object: 'default',
}

function typeVariant(type: string): BadgeVariant {
  return typeVariantMap[type] ?? 'default'
}
</script>

<template>
  <div class="w-full overflow-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Field</th>
          <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Type</th>
          <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Description</th>
          <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Used in</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="field in fields" :key="field.name" class="hover:bg-neutral-900 transition-colors">
          <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
            <span class="font-mono text-xs text-lime-600">{{ field.name }}</span>
          </td>
          <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
            <BaseBadge :label="field.type" :variant="typeVariant(field.type)" size="sm" :mono="true" />
          </td>
          <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
            <span class="text-xs text-neutral-500">{{ field.description }}</span>
          </td>
          <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
            <div v-if="field.usedIn?.length" class="flex flex-wrap gap-1">
              <BaseBadge v-for="u in field.usedIn" :key="u" :label="u" size="sm" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="px-4 py-2 border-t border-white/[0.07]">
      <button
        @click="emit('addField')"
        class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <PlusIcon class="size-3.5" />
        Add field
      </button>
    </div>
  </div>
</template>
