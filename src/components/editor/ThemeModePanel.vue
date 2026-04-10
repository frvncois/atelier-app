<script setup lang="ts">
import { computed } from 'vue'
import { SidebarPanel, SectionHeader, FieldGroup, FieldRow, BaseSelect, BaseSlider, BaseToggle, ColorSwatch } from '@/components/ui'
import ThemePreview from './previews/ThemePreview.vue'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useHistory } from '@/composables/useHistory'

const projectStore = useProjectStore()
const editorStore = useEditorStore()
const { snapshot } = useHistory()

type TokenSection = 'colors' | 'typography' | 'spacing'

const activeTokenSection = computed({
  get: () => editorStore.activeTokenSection as TokenSection,
  set: (val: TokenSection) => editorStore.setTokenSection(val),
})

const theme = computed(() => projectStore.activeProject?.theme)

const darkMode = computed(() => (theme.value?.mode ?? 'dark') === 'dark')
const baseRadius = computed(() => theme.value?.spacing?.radius ?? 8)
const baseSpacing = computed(() => theme.value?.spacing?.baseUnit ?? 4)

const colorTokens = [
  { name: 'Background', key: 'background', description: 'Page background', swatches: ['#0a0a0a','#111111','#18181b','#1c1917'] },
  { name: 'Surface', key: 'surface', description: 'Card and panel bg', swatches: ['#171717','#1c1c1e','#1e1e24','#18181b'] },
  { name: 'Primary', key: 'primary', description: 'Brand / accent color', swatches: ['#a3e635','#22d3ee','#818cf8','#f59e0b'] },
  { name: 'Foreground', key: 'foreground', description: 'Primary text', swatches: ['#fafafa','#f4f4f5','#e4e4e7','#d4d4d8'] },
  { name: 'Muted', key: 'muted', description: 'Secondary text', swatches: ['#71717a','#737373','#6b7280','#64748b'] },
  { name: 'Destructive', key: 'destructive', description: 'Error and danger', swatches: ['#f87171','#ef4444','#dc2626','#b91c1c'] },
]

const selectedSwatches = computed(() => {
  const colors = theme.value?.colors
  return {
    Background: colors?.background ?? '#0a0a0a',
    Surface: colors?.surface ?? '#171717',
    Primary: colors?.primary ?? '#a3e635',
    Foreground: colors?.foreground ?? '#fafafa',
    Muted: colors?.muted ?? '#71717a',
    Destructive: colors?.destructive ?? '#f87171',
  }
})

const navSections = [
  { id: 'colors', label: 'Colors', group: 'Tokens' },
  { id: 'typography', label: 'Typography', group: 'Tokens' },
  { id: 'spacing', label: 'Spacing & Radius', group: 'Global' },
]

function setColor(tokenKey: string, hex: string) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: {
      ...t,
      colors: { ...t.colors, [tokenKey]: hex },
    },
  })
}

function setDarkMode(val: boolean) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, mode: val ? 'dark' : 'light' },
  })
}

function setBaseSpacing(val: number) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, spacing: { ...t.spacing, baseUnit: val } },
  })
}

function setBaseRadius(val: number) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, spacing: { ...t.spacing, radius: val } },
  })
}

function setHeadingFont(val: string) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, typography: { ...t.typography, headingFont: val } },
  })
}

function setBodyFont(val: string) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, typography: { ...t.typography, bodyFont: val } },
  })
}

function setMonoFont(val: string) {
  snapshot()
  if (!projectStore.activeProject) return
  const t = projectStore.activeProject.theme
  projectStore.updateProject(projectStore.activeProject.id, {
    theme: { ...t, typography: { ...t.typography, monoFont: val } },
  })
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden">

    <!-- Left nav -->
    <SidebarPanel width="w-[175px]">
      <div class="p-3 flex flex-col gap-4">
        <div>
          <p class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest px-2 mb-1">Tokens</p>
          <div class="flex flex-col gap-0.5">
            <button
              v-for="s in navSections.filter(n => n.group === 'Tokens')"
              :key="s.id"
              @click="activeTokenSection = s.id as TokenSection"
              class="text-left px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
              :class="activeTokenSection === s.id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'"
            >{{ s.label }}</button>
          </div>
        </div>
        <div>
          <p class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest px-2 mb-1">Global</p>
          <button
            @click="activeTokenSection = 'spacing'"
            class="w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
            :class="activeTokenSection === 'spacing' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'"
          >Spacing & Radius</button>
        </div>
      </div>
    </SidebarPanel>

    <!-- Center -->
    <div class="flex flex-col flex-1 overflow-hidden">

      <!-- Colors section -->
      <template v-if="activeTokenSection === 'colors'">
        <SectionHeader title="Colors">
          <template #actions>
            <div class="flex items-center gap-2">
              <span class="text-xs text-neutral-500">Dark mode</span>
              <BaseToggle :model-value="darkMode" size="sm" @update:model-value="setDarkMode" />
            </div>
          </template>
        </SectionHeader>
        <div class="flex-1 overflow-y-auto p-6 max-w-2xl">
          <div class="flex flex-col gap-0">
            <div
              v-for="token in colorTokens"
              :key="token.name"
              class="flex items-center justify-between py-3 border-b border-white/[0.07]"
            >
              <div>
                <p class="text-xs font-medium text-neutral-200">{{ token.name }}</p>
                <p class="text-[10px] text-neutral-600 mt-0.5">{{ token.description }}</p>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <ColorSwatch
                    v-for="swatch in token.swatches"
                    :key="swatch"
                    :color="swatch"
                    size="sm"
                    :selected="selectedSwatches[token.name as keyof typeof selectedSwatches] === swatch"
                    @click="setColor(token.key, swatch)"
                  />
                </div>
                <span class="font-mono text-[10px] text-neutral-500 w-16">{{ selectedSwatches[token.name as keyof typeof selectedSwatches] }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Typography section -->
      <template v-else-if="activeTokenSection === 'typography'">
        <SectionHeader title="Typography" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Font families">
            <FieldRow label="Heading">
              <BaseSelect
                :model-value="theme?.typography?.headingFont ?? 'geist'"
                :options="[{value:'geist',label:'Geist'},{value:'inter',label:'Inter'},{value:'system',label:'System'}]"
                @update:model-value="setHeadingFont"
              />
            </FieldRow>
            <FieldRow label="Body">
              <BaseSelect
                :model-value="theme?.typography?.bodyFont ?? 'geist'"
                :options="[{value:'geist',label:'Geist'},{value:'inter',label:'Inter'},{value:'system',label:'System'}]"
                @update:model-value="setBodyFont"
              />
            </FieldRow>
            <FieldRow label="Mono">
              <BaseSelect
                :model-value="theme?.typography?.monoFont ?? 'geist-mono'"
                :options="[{value:'geist-mono',label:'Geist Mono'},{value:'fira',label:'Fira Code'},{value:'jetbrains',label:'JetBrains Mono'}]"
                @update:model-value="setMonoFont"
              />
            </FieldRow>
          </FieldGroup>
        </div>
      </template>

      <!-- Spacing section -->
      <template v-else>
        <SectionHeader title="Spacing & Radius" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Layout">
            <FieldRow label="Base unit">
              <BaseSlider :model-value="baseSpacing" :min="2" :max="8" :step="1" unit="px" @update:model-value="setBaseSpacing" />
            </FieldRow>
          </FieldGroup>
          <FieldGroup label="Borders">
            <FieldRow label="Base radius">
              <BaseSlider :model-value="baseRadius" :min="0" :max="20" :step="1" unit="px" @update:model-value="setBaseRadius" />
            </FieldRow>
          </FieldGroup>
        </div>
      </template>

    </div>

    <ThemePreview />
  </div>
</template>
