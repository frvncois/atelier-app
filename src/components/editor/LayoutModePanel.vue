<script setup lang="ts">
import { computed } from 'vue'
import { SidebarPanel, SectionHeader, FieldGroup, FieldRow, BaseButton, BaseInput, BaseSelect, BaseToggle, ShellSectionItem, NavItemRow, PatternCard } from '@/components/ui'
import { Squares2X2Icon, SparklesIcon, Bars3Icon, UserCircleIcon, BoltIcon, PlusIcon, HomeIcon, UsersIcon, Cog6ToothIcon, MagnifyingGlassIcon, BellIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useHistory } from '@/composables/useHistory'
import type { NavPattern } from '@/types'

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

const sidebarNavItems = [
  { label: 'Dashboard', target: 'DashboardView', targetVariant: 'view' as const, icon: HomeIcon },
  { label: 'Users', target: 'UsersView', targetVariant: 'view' as const, icon: UsersIcon },
  { label: 'Settings', target: 'SettingsView', targetVariant: 'view' as const, icon: Cog6ToothIcon },
]
const topNavItems = [
  { label: 'Search', target: 'searchAction', targetVariant: 'action' as const, icon: MagnifyingGlassIcon },
  { label: 'Notifications', target: 'NotificationCenter', targetVariant: 'component' as const, icon: BellIcon },
]

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
            <FieldRow label="App name"><BaseInput :model-value="shell?.brand?.appName ?? ''" /></FieldRow>
            <FieldRow label="Logo type">
              <BaseSelect :model-value="shell?.brand?.logoType ?? 'icon-text'" :options="[{value:'text',label:'Text only'},{value:'icon',label:'Icon only'},{value:'icon-text',label:'Icon + Text'}]" />
            </FieldRow>
            <FieldRow label="Icon"><BaseInput :model-value="shell?.brand?.icon ?? ''" placeholder="Letter or emoji" /></FieldRow>
            <FieldRow label="Favicon"><BaseInput :model-value="shell?.brand?.faviconUrl ?? ''" placeholder="/favicon.ico" /></FieldRow>
          </FieldGroup>
        </div>
      </template>

      <!-- Nav items section -->
      <template v-else-if="activeSection === 'nav-items'">
        <SectionHeader title="Nav items">
          <template #actions>
            <BaseButton label="Add item" :icon-before="PlusIcon" size="sm" variant="outline" />
          </template>
        </SectionHeader>
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-md">
          <FieldGroup label="Sidebar">
            <div class="flex flex-col gap-2">
              <NavItemRow v-for="item in sidebarNavItems" :key="item.label" :icon="item.icon" :label="item.label" :target="item.target" :target-variant="item.targetVariant" />
            </div>
          </FieldGroup>
          <FieldGroup label="Top bar">
            <div class="flex flex-col gap-2">
              <NavItemRow v-for="item in topNavItems" :key="item.label" :icon="item.icon" :label="item.label" :target="item.target" :target-variant="item.targetVariant" />
            </div>
          </FieldGroup>
        </div>
      </template>

      <!-- User menu section -->
      <template v-else-if="activeSection === 'user-menu'">
        <SectionHeader title="User menu" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Avatar">
            <FieldRow label="Show avatar"><BaseToggle :model-value="shell?.userMenu?.showAvatar ?? true" size="sm" /></FieldRow>
            <FieldRow label="Name binding"><BaseInput :model-value="shell?.userMenu?.nameBinding ?? 'user.name'" :mono="true" /></FieldRow>
            <FieldRow label="Email binding"><BaseInput :model-value="shell?.userMenu?.emailBinding ?? 'user.email'" :mono="true" /></FieldRow>
          </FieldGroup>
        </div>
      </template>

      <!-- Global elements section -->
      <template v-else>
        <SectionHeader title="Global elements" />
        <div class="flex-1 overflow-y-auto p-6 max-w-md">
          <FieldGroup label="Components">
            <div class="flex flex-col gap-2">
              <NavItemRow :icon="MagnifyingGlassIcon" label="Command palette" target="⌘K" target-variant="action" />
              <NavItemRow :icon="BellIcon" label="Toast notifications" target="component" target-variant="component" />
            </div>
          </FieldGroup>
        </div>
      </template>

    </div>
  </div>
</template>
