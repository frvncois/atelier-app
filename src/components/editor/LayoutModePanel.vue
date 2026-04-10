<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { SidebarPanel, SectionHeader, FieldGroup, FieldRow, BaseInput, BaseSelect, BaseToggle, ShellSectionItem, NavItemRow, PatternCard } from '@/components/ui'
import { Squares2X2Icon, SparklesIcon, Bars3Icon, UserCircleIcon, BoltIcon, PlusIcon, HomeIcon, MagnifyingGlassIcon, BellIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useHistory } from '@/composables/useHistory'
import { createNavItem } from '@/utils/factories'
import type { NavPattern, ShellConfig } from '@/types'

const projectStore = useProjectStore()
const editorStore = useEditorStore()
const { snapshot } = useHistory()

type Section = 'nav-pattern' | 'brand' | 'nav-items' | 'user-menu' | 'global'

const activeSection = computed({
  get: () => editorStore.activeShellSection as Section,
  set: (val: Section) => editorStore.setShellSection(val),
})

const shell = computed(() => projectStore.activeProject?.shell)

const sidebarSections = [
  { id: 'nav-pattern', label: 'Nav pattern', description: 'Layout structure', icon: Squares2X2Icon },
  { id: 'brand', label: 'Brand', description: 'Logo and identity', icon: SparklesIcon },
  { id: 'nav-items', label: 'Nav items', description: 'Menu links', icon: Bars3Icon },
  { id: 'user-menu', label: 'User menu', description: 'Account dropdown', icon: UserCircleIcon },
  { id: 'global', label: 'Global elements', description: 'App-wide UI', icon: BoltIcon },
]

// ─── Nav items from store ──────────────────────────────────────
const sidebarItems = computed(() =>
  [...(shell.value?.sidebarItems ?? [])].sort((a, b) => a.order - b.order)
)
const topBarItems = computed(() =>
  [...(shell.value?.topBarItems ?? [])].sort((a, b) => a.order - b.order)
)

const addingTo = ref<'sidebar' | 'topbar' | null>(null)
const newItemLabel = ref('')
const newItemIcon = ref('')

function commitAddItem(target: 'sidebar' | 'topbar') {
  if (!newItemLabel.value.trim() || !projectStore.activeProject) return
  snapshot()
  const item = createNavItem(
    newItemLabel.value.trim(),
    newItemIcon.value.trim() || 'HomeIcon',
    target === 'sidebar'
      ? (shell.value?.sidebarItems.length ?? 0)
      : (shell.value?.topBarItems.length ?? 0),
  )
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: target === 'sidebar'
      ? { ...s, sidebarItems: [...s.sidebarItems, item] }
      : { ...s, topBarItems: [...s.topBarItems, item] },
  })
  newItemLabel.value = ''
  newItemIcon.value = ''
  addingTo.value = null
}

function removeNavItem(id: string, target: 'sidebar' | 'topbar') {
  if (!projectStore.activeProject) return
  snapshot()
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: target === 'sidebar'
      ? { ...s, sidebarItems: s.sidebarItems.filter(i => i.id !== id) }
      : { ...s, topBarItems: s.topBarItems.filter(i => i.id !== id) },
  })
}

// ─── Nav pattern ──────────────────────────────────────────────
function setPattern(p: NavPattern) {
  snapshot()
  if (!projectStore.activeProject) return
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...projectStore.activeProject.shell, pattern: p },
  })
}

function setSticky(val: boolean) {
  snapshot()
  if (!projectStore.activeProject) return
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...s, topBar: { ...s.topBar, sticky: val } },
  })
}

function setCollapsible(val: boolean) {
  snapshot()
  if (!projectStore.activeProject) return
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...s, sidebar: { ...s.sidebar, collapsible: val } },
  })
}

function setShowBorder(val: boolean) {
  snapshot()
  if (!projectStore.activeProject) return
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...s, topBar: { ...s.topBar, border: val } },
  })
}

// ─── Brand ────────────────────────────────────────────────────
const saveBrand = useDebounceFn((patch: Partial<ShellConfig['brand']>) => {
  if (!projectStore.activeProject) return
  snapshot()
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...s, brand: { ...s.brand, ...patch } },
  })
}, 400)

// ─── User menu ────────────────────────────────────────────────
const saveUserMenu = useDebounceFn((patch: Partial<ShellConfig['userMenu']>) => {
  if (!projectStore.activeProject) return
  snapshot()
  const s = projectStore.activeProject.shell
  projectStore.updateProject(projectStore.activeProject.id, {
    shell: { ...s, userMenu: { ...s.userMenu, ...patch } },
  })
}, 400)
</script>

<template>
  <div class="flex flex-1 overflow-hidden">
    <!-- Left sidebar -->
    <SidebarPanel width="w-[220px]">
      <template #header>
        <div class="px-3 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Layout</div>
      </template>
      <div class="p-2 flex flex-col gap-1">
        <ShellSectionItem
          v-for="s in sidebarSections"
          :key="s.id"
          :icon="s.icon"
          :name="s.label"
          :description="s.description"
          :active="activeSection === s.id"
          @click="activeSection = s.id as Section"
        />
      </div>
    </SidebarPanel>

    <!-- Center editor -->
    <div class="flex flex-col flex-1 overflow-hidden">

      <!-- Nav pattern section -->
      <template v-if="activeSection === 'nav-pattern'">
        <SectionHeader title="Nav pattern" />
        <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 gap-8 max-w-3xl">
            <!-- Form column -->
            <div class="flex flex-col gap-6">
              <FieldGroup label="Pattern">
                <div class="grid grid-cols-2 gap-2">
                  <PatternCard label="Top only" pattern="top-only" :selected="shell?.pattern === 'top-only'" @click="setPattern('top-only')" />
                  <PatternCard label="Sidebar only" pattern="sidebar-only" :selected="shell?.pattern === 'sidebar-only'" @click="setPattern('sidebar-only')" />
                  <PatternCard label="Top + Sidebar" pattern="top-sidebar" :selected="shell?.pattern === 'top-sidebar'" @click="setPattern('top-sidebar')" />
                  <PatternCard label="None" pattern="none" :selected="shell?.pattern === 'none'" @click="setPattern('none')" />
                </div>
              </FieldGroup>
              <FieldGroup label="Options">
                <FieldRow label="Sticky header">
                  <BaseToggle :model-value="shell?.topBar?.sticky ?? true" size="sm" @update:model-value="setSticky" />
                </FieldRow>
                <FieldRow label="Collapsible sidebar">
                  <BaseToggle :model-value="shell?.sidebar?.collapsible ?? false" size="sm" @update:model-value="setCollapsible" />
                </FieldRow>
                <FieldRow label="Show border">
                  <BaseToggle :model-value="shell?.topBar?.border ?? true" size="sm" @update:model-value="setShowBorder" />
                </FieldRow>
              </FieldGroup>
            </div>
            <!-- Spec summary column -->
            <div>
              <p class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest mb-3">Spec summary</p>
              <div class="bg-neutral-900 border border-white/[0.07] rounded-lg p-4 text-xs text-neutral-400 space-y-2 font-mono">
                <div><span class="text-neutral-600">pattern: </span><span class="text-lime-600">{{ shell?.pattern }}</span></div>
                <div><span class="text-neutral-600">sticky: </span><span class="text-sky-400">{{ shell?.topBar?.sticky }}</span></div>
                <div><span class="text-neutral-600">collapsible: </span><span class="text-sky-400">{{ shell?.sidebar?.collapsible }}</span></div>
                <div><span class="text-neutral-600">border: </span><span class="text-sky-400">{{ shell?.topBar?.border }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Brand section -->
      <template v-else-if="activeSection === 'brand'">
        <SectionHeader title="Brand" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Identity">
            <FieldRow label="App name">
              <BaseInput
                :model-value="shell?.brand?.appName ?? ''"
                @update:model-value="saveBrand({ appName: $event })"
              />
            </FieldRow>
            <FieldRow label="Logo type">
              <BaseSelect
                :model-value="shell?.brand?.logoType ?? 'icon-text'"
                :options="[
                  { value: 'text', label: 'Text only' },
                  { value: 'icon', label: 'Icon only' },
                  { value: 'icon-text', label: 'Icon + Text' },
                  { value: 'image', label: 'Image' },
                ]"
                @update:model-value="saveBrand({ logoType: $event as any })"
              />
            </FieldRow>
            <FieldRow label="Icon">
              <BaseInput
                :model-value="shell?.brand?.icon ?? ''"
                placeholder="e.g. HomeIcon"
                @update:model-value="saveBrand({ icon: $event })"
              />
            </FieldRow>
            <FieldRow label="Favicon">
              <BaseInput
                :model-value="shell?.brand?.faviconUrl ?? ''"
                placeholder="/favicon.ico"
                @update:model-value="saveBrand({ faviconUrl: $event })"
              />
            </FieldRow>
          </FieldGroup>
        </div>
      </template>

      <!-- Nav items section -->
      <template v-else-if="activeSection === 'nav-items'">
        <SectionHeader title="Nav items" />
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-md">
          <FieldGroup label="Sidebar">
            <div class="flex flex-col gap-2">
              <NavItemRow
                v-for="item in sidebarItems"
                :key="item.id"
                :icon="HomeIcon"
                :label="item.label"
                :target="item.targetViewId ?? 'unlinked'"
                target-variant="view"
                @edit="() => {}"
                @remove="removeNavItem(item.id, 'sidebar')"
              />

              <div v-if="addingTo === 'sidebar'" class="flex gap-2 mt-1">
                <input
                  v-model="newItemLabel"
                  autofocus
                  placeholder="Label..."
                  class="flex-1 bg-neutral-800 border border-white/[0.12] rounded-md px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
                  @keydown.enter="commitAddItem('sidebar')"
                  @keydown.escape="addingTo = null"
                />
                <input
                  v-model="newItemIcon"
                  placeholder="Icon..."
                  class="w-24 bg-neutral-800 border border-white/[0.12] rounded-md px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
                  @keydown.enter="commitAddItem('sidebar')"
                />
              </div>

              <button
                class="mt-1 w-full border border-dashed border-white/[0.07] rounded-md py-1.5 text-xs text-neutral-600 hover:text-neutral-400 hover:border-white/[0.12] transition-colors cursor-pointer flex items-center justify-center gap-1"
                @click="addingTo = 'sidebar'"
              >
                <PlusIcon class="size-3" /> Add sidebar item
              </button>
            </div>
          </FieldGroup>

          <FieldGroup label="Top bar">
            <div class="flex flex-col gap-2">
              <NavItemRow
                v-for="item in topBarItems"
                :key="item.id"
                :icon="HomeIcon"
                :label="item.label"
                :target="item.targetViewId ?? 'unlinked'"
                target-variant="view"
                @edit="() => {}"
                @remove="removeNavItem(item.id, 'topbar')"
              />

              <div v-if="addingTo === 'topbar'" class="flex gap-2 mt-1">
                <input
                  v-model="newItemLabel"
                  autofocus
                  placeholder="Label..."
                  class="flex-1 bg-neutral-800 border border-white/[0.12] rounded-md px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
                  @keydown.enter="commitAddItem('topbar')"
                  @keydown.escape="addingTo = null"
                />
                <input
                  v-model="newItemIcon"
                  placeholder="Icon..."
                  class="w-24 bg-neutral-800 border border-white/[0.12] rounded-md px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
                  @keydown.enter="commitAddItem('topbar')"
                />
              </div>

              <button
                class="mt-1 w-full border border-dashed border-white/[0.07] rounded-md py-1.5 text-xs text-neutral-600 hover:text-neutral-400 hover:border-white/[0.12] transition-colors cursor-pointer flex items-center justify-center gap-1"
                @click="addingTo = 'topbar'"
              >
                <PlusIcon class="size-3" /> Add top bar item
              </button>
            </div>
          </FieldGroup>
        </div>
      </template>

      <!-- User menu section -->
      <template v-else-if="activeSection === 'user-menu'">
        <SectionHeader title="User menu" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Avatar">
            <FieldRow label="Show avatar">
              <BaseToggle
                :model-value="shell?.userMenu?.showAvatar ?? true"
                size="sm"
                @update:model-value="saveUserMenu({ showAvatar: $event })"
              />
            </FieldRow>
            <FieldRow label="Name binding">
              <BaseInput
                :model-value="shell?.userMenu?.nameBinding ?? 'user.name'"
                :mono="true"
                @update:model-value="saveUserMenu({ nameBinding: $event })"
              />
            </FieldRow>
            <FieldRow label="Email binding">
              <BaseInput
                :model-value="shell?.userMenu?.emailBinding ?? 'user.email'"
                :mono="true"
                @update:model-value="saveUserMenu({ emailBinding: $event })"
              />
            </FieldRow>
          </FieldGroup>
        </div>
      </template>

      <!-- Global elements section -->
      <template v-else>
        <SectionHeader title="Global elements" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Components">
            <div class="flex flex-col gap-2">
              <NavItemRow :icon="MagnifyingGlassIcon" label="Command palette" target="⌘K" target-variant="action" @edit="() => {}" @remove="() => {}" />
              <NavItemRow :icon="BellIcon" label="Toast notifications" target="component" target-variant="component" @edit="() => {}" @remove="() => {}" />
            </div>
          </FieldGroup>
        </div>
      </template>

    </div>
  </div>
</template>
