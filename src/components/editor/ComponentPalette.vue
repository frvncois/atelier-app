<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseModal, BaseBadge } from '@/components/ui'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { COMPONENT_REGISTRY, type ComponentDefinition } from '@/constants/components'
import type { ComponentType } from '@/types'

const props = defineProps<{
  open: boolean
  targetRowId: string | null
}>()

const emit = defineEmits<{
  close: []
  add: [type: ComponentType, name: string]
}>()

const search = ref('')
const activeCategory = ref<'all' | 'layout' | 'display' | 'input' | 'data'>('all')

const categories = [
  { id: 'all', label: 'All' },
  { id: 'layout', label: 'Layout' },
  { id: 'display', label: 'Display' },
  { id: 'data', label: 'Data' },
  { id: 'input', label: 'Input' },
] as const

const filtered = computed(() => {
  let items = COMPONENT_REGISTRY
  if (activeCategory.value !== 'all') {
    items = items.filter(c => c.category === activeCategory.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    items = items.filter(c =>
      c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
  }
  return items
})

function handleAdd(def: ComponentDefinition) {
  emit('add', def.type, def.label)
  emit('close')
}

function handleClose() {
  search.value = ''
  activeCategory.value = 'all'
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Add component" size="md" @close="handleClose">
    <div class="flex flex-col">
      <!-- Search -->
      <div class="px-4 pt-4 pb-3 border-b border-white/[0.07]">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
          <input
            v-model="search"
            autofocus
            placeholder="Search components..."
            class="w-full bg-neutral-800 border border-white/[0.07] rounded-md pl-8 pr-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/[0.2] transition-colors"
          />
        </div>
      </div>

      <!-- Category filter -->
      <div class="flex items-center gap-1 px-4 py-2 border-b border-white/[0.07]">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-3 py-1 text-xs rounded-md transition-colors cursor-pointer"
          :class="activeCategory === cat.id
            ? 'bg-neutral-800 text-neutral-100'
            : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'"
        >{{ cat.label }}</button>
      </div>

      <!-- Results grid -->
      <div class="grid grid-cols-2 gap-2 p-4 max-h-72 overflow-y-auto">
        <div
          v-for="comp in filtered"
          :key="comp.type"
          @click="handleAdd(comp)"
          class="flex items-center gap-3 p-3 rounded-lg border border-white/[0.07] hover:border-white/[0.12] hover:bg-neutral-800 cursor-pointer transition-all"
        >
          <BaseBadge :label="comp.type" :variant="comp.badge as any" mono size="sm" />
          <div class="min-w-0">
            <div class="text-xs font-medium text-neutral-100 truncate">{{ comp.label }}</div>
            <div class="text-[11px] text-neutral-500 truncate">{{ comp.description }}</div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" class="col-span-2 text-center py-8 text-xs text-neutral-600">
          No components match "{{ search }}"
        </div>
      </div>
    </div>
  </BaseModal>
</template>
