<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PlusCircleIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useProjectStore } from '@/stores/projects'
import { timeAgo } from '@/utils/date'
import type { Framework } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()

const projects = computed(() => projectStore.sortedProjects)

const modalOpen = ref(false)
const newName = ref('')
const newFramework = ref<Framework>('vue3')

const frameworkOptions = [
  { value: 'vue3', label: 'Vue 3' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'angular', label: 'Angular' },
  { value: 'agnostic', label: 'Agnostic' },
]

function createProject() {
  if (!newName.value.trim()) return
  const project = projectStore.createProject(newName.value.trim(), newFramework.value as Framework)
  modalOpen.value = false
  newName.value = ''
  router.push({ name: 'editor', params: { id: project.id } })
}

// ─── Delete confirmation ─────────────────────────────────────────
const deleteConfirmId = ref<string | null>(null)

function confirmDelete(id: string, e: MouseEvent) {
  e.stopPropagation()
  deleteConfirmId.value = id
}

function executeDelete() {
  if (!deleteConfirmId.value) return
  projectStore.deleteProject(deleteConfirmId.value)
  deleteConfirmId.value = null
}
</script>

<template>
  <AppLayout>
    <!-- Page header -->
    <div class="px-8 pt-8 pb-6 flex items-center justify-between">
      <h1 class="text-xl font-semibold tracking-tight text-neutral-100">Projects</h1>
      <BaseButton label="New project" :icon-before="PlusIcon" @click="modalOpen = true" />
    </div>

    <!-- Projects grid -->
    <div v-if="projects.length" class="px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <BaseCard
        v-for="project in projects"
        :key="project.id"
        hoverable
        class="group relative"
        @click="router.push({ name: 'editor', params: { id: project.id } })"
      >
        <!-- Thumbnail -->
        <div class="h-32 bg-neutral-800 rounded-lg mb-3 border border-white/[0.07] flex flex-col justify-center gap-2 px-5">
          <div class="h-1.5 bg-neutral-700 rounded-full w-full" />
          <div class="h-1.5 bg-neutral-700 rounded-full w-3/4" />
          <div class="h-1.5 bg-neutral-700 rounded-full w-1/2" />
        </div>

        <!-- Name -->
        <p class="text-sm font-medium text-neutral-100 mb-1">{{ project.name }}</p>

        <!-- Meta row -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-neutral-600">{{ timeAgo(project.updatedAt) }}</span>
          <BaseBadge :label="project.framework" variant="blue" size="sm" />
        </div>

        <!-- Hover actions -->
        <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1.5 rounded-md bg-neutral-800 border border-white/[0.07] text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors cursor-pointer"
            @click.stop="projectStore.duplicateProject(project.id)"
            title="Duplicate project"
          >
            <DocumentDuplicateIcon class="size-3.5" />
          </button>
          <button
            class="p-1.5 rounded-md bg-neutral-800 border border-white/[0.07] text-neutral-400 hover:text-red-400 hover:bg-neutral-700 transition-colors cursor-pointer"
            @click="confirmDelete(project.id, $event)"
            title="Delete project"
          >
            <TrashIcon class="size-3.5" />
          </button>
        </div>
      </BaseCard>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-32 gap-4">
      <PlusCircleIcon class="size-12 text-neutral-700" />
      <p class="text-sm font-medium text-neutral-300">No projects yet</p>
      <p class="text-xs text-neutral-600">Create your first project to get started</p>
      <BaseButton label="Create your first project" @click="modalOpen = true" />
    </div>

    <!-- New project modal -->
    <BaseModal :open="modalOpen" title="New project" size="sm" @close="modalOpen = false">
      <div class="p-5 flex flex-col gap-4">
        <BaseInput v-model="newName" label="Project name" placeholder="My awesome app" />
        <BaseSelect v-model="newFramework" label="Framework" :options="frameworkOptions" />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" label="Cancel" @click="modalOpen = false" />
          <BaseButton label="Create project" @click="createProject" />
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal :open="!!deleteConfirmId" title="Delete project" size="sm" @close="deleteConfirmId = null">
      <div class="p-5">
        <p class="text-sm text-neutral-300">
          Delete "{{ projects.find(p => p.id === deleteConfirmId)?.name }}"? This cannot be undone.
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" label="Cancel" @click="deleteConfirmId = null" />
          <BaseButton variant="danger" label="Delete" @click="executeDelete" />
        </div>
      </template>
    </BaseModal>
  </AppLayout>
</template>
