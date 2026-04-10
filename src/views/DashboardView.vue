<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseAvatar, BaseModal, BaseInput, BaseSelect, BaseBadge, BaseDropdown } from '@/components/ui'
import { PlusIcon, ArrowDownTrayIcon, InboxIcon, FolderIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import ImportModal from '@/components/ImportModal.vue'
import type { Project } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const projects = computed(() => projectStore.sortedProjects)
const user = computed(() => authStore.user)

// ─── New project modal ────────────────────────────────────────
const newProjectOpen = ref(false)
const newProjectName = ref('')
const newProjectFramework = ref<'vue3' | 'react' | 'svelte' | 'nuxt' | 'angular' | 'agnostic'>('vue3')
const frameworkOptions = [
  { value: 'vue3', label: 'Vue 3' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'angular', label: 'Angular' },
  { value: 'agnostic', label: 'Agnostic' },
]

onMounted(async () => {
  await projectStore.fetchProjects()
})

async function createProject() {
  if (!newProjectName.value.trim()) return
  const project = await projectStore.createProject(newProjectName.value.trim(), newProjectFramework.value)
  newProjectOpen.value = false
  newProjectName.value = ''
  router.push({ name: 'editor', params: { id: project.id } })
}

function openProject(id: string) {
  projectStore.setActiveProject(id)
  router.push({ name: 'editor', params: { id } })
}

async function duplicateProject(id: string) {
  await projectStore.duplicateProject(id)
}

// ─── Delete confirmation ──────────────────────────────────────
const deleteConfirmId = ref<string | null>(null)

function confirmDelete(id: string, e: Event) {
  e.stopPropagation()
  deleteConfirmId.value = id
}

async function executeDelete() {
  if (!deleteConfirmId.value) return
  await projectStore.deleteProject(deleteConfirmId.value)
  deleteConfirmId.value = null
}

// ─── Import modal ─────────────────────────────────────────────
const importOpen = ref(false)

function handleImported(_project: Project) {
  // Project already persisted by ImportModal; close modal on step-3 "Open project" click
}

// ─── User menu ───────────────────────────────────────────────
async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'landing' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const frameworkLabelMap: Record<string, string> = {
  vue3: 'Vue 3', react: 'React', svelte: 'Svelte', nuxt: 'Nuxt', angular: 'Angular', agnostic: 'Agnostic',
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100">

    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-8 gap-4 bg-neutral-950/90 backdrop-blur border-b border-white/[0.07]">
      <div @click="router.push('/')" class="flex items-center gap-2.5 cursor-pointer select-none">
        <div class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold">A</div>
        <span class="text-sm font-semibold text-neutral-100">Atelier</span>
      </div>
      <div class="ml-auto flex items-center gap-3">
        <span class="text-xs text-neutral-500">{{ user?.email }}</span>
        <BaseAvatar :name="user?.name ?? 'U'" size="sm" />
        <BaseButton label="Log out" variant="ghost" size="sm" @click="handleLogout" />
      </div>
    </header>

    <!-- Page content -->
    <main class="pt-14">
      <div class="px-8 pt-8 pb-6 flex items-center justify-between max-w-6xl mx-auto">
        <h1 class="text-xl font-semibold tracking-tight">Your projects</h1>
        <div class="flex items-center gap-2">
          <BaseButton
            label="Import"
            variant="outline"
            size="sm"
            :icon-before="ArrowDownTrayIcon"
            @click="importOpen = true"
          />
          <BaseButton
            label="New project"
            size="sm"
            :icon-before="PlusIcon"
            @click="newProjectOpen = true"
          />
        </div>
      </div>

      <div class="px-8 max-w-6xl mx-auto pb-16">

        <!-- Loading skeleton -->
        <div v-if="projectStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="bg-neutral-900 border border-white/[0.07] rounded-xl p-5 animate-pulse">
            <div class="w-9 h-9 rounded-lg bg-neutral-800 mb-4"></div>
            <div class="h-3 bg-neutral-800 rounded mb-2 w-2/3"></div>
            <div class="h-2.5 bg-neutral-800 rounded mb-3 w-1/3"></div>
            <div class="h-2 bg-neutral-800 rounded w-1/4"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="projects.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
          <InboxIcon class="size-12 text-neutral-700" />
          <div class="text-center">
            <h2 class="text-sm font-medium text-neutral-300 mb-1">No projects yet</h2>
            <p class="text-xs text-neutral-600">Create a new project or import an existing codebase</p>
          </div>
          <div class="flex gap-2 mt-2">
            <BaseButton label="New project" size="sm" :icon-before="PlusIcon" @click="newProjectOpen = true" />
            <BaseButton label="Import" variant="outline" size="sm" :icon-before="ArrowDownTrayIcon" @click="importOpen = true" />
          </div>
        </div>

        <!-- Project grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="project in projects"
            :key="project.id"
            class="bg-neutral-900 border border-white/[0.07] rounded-xl p-5 cursor-pointer hover:border-white/[0.12] transition-colors group"
            @click="openProject(project.id)"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="w-9 h-9 rounded-lg bg-lime-400/10 flex items-center justify-center">
                <FolderIcon class="size-4 text-lime-400" />
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <BaseButton
                  label=""
                  variant="ghost"
                  size="xs"
                  @click.stop="duplicateProject(project.id)"
                  class="text-neutral-500"
                />
                <button
                  class="px-2 py-1 text-xs text-neutral-600 hover:text-red-400 transition-colors cursor-pointer rounded"
                  @click="confirmDelete(project.id, $event)"
                >
                  Delete
                </button>
              </div>
            </div>

            <!-- Info -->
            <h3 class="text-sm font-semibold text-neutral-100 mb-1 truncate">{{ project.name }}</h3>
            <div class="flex items-center gap-2 mb-3">
              <BaseBadge :label="frameworkLabelMap[project.framework] ?? project.framework" variant="default" size="sm" />
              <span class="text-[10px] text-neutral-600">{{ project.views.length }} views</span>
            </div>
            <p class="text-[10px] text-neutral-600">Updated {{ formatDate(project.updatedAt) }}</p>
          </div>
        </div>

      </div>
    </main>

    <!-- New project modal -->
    <BaseModal :open="newProjectOpen" title="New project" size="sm" @close="newProjectOpen = false">
      <div class="px-5 py-4 flex flex-col gap-3">
        <BaseInput v-model="newProjectName" label="Project name" placeholder="My awesome app" />
        <BaseSelect
          v-model="newProjectFramework"
          label="Framework"
          :options="frameworkOptions"
        />
      </div>
      <template #footer>
        <div class="flex gap-2 px-5 pb-4">
          <BaseButton label="Cancel" variant="ghost" size="sm" class="flex-1" @click="newProjectOpen = false" />
          <BaseButton label="Create project" size="sm" class="flex-1" @click="createProject" :disabled="!newProjectName.trim()" />
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirmation modal -->
    <BaseModal
      :open="deleteConfirmId !== null"
      title="Delete project"
      size="sm"
      @close="deleteConfirmId = null"
    >
      <div class="px-5 py-4">
        <p class="text-sm text-neutral-300 mb-1">
          Delete <span class="font-medium text-neutral-100">{{ projects.find(p => p.id === deleteConfirmId)?.name }}</span>?
        </p>
        <p class="text-xs text-neutral-600">This action cannot be undone.</p>
      </div>
      <template #footer>
        <div class="flex gap-2 px-5 pb-4">
          <BaseButton label="Cancel" variant="ghost" size="sm" class="flex-1" @click="deleteConfirmId = null" />
          <BaseButton label="Delete" variant="danger" size="sm" class="flex-1" @click="executeDelete" />
        </div>
      </template>
    </BaseModal>

    <!-- Import modal -->
    <ImportModal
      v-if="importOpen"
      @close="importOpen = false"
      @imported="handleImported"
    />

  </div>
</template>
