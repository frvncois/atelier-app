<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ModeNav, BaseButton, BaseBadge } from '@/components/ui'
import BaseModal from '@/components/ui/BaseModal.vue'
import LayoutModePanel from '@/components/editor/LayoutModePanel.vue'
import ViewsModePanel from '@/components/editor/ViewsModePanel.vue'
import ThemeModePanel from '@/components/editor/ThemeModePanel.vue'
import DataModePanel from '@/components/editor/DataModePanel.vue'
import { ArrowDownTrayIcon, XMarkIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useExport, generateMasterMarkdown } from '@/composables/useExport'
import type { EditorMode, Framework } from '@/types'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
const { exportProject, generating } = useExport()

const project = computed(() => projectStore.activeProject)

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
  projectStore.updateProject(project.value.id, { name: renameValue.value.trim() })
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
    if (project.value) projectStore.updateProject(project.value.id, { framework: fw as any })
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
const previewContent = computed(() => project.value ? generateMasterMarkdown(project.value) : '')

onMounted(() => {
  useKeyboardShortcuts()
  projectStore.setActiveProject(route.params.id as string)
  if (!editorStore.activeViewId) {
    const firstView = projectStore.activeProject?.views[0]
    if (firstView) {
      editorStore.setActiveView(firstView.id)
    }
  }
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-neutral-950 text-neutral-100">

    <!-- AppHeader -->
    <header class="h-12 flex items-center px-4 gap-3 border-b border-white/[0.07] shrink-0">
      <!-- Logo: lime square "A" — router.push('/projects') on click -->
      <div @click="router.push('/projects')" class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold cursor-pointer select-none">A</div>
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

  </div>
</template>
