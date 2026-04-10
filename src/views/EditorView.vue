<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ModeNav, BaseButton, BaseBadge, BaseAvatar } from '@/components/ui'
import BaseModal from '@/components/ui/BaseModal.vue'
import LayoutModePanel from '@/components/editor/LayoutModePanel.vue'
import ViewsModePanel from '@/components/editor/ViewsModePanel.vue'
import ThemeModePanel from '@/components/editor/ThemeModePanel.vue'
import DataModePanel from '@/components/editor/DataModePanel.vue'
import { ArrowDownTrayIcon, XMarkIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, CloudArrowUpIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useAuthStore } from '@/stores/auth'
import { useGuestStore } from '@/stores/guest'
import { supabase } from '@/lib/supabase'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useExport, generateMasterMarkdown } from '@/composables/useExport'
import type { EditorMode, Framework, Project } from '@/types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
const authStore = useAuthStore()
const guestStore = useGuestStore()
const { exportProject, generating } = useExport()

const isGuest = computed(() => route.name === 'guest-editor')

const project = computed(() =>
  isGuest.value ? guestStore.project : projectStore.activeProject
)

function updateActiveProject(patch: Partial<Project>): void {
  if (isGuest.value) {
    guestStore.updateProject(patch)
  } else if (projectStore.activeProject) {
    projectStore.updateProject(projectStore.activeProject.id, patch)
  }
}

const activeMode = computed({
  get: () => editorStore.activeMode,
  set: (val: EditorMode) => editorStore.setMode(val),
})

const exportOpen = computed(() => editorStore.exportOpen)

const projectName = computed(() => project.value?.name ?? 'Project')

// ─── Inline rename ───────────────────────────────────────────────
const isRenaming = ref(false)
const renameValue = ref('')

function startRename() {
  if (!project.value) return
  renameValue.value = project.value.name
  isRenaming.value = true
}

function commitRename() {
  if (!project.value || !renameValue.value.trim()) {
    isRenaming.value = false
    return
  }
  updateActiveProject({ name: renameValue.value.trim() })
  isRenaming.value = false
}

// ─── Mode nav ────────────────────────────────────────────────────
const modeItems = [
  { id: 'layout', label: 'Layout' },
  { id: 'views', label: 'Views' },
  { id: 'theme', label: 'Theme' },
  { id: 'data', label: 'Data' },
]

const currentPanel = computed(() => {
  const map: Record<EditorMode, any> = {
    layout: LayoutModePanel,
    views: ViewsModePanel,
    theme: ThemeModePanel,
    data: DataModePanel,
  }
  return map[activeMode.value]
})

// ─── Export panel ────────────────────────────────────────────────
const uniqueComponentCount = computed(() => {
  const types = new Set<string>()
  for (const view of project.value?.views ?? []) {
    for (const row of view.rows) {
      for (const comp of row.components) types.add(comp.type)
    }
  }
  return types.size
})

const outputFiles = computed(() => [
  { num: '00', name: 'MASTER.md', desc: 'Project overview and architecture' },
  { num: '01', name: 'TOKENS.md', desc: 'Design tokens + theme config' },
  { num: '02', name: 'COMPONENTS.md', desc: `${uniqueComponentCount.value} component types with props` },
  { num: '03', name: 'LAYOUT.md', desc: 'Shell, nav pattern, routing setup' },
  { num: '04', name: 'VIEWS.md', desc: `${project.value?.views.length ?? 0} views with component trees` },
  { num: '05', name: 'DATA.md', desc: `${project.value?.schemas.length ?? 0} schemas + actions` },
])

const selectedFramework = computed({
  get: () => project.value?.framework ?? 'vue3',
  set: (fw) => {
    updateActiveProject({ framework: fw as any })
  }
})

const frameworks: { id: Framework; label: string; desc: string }[] = [
  { id: 'vue3', label: 'Vue 3', desc: 'Composition API + Vite' },
  { id: 'react', label: 'React', desc: 'React 18 + Vite' },
  { id: 'svelte', label: 'Svelte', desc: 'SvelteKit' },
  { id: 'nuxt', label: 'Nuxt', desc: 'Nuxt 3 + SSR' },
  { id: 'angular', label: 'Angular', desc: 'Angular 17' },
  { id: 'agnostic', label: 'Agnostic', desc: 'Framework-free' },
]

// ─── Preview modal ───────────────────────────────────────────────
const previewOpen = ref(false)
const showSaveGate = ref(false)
const previewContent = computed(() => project.value ? generateMasterMarkdown(project.value) : '')

// ─── Realtime collaboration ───────────────────────────────────────
const clientId = crypto.randomUUID()
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

function subscribeToRealtime() {
  if (isGuest.value || !projectStore.activeProject) return

  const projectId = projectStore.activeProject.id

  realtimeChannel = supabase
    .channel(`project_content:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_content',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        if ((payload.new as any)._client_id === clientId) return
        const content = payload.new as any
        projectStore.updateProjectLocal(projectId, {
          shell: content.shell,
          views: content.views,
          theme: content.theme,
          schemas: content.schemas,
          actions: content.actions,
        })
      }
    )
    .subscribe()
}

onUnmounted(() => {
  realtimeChannel?.unsubscribe()
})

// ─── Share / collaborators ────────────────────────────────────────
const shareOpen = ref(false)
const inviteEmail = ref('')
const inviting = ref(false)
const inviteError = ref('')

interface Collaborator {
  id: string
  userId: string
  name: string
  email: string
  role: string
}
const collaborators = ref<Collaborator[]>([])

const isOwner = computed(() =>
  !isGuest.value && authStore.user?.id === projectStore.activeProject?.ownerId
)

async function fetchCollaborators(): Promise<void> {
  if (!projectStore.activeProject) return
  const { data } = await supabase
    .from('project_collaborators')
    .select('id, user_id, role, profiles(name, email)')
    .eq('project_id', projectStore.activeProject.id)
  collaborators.value = (data ?? []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    name: c.profiles?.name ?? '',
    email: c.profiles?.email ?? '',
    role: c.role,
  }))
}

async function inviteCollaborator(): Promise<void> {
  if (!inviteEmail.value.trim() || !projectStore.activeProject) return
  inviting.value = true
  inviteError.value = ''
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', inviteEmail.value.trim())
      .single()

    if (!profile) {
      inviteError.value = 'No Atelier account found with that email.'
      return
    }

    await supabase.from('project_collaborators').insert({
      project_id: projectStore.activeProject.id,
      user_id: profile.id,
      role: 'editor',
    })

    await fetchCollaborators()
    inviteEmail.value = ''
  } finally {
    inviting.value = false
  }
}

async function removeCollaborator(id: string): Promise<void> {
  await supabase.from('project_collaborators').delete().eq('id', id)
  await fetchCollaborators()
}

onMounted(async () => {
  useKeyboardShortcuts()
  if (isGuest.value) {
    if (!guestStore.hasProject) guestStore.initProject()
    const gp = guestStore.project!
    if (!projectStore.projects.find(p => p.id === gp.id)) {
      projectStore.projects.push({ ...gp })
    }
    projectStore.setActiveProject(gp.id)
    watch(() => projectStore.activeProject, (proj) => {
      if (isGuest.value && proj) {
        guestStore.updateProject({ ...proj })
      }
    }, { deep: true })
  } else {
    const id = route.params.id as string
    projectStore.setActiveProject(id)
    await projectStore.loadProjectContent(id)
    subscribeToRealtime()
  }
  editorStore.clearHistory()
  const firstView = projectStore.activeProject?.views[0]
  if (firstView) editorStore.setActiveView(firstView.id)
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-neutral-950 text-neutral-100">

    <!-- AppHeader -->
    <header class="h-12 flex items-center px-4 gap-3 border-b border-white/[0.07] shrink-0">
      <!-- Logo: lime square "A" — router.push('/projects') on click -->
      <div @click="router.push(isGuest ? '/' : '/dashboard')" class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold cursor-pointer select-none">A</div>
      <!-- Separator -->
      <div class="w-px h-5 bg-white/[0.07]"></div>
      <!-- Project name chip / inline rename -->
      <div
        v-if="!isRenaming"
        @click="startRename"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/[0.07] bg-neutral-900 text-xs text-neutral-300 cursor-pointer hover:border-white/[0.12] transition-colors"
      >
        {{ projectName }}
      </div>
      <input
        v-else
        v-model="renameValue"
        autofocus
        class="px-2.5 py-1 rounded-md border border-lime-400/40 bg-neutral-900 text-xs text-neutral-100 outline-none w-36"
        @blur="commitRename"
        @keydown.enter="commitRename"
        @keydown.escape="isRenaming = false"
      />
      <!-- Mode nav (centered via ml-auto + mr-auto or just flex) -->
      <div class="ml-4">
        <ModeNav :items="modeItems" v-model="activeMode" />
      </div>
      <!-- Guest save nudge -->
      <div
        v-if="isGuest"
        class="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-xs text-amber-400 cursor-pointer hover:bg-amber-400/15 transition-colors"
        @click="router.push({ name: 'signup', query: { redirect: '/dashboard' } })"
      >
        <CloudArrowUpIcon class="size-3.5" />
        Sign in to save
      </div>
      <!-- Right actions -->
      <div class="ml-auto flex items-center gap-2">
        <BaseButton
          label=""
          size="sm"
          variant="ghost"
          :icon-before="ArrowUturnLeftIcon"
          :disabled="!editorStore.canUndo"
          @click="editorStore.undo()"
        />
        <BaseButton
          label=""
          size="sm"
          variant="ghost"
          :icon-before="ArrowUturnRightIcon"
          :disabled="!editorStore.canRedo"
          @click="editorStore.redo()"
        />
        <BaseButton
          v-if="isGuest"
          label="Save"
          size="sm"
          variant="secondary"
          @click="showSaveGate = true"
        />
        <BaseButton
          v-if="isOwner"
          label="Share"
          size="sm"
          variant="outline"
          :icon-before="UserPlusIcon"
          @click="shareOpen = true; fetchCollaborators()"
        />
        <BaseButton label="Export" size="sm" @click="editorStore.toggleExport()" />
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden relative">
      <component :is="currentPanel" />
    </div>

    <!-- Export panel overlay -->
    <template v-if="exportOpen">
      <div class="fixed inset-0 z-40 bg-black/40" @click="editorStore.toggleExport()"></div>
      <div class="fixed top-0 right-0 h-full w-[480px] z-50 bg-neutral-900 border-l border-white/[0.12] flex flex-col shadow-2xl">
        <!-- Header -->
        <div class="h-14 px-5 flex items-center justify-between border-b border-white/[0.07] shrink-0">
          <span class="text-sm font-medium text-neutral-100">Export project</span>
          <button @click="editorStore.toggleExport()" class="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer">
            <XMarkIcon class="size-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          <!-- Framework selector -->
          <div>
            <p class="text-xs text-neutral-400 mb-3 font-medium">Select framework</p>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="fw in frameworks"
                :key="fw.id"
                @click="selectedFramework = fw.id"
                class="flex flex-col p-3 rounded-lg border cursor-pointer transition-all"
                :class="selectedFramework === fw.id ? 'border-lime-400/50 bg-lime-400/10' : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-neutral-800'"
              >
                <span class="text-xs font-medium" :class="selectedFramework === fw.id ? 'text-lime-400' : 'text-neutral-200'">{{ fw.label }}</span>
                <span class="text-[10px] text-neutral-600 mt-0.5">{{ fw.desc }}</span>
              </div>
            </div>
          </div>

          <!-- Output files list -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs text-neutral-400 font-medium">Output files</p>
              <BaseBadge :label="`${outputFiles.length} files`" variant="default" size="sm" />
            </div>
            <div>
              <div
                v-for="file in outputFiles"
                :key="file.num"
                class="flex items-center gap-3 py-2.5 border-b border-white/[0.07]"
              >
                <span class="font-mono text-[10px] text-neutral-600 w-5">{{ file.num }}</span>
                <span class="font-mono text-xs text-lime-600 flex-1">{{ file.name }}</span>
                <span class="text-xs text-neutral-500">{{ file.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="shrink-0 p-4 border-t border-white/[0.07] flex gap-3">
          <BaseButton variant="outline" label="Preview output" class="flex-1" @click="previewOpen = true" />
          <BaseButton
            label="Download .zip"
            :icon-before="ArrowDownTrayIcon"
            :loading="generating"
            class="flex-1"
            @click="project && exportProject(project)"
          />
        </div>
      </div>
    </template>

    <!-- Preview modal -->
    <BaseModal :open="previewOpen" title="Preview — 00_MASTER.md" size="lg" @close="previewOpen = false">
      <div class="p-4">
        <pre class="font-mono text-xs text-neutral-300 bg-neutral-950 rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap">{{ previewContent }}</pre>
      </div>
    </BaseModal>

    <!-- Share modal -->
    <BaseModal :open="shareOpen" title="Share project" size="sm" @close="shareOpen = false">
      <div class="px-5 py-4 flex flex-col gap-4">
        <div class="flex gap-2">
          <BaseInput v-model="inviteEmail" placeholder="colleague@example.com" class="flex-1" />
          <BaseButton label="Invite" size="sm" :loading="inviting" @click="inviteCollaborator" />
        </div>
        <p v-if="inviteError" class="text-xs text-red-400 -mt-2">{{ inviteError }}</p>

        <div v-if="collaborators.length > 0" class="flex flex-col gap-0">
          <div
            v-for="collab in collaborators"
            :key="collab.id"
            class="flex items-center justify-between py-2.5 border-b border-white/[0.07]"
          >
            <div class="flex items-center gap-2">
              <BaseAvatar :name="collab.name" size="sm" />
              <div>
                <p class="text-xs font-medium text-neutral-100">{{ collab.name }}</p>
                <p class="text-[10px] text-neutral-600">{{ collab.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge :label="collab.role" variant="default" size="sm" />
              <button @click="removeCollaborator(collab.id)" class="text-neutral-600 hover:text-red-400 cursor-pointer transition-colors">
                <XMarkIcon class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-neutral-600 text-center">No collaborators yet. Invite someone above.</p>
      </div>
    </BaseModal>

    <!-- Save gate modal -->
    <BaseModal :open="showSaveGate" title="Save your project" size="sm" @close="showSaveGate = false">
      <div class="px-5 py-4">
        <p class="text-sm text-neutral-300 mb-4">
          Create a free account to save your project and access it from anywhere.
        </p>
        <div class="flex flex-col gap-2">
          <BaseButton
            label="Create free account"
            variant="default"
            class="w-full"
            @click="router.push({ name: 'signup', query: { redirect: '/dashboard' } })"
          />
          <BaseButton
            label="Sign in"
            variant="outline"
            class="w-full"
            @click="router.push({ name: 'login', query: { redirect: '/dashboard' } })"
          />
        </div>
        <p class="text-xs text-neutral-600 text-center mt-4">
          You can still export without an account.
        </p>
      </div>
    </BaseModal>

  </div>
</template>
