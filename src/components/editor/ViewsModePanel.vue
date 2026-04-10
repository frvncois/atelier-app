<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { SidebarPanel, RightPanel, SectionHeader, PropRow, BaseButton, BaseInput, BaseSelect, BaseToggle, BaseBadge, BaseModal, ViewItem, RowBlock, CompCard } from '@/components/ui'
import { PlusIcon, TrashIcon, DocumentDuplicateIcon, XMarkIcon, PencilSquareIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useHistory } from '@/composables/useHistory'
import { useDragSort } from '@/composables/useDragSort'
import { createView, createRow, createComponent } from '@/utils/factories'
import { patchComponentInViews, patchRowInViews, removeComponentFromViews, removeRowFromViews } from '@/utils/patch'
import { generateId } from '@/utils/id'
import { deepClone } from '@/utils/clone'
import ComponentPalette from './ComponentPalette.vue'
import type { ComponentType, ComponentSpec, Row, ActionTrigger, ActionType } from '@/types'

const projectStore = useProjectStore()
const editorStore = useEditorStore()
const { snapshot } = useHistory()

// ─── State ────────────────────────────────────────────────────
const activeTab = ref<'props' | 'data' | 'actions'>('props')
const paletteOpen = ref(false)
const paletteTargetRowId = ref<string | null>(null)
const addingView = ref(false)
const newViewName = ref('')

// ─── Computed ─────────────────────────────────────────────────
const project = computed(() => projectStore.activeProject)
const views = computed(() => [...(project.value?.views ?? [])].sort((a, b) => a.order - b.order))
const activeViewId = computed(() => editorStore.activeViewId)
const activeView = computed(() => editorStore.activeView)
const rows = computed(() => [...(activeView.value?.rows ?? [])].sort((a, b) => a.order - b.order))
const selectedComponentId = computed(() => editorStore.selectedComponentId)
const selectedComponent = computed(() => editorStore.selectedComponent)
const schemas = computed(() => project.value?.schemas ?? [])

// ─── Mount ────────────────────────────────────────────────────
onMounted(() => {
  if (!editorStore.activeViewId && views.value.length > 0) {
    const firstView = views.value[0]
    if (firstView) editorStore.setActiveView(firstView.id)
  }
})

// ─── View CRUD ────────────────────────────────────────────────
function commitAddView() {
  if (!newViewName.value.trim() || !project.value) return
  snapshot()
  const view = createView(newViewName.value.trim(), project.value.views.length)
  projectStore.updateProject(project.value.id, { views: [...project.value.views, view] })
  editorStore.setActiveView(view.id)
  addingView.value = false
  newViewName.value = ''
}

// ─── View delete ──────────────────────────────────────────────
const viewToDelete = ref<string | null>(null)

function confirmDeleteView(viewId: string) {
  viewToDelete.value = viewId
}

function executeDeleteView() {
  if (!viewToDelete.value || !project.value) return
  snapshot()
  const remaining = project.value.views.filter(v => v.id !== viewToDelete.value)
  projectStore.updateProject(project.value.id, { views: remaining })
  if (editorStore.activeViewId === viewToDelete.value) {
    editorStore.setActiveView(remaining[0]?.id ?? '')
  }
  viewToDelete.value = null
}

// ─── View rename ──────────────────────────────────────────────
const renamingViewId = ref<string | null>(null)
const renameViewValue = ref('')

function startRenameView(view: { id: string; name: string }) {
  renamingViewId.value = view.id
  renameViewValue.value = view.name
}

function commitRenameView() {
  if (!renamingViewId.value || !renameViewValue.value.trim() || !project.value) {
    renamingViewId.value = null
    return
  }
  snapshot()
  const updatedViews = project.value.views.map(v =>
    v.id === renamingViewId.value ? { ...v, name: renameViewValue.value.trim() } : v
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
  renamingViewId.value = null
}

// ─── Row CRUD ─────────────────────────────────────────────────
function addRow() {
  if (!project.value || !activeView.value) return
  snapshot()
  const row = createRow('New row', rows.value.length)
  const updatedViews = project.value.views.map(v =>
    v.id === activeView.value!.id ? { ...v, rows: [...v.rows, row] } : v
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

function deleteRow(rowId: string) {
  if (!project.value || !activeView.value) return
  snapshot()
  const updatedViews = removeRowFromViews(project.value.views, activeView.value.id, rowId)
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

function toggleRowCollapsed(rowId: string) {
  if (!project.value || !activeView.value) return
  const row = activeView.value.rows.find(r => r.id === rowId)
  if (!row) return
  const updatedViews = patchRowInViews(project.value.views, activeView.value.id, rowId, {
    collapsed: !row.collapsed,
  })
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

// ─── Row rename ───────────────────────────────────────────────
const renamingRowId = ref<string | null>(null)
const renameRowValue = ref('')

function startRenameRow(row: { id: string; label: string }) {
  renamingRowId.value = row.id
  renameRowValue.value = row.label
}

function commitRenameRow() {
  if (!renamingRowId.value || !renameRowValue.value.trim() || !project.value || !activeView.value) {
    renamingRowId.value = null
    return
  }
  const updatedViews = patchRowInViews(
    project.value.views,
    activeView.value.id,
    renamingRowId.value,
    { label: renameRowValue.value.trim() }
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
  renamingRowId.value = null
}

// ─── Drag sort for rows ────────────────────────────────────────
const { onDragStart, onDragOver, onDrop, onDragEnd, dragClass } = useDragSort(rows, (reordered) => {
  if (!project.value || !activeView.value) return
  const updatedViews = project.value.views.map(v =>
    v.id === activeView.value!.id ? { ...v, rows: reordered } : v
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
})

// ─── Component CRUD ───────────────────────────────────────────
function openPalette(rowId: string) {
  paletteTargetRowId.value = rowId
  paletteOpen.value = true
}

function handleAddComponent(type: ComponentType, name: string) {
  if (!project.value || !activeView.value || !paletteTargetRowId.value) return
  snapshot()
  const targetRow = activeView.value.rows.find(r => r.id === paletteTargetRowId.value)
  if (!targetRow) return
  const comp = createComponent(type, name, targetRow.components.length)
  const updatedViews = patchRowInViews(
    project.value.views,
    activeView.value.id,
    paletteTargetRowId.value,
    { components: [...targetRow.components, comp] }
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
  editorStore.selectComponent(comp.id)
}

function deleteComponent(componentId: string) {
  if (!project.value) return
  snapshot()
  const updatedViews = removeComponentFromViews(project.value.views, componentId)
  projectStore.updateProject(project.value.id, { views: updatedViews })
  if (editorStore.selectedComponentId === componentId) {
    editorStore.selectComponent(null)
  }
}

function duplicateComponent(comp: ComponentSpec, row: Row) {
  if (!project.value || !activeView.value) return
  snapshot()
  const clone = deepClone(comp)
  clone.id = generateId()
  clone.name = `${comp.name} (copy)`
  clone.order = row.components.length
  const updatedViews = patchRowInViews(
    project.value.views,
    activeView.value.id,
    row.id,
    { components: [...row.components, clone] }
  )
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

// ─── Prop editing ─────────────────────────────────────────────
function updateProp(key: string, value: unknown) {
  if (!selectedComponent.value || !project.value) return
  snapshot()
  const updatedViews = patchComponentInViews(project.value.views, selectedComponent.value.id, {
    props: { ...selectedComponent.value.props, [key]: value },
  })
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

function updateBinding(propName: string, schemaField: string) {
  if (!selectedComponent.value || !project.value) return
  snapshot()
  const updatedViews = patchComponentInViews(project.value.views, selectedComponent.value.id, {
    bindings: { ...selectedComponent.value.bindings, [propName]: schemaField },
  })
  projectStore.updateProject(project.value.id, { views: updatedViews })
  bindingPropName.value = ''
}

function removeBinding(propName: string) {
  if (!selectedComponent.value || !project.value) return
  snapshot()
  const bindings = { ...selectedComponent.value.bindings }
  delete bindings[propName]
  const updatedViews = patchComponentInViews(project.value.views, selectedComponent.value.id, { bindings })
  projectStore.updateProject(project.value.id, { views: updatedViews })
}

// ─── All schema fields for binding picker ─────────────────────
const allSchemaFields = computed(() =>
  schemas.value.flatMap(s => s.fields.map(f => ({
    value: `${s.name}.${f.name}`,
    label: `${s.name}.${f.name}`,
    schemaName: s.name,
  })))
)

// ─── Binding prop name (Fix 7) ────────────────────────────────
const bindingPropName = ref('')

watch(selectedComponentId, () => {
  bindingPropName.value = ''
})

// ─── Actions ──────────────────────────────────────────────────
const actionTriggers: { value: ActionTrigger; label: string }[] = [
  { value: 'onClick', label: 'onClick' },
  { value: 'onSubmit', label: 'onSubmit' },
  { value: 'onChange', label: 'onChange' },
  { value: 'onMount', label: 'onMount' },
]
const actionTypes: { value: ActionType; label: string }[] = [
  { value: 'router.push', label: 'router.push' },
  { value: 'dialog.open', label: 'dialog.open' },
  { value: 'dialog.close', label: 'dialog.close' },
  { value: 'api.call', label: 'api.call' },
  { value: 'state.set', label: 'state.set' },
  { value: 'emit', label: 'emit' },
]

const expandedActionId = ref<string | null>(null)

function addAction() {
  if (!selectedComponent.value || !project.value) return
  snapshot()
  const actionDef = {
    id: generateId(),
    name: 'New action',
    type: 'router.push' as ActionType,
    config: {},
  }
  const componentAction = {
    id: generateId(),
    trigger: 'onClick' as ActionTrigger,
    actionId: actionDef.id,
  }
  const updatedViews = patchComponentInViews(project.value.views, selectedComponent.value.id, {
    actions: [...selectedComponent.value.actions, componentAction],
  })
  projectStore.updateProject(project.value.id, {
    views: updatedViews,
    actions: [...project.value.actions, actionDef],
  })
  expandedActionId.value = componentAction.id
}

function removeAction(actionId: string) {
  if (!selectedComponent.value || !project.value) return
  snapshot()
  const updatedViews = patchComponentInViews(project.value.views, selectedComponent.value.id, {
    actions: selectedComponent.value.actions.filter(a => a.id !== actionId),
  })
  projectStore.updateProject(project.value.id, {
    views: updatedViews,
    actions: project.value.actions.filter(a => a.id !== actionId),
  })
}

function updateActionDef(actionId: string, patch: { type?: ActionType; config?: Record<string, unknown> }) {
  if (!project.value) return
  const updated = project.value.actions.map(a =>
    a.id === actionId ? { ...a, ...patch } : a
  )
  projectStore.updateProject(project.value.id, { actions: updated })
}

function getActionDef(actionId: string) {
  return project.value?.actions.find(a => a.id === actionId)
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden">

    <!-- Left sidebar: views list -->
    <SidebarPanel width="w-[220px]">
      <template #header>
        <div class="px-3 py-2 flex items-center justify-between">
          <span class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Views</span>
          <button class="text-neutral-500 hover:text-neutral-100 transition-colors cursor-pointer" @click="addingView = true">
            <PlusIcon class="size-4" />
          </button>
        </div>
      </template>

      <div class="p-2 flex flex-col gap-0.5">
        <div
          v-for="view in views"
          :key="view.id"
          class="relative group/view"
        >
          <input
            v-if="renamingViewId === view.id"
            v-model="renameViewValue"
            autofocus
            class="w-full bg-neutral-800 border border-lime-400/40 rounded-md px-2 py-1 text-xs text-neutral-100 outline-none mx-1"
            @blur="commitRenameView"
            @keydown.enter="commitRenameView"
            @keydown.escape="renamingViewId = null"
          />
          <ViewItem
            v-else
            :name="view.name"
            :component-count="view.rows.reduce((acc, r) => acc + r.components.length, 0)"
            :active="activeViewId === view.id"
            @click="editorStore.setActiveView(view.id)"
            @dblclick="startRenameView(view)"
          />
          <button
            v-if="renamingViewId !== view.id"
            class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/view:opacity-100 transition-opacity p-1 text-neutral-600 hover:text-red-400 cursor-pointer"
            @click.stop="confirmDeleteView(view.id)"
          >
            <TrashIcon class="size-3" />
          </button>
        </div>

        <!-- Inline add view input -->
        <div v-if="addingView" class="px-1 pt-1">
          <input
            v-model="newViewName"
            autofocus
            placeholder="View name..."
            class="w-full bg-neutral-800 border border-white/[0.12] rounded-md px-2 py-1 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
            @keydown.enter="commitAddView"
            @keydown.escape="addingView = false; newViewName = ''"
            @blur="commitAddView"
          />
        </div>
      </div>
    </SidebarPanel>

    <!-- Center: component canvas -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <SectionHeader :title="activeView?.name ?? 'Views'" breadcrumb="Views">
        <template #actions>
          <BaseButton label="Add row" :icon-before="PlusIcon" size="sm" variant="outline" @click="addRow" />
        </template>
      </SectionHeader>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <!-- Rows -->
        <div
          v-for="row in rows"
          :key="row.id"
          :draggable="true"
          :class="dragClass(row.id)"
          @dragstart="onDragStart(row.id)"
          @dragover="(e) => onDragOver(e, row.id)"
          @drop="onDrop"
          @dragend="onDragEnd"
        >
          <!-- Row rename input -->
          <div v-if="renamingRowId === row.id" class="mb-1 px-1">
            <input
              v-model="renameRowValue"
              autofocus
              class="w-full bg-neutral-800 border border-lime-400/40 rounded-md px-2 py-1 text-xs text-neutral-100 outline-none"
              @blur="commitRenameRow"
              @keydown.enter="commitRenameRow"
              @keydown.escape="renamingRowId = null"
            />
          </div>

          <RowBlock
            v-else
            :label="row.label"
            :tag="row.tag"
            :component-count="row.components.length"
            :collapsed="row.collapsed"
            @toggle="toggleRowCollapsed(row.id)"
          >
            <template #actions>
              <button
                @click.stop="startRenameRow(row)"
                class="p-1 text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer rounded"
              >
                <PencilSquareIcon class="size-3.5" />
              </button>
              <button
                @click.stop="deleteRow(row.id)"
                class="p-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer rounded"
              >
                <TrashIcon class="size-3.5" />
              </button>
            </template>

            <!-- Components inside row -->
            <div class="group/comp relative" v-for="comp in row.components" :key="comp.id">
              <CompCard
                :type="comp.type"
                :name="comp.name"
                :preview="String(comp.props?.title ?? comp.props?.description ?? comp.name)"
                :data-tags="Object.values(comp.bindings)"
                :action-count="comp.actions.length"
                :selected="selectedComponentId === comp.id"
                @click="editorStore.selectComponent(comp.id)"
              />
              <!-- Hover overlay actions -->
              <div class="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/comp:opacity-100 transition-opacity">
                <button
                  @click.stop="duplicateComponent(comp, row)"
                  class="p-1 rounded bg-neutral-700 border border-white/[0.12] text-neutral-400 hover:text-neutral-100 cursor-pointer"
                >
                  <DocumentDuplicateIcon class="size-3" />
                </button>
                <button
                  @click.stop="deleteComponent(comp.id)"
                  class="p-1 rounded bg-neutral-700 border border-white/[0.12] text-neutral-400 hover:text-red-400 cursor-pointer"
                >
                  <XMarkIcon class="size-3" />
                </button>
              </div>
            </div>

            <!-- Add component button -->
            <button
              class="flex-1 min-w-[100px] max-w-[140px] border border-dashed border-white/[0.12] rounded-md p-2.5 flex items-center justify-center text-neutral-600 hover:text-neutral-400 hover:border-white/[0.2] transition-colors cursor-pointer"
              @click="openPalette(row.id)"
            >
              <PlusIcon class="size-4" />
            </button>
          </RowBlock>
        </div>

        <!-- Add row button -->
        <button
          class="w-full border border-dashed border-white/[0.07] rounded-xl py-3 flex items-center justify-center gap-2 text-xs text-neutral-600 hover:text-neutral-400 hover:border-white/[0.12] transition-colors cursor-pointer"
          @click="addRow"
        >
          <PlusIcon class="size-3.5" />
          Add row
        </button>
      </div>
    </div>

    <!-- Right panel -->
    <RightPanel
      :type="selectedComponent?.type"
      :title="selectedComponent?.name ?? 'Select a component'"
    >
      <template #tabs>
        <div class="flex gap-1 px-3 py-2">
          <button
            v-for="tab in ['props', 'data', 'actions'] as const"
            :key="tab"
            @click="activeTab = tab"
            class="px-3 py-1 text-xs rounded-md capitalize transition-colors cursor-pointer"
            :class="activeTab === tab ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'"
          >{{ tab }}</button>
        </div>
      </template>

      <!-- No selection state -->
      <div v-if="!selectedComponent" class="flex items-center justify-center h-32">
        <p class="text-xs text-neutral-600">Select a component</p>
      </div>

      <!-- Props tab -->
      <div v-else-if="activeTab === 'props'" class="p-3 flex flex-col gap-0">
        <PropRow v-if="'title' in selectedComponent.props" label="Title">
          <BaseInput
            :model-value="String(selectedComponent.props.title ?? '')"
            @update:model-value="updateProp('title', $event)"
          />
        </PropRow>
        <PropRow v-if="'description' in selectedComponent.props" label="Desc">
          <BaseInput
            :model-value="String(selectedComponent.props.description ?? '')"
            @update:model-value="updateProp('description', $event)"
          />
        </PropRow>
        <PropRow v-if="'variant' in selectedComponent.props" label="Variant">
          <BaseSelect
            :model-value="String(selectedComponent.props.variant ?? 'default')"
            :options="[{value:'default',label:'Default'},{value:'card',label:'Card'},{value:'inline',label:'Inline'}]"
            @update:model-value="updateProp('variant', $event)"
          />
        </PropRow>
        <PropRow v-if="'size' in selectedComponent.props" label="Size">
          <BaseSelect
            :model-value="String(selectedComponent.props.size ?? 'md')"
            :options="[{value:'sm',label:'SM'},{value:'md',label:'MD'},{value:'lg',label:'LG'}]"
            @update:model-value="updateProp('size', $event)"
          />
        </PropRow>
        <PropRow v-if="'paginated' in selectedComponent.props" label="Paginated">
          <BaseToggle
            :model-value="Boolean(selectedComponent.props.paginated)"
            size="sm"
            @update:model-value="updateProp('paginated', $event)"
          />
        </PropRow>
        <p v-if="Object.keys(selectedComponent.props).length === 0" class="text-xs text-neutral-600 px-2 py-3">
          No configurable props for {{ selectedComponent.type }}
        </p>
      </div>

      <!-- Data tab -->
      <div v-else-if="activeTab === 'data'" class="p-3 flex flex-col gap-0">
        <p class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest px-1 mb-2">Bindings</p>

        <!-- Existing bindings -->
        <PropRow
          v-for="(fieldPath, propName) in selectedComponent.bindings"
          :key="String(propName)"
          :label="String(propName)"
        >
          <div class="flex items-center gap-1">
            <span class="font-mono text-[10px] text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20 cursor-pointer">
              {{ fieldPath }}
            </span>
            <button @click="removeBinding(String(propName))" class="text-neutral-600 hover:text-red-400 cursor-pointer">
              <XMarkIcon class="size-3" />
            </button>
          </div>
        </PropRow>

        <!-- Add binding (two-step) -->
        <div class="mt-3 px-1 flex flex-col gap-2">
          <p class="text-[10px] text-neutral-600">Add binding</p>
          <BaseInput
            v-model="bindingPropName"
            placeholder="Prop name e.g. value, title"
            mono
          />
          <BaseSelect
            v-if="bindingPropName.trim()"
            model-value=""
            :options="[{ value: '', label: 'Select schema field...' }, ...allSchemaFields]"
            @update:model-value="(v) => {
              if (v && bindingPropName.trim()) {
                updateBinding(bindingPropName.trim(), v)
                bindingPropName = ''
              }
            }"
          />
          <p v-if="allSchemaFields.length === 0" class="text-[10px] text-neutral-600 italic">
            No schemas defined. Add schemas in the Data mode.
          </p>
        </div>
      </div>

      <!-- Actions tab -->
      <div v-else class="p-3 flex flex-col gap-2">
        <!-- Existing actions -->
        <div
          v-for="compAction in selectedComponent.actions"
          :key="compAction.id"
          class="bg-neutral-800 border border-white/[0.07] rounded-md overflow-hidden mb-2"
        >
          <!-- Header row: click to expand -->
          <div
            class="flex items-center justify-between px-2.5 py-2 cursor-pointer"
            @click="expandedActionId = expandedActionId === compAction.id ? null : compAction.id"
          >
            <div class="flex items-center gap-2">
              <BaseBadge :label="compAction.trigger" variant="default" size="sm" mono />
              <span class="text-[10px] text-neutral-500">→</span>
              <BaseBadge
                :label="getActionDef(compAction.actionId)?.type ?? 'unknown'"
                variant="purple"
                size="sm"
                mono
              />
            </div>
            <div class="flex items-center gap-1">
              <ChevronDownIcon
                class="size-3 text-neutral-600 transition-transform"
                :class="expandedActionId === compAction.id ? 'rotate-180' : ''"
              />
              <button @click.stop="removeAction(compAction.actionId)" class="text-neutral-600 hover:text-red-400 cursor-pointer p-0.5">
                <XMarkIcon class="size-3" />
              </button>
            </div>
          </div>

          <!-- Expanded edit form -->
          <div v-if="expandedActionId === compAction.id" class="px-2.5 pb-2.5 flex flex-col gap-2 border-t border-white/[0.07] pt-2">
            <!-- Trigger -->
            <PropRow label="Trigger">
              <BaseSelect
                :model-value="compAction.trigger"
                :options="actionTriggers"
                @update:model-value="(v) => {
                  if (!project || !selectedComponent) return
                  const updated = patchComponentInViews(project.views, selectedComponent.id, {
                    actions: selectedComponent.actions.map(a =>
                      a.id === compAction.id ? { ...a, trigger: v as ActionTrigger } : a
                    )
                  })
                  projectStore.updateProject(project.id, { views: updated })
                }"
              />
            </PropRow>

            <!-- Action type -->
            <PropRow label="Type">
              <BaseSelect
                :model-value="getActionDef(compAction.actionId)?.type ?? 'router.push'"
                :options="actionTypes"
                @update:model-value="(v) => updateActionDef(compAction.actionId, { type: v as ActionType, config: {} })"
              />
            </PropRow>

            <!-- Dynamic config: router.push -->
            <template v-if="getActionDef(compAction.actionId)?.type === 'router.push'">
              <PropRow label="Path">
                <BaseInput
                  :model-value="String(getActionDef(compAction.actionId)?.config?.path ?? '')"
                  placeholder="/dashboard"
                  mono
                  @update:model-value="(v) => updateActionDef(compAction.actionId, { config: { path: v } })"
                />
              </PropRow>
            </template>

            <!-- Dynamic config: api.call -->
            <template v-else-if="getActionDef(compAction.actionId)?.type === 'api.call'">
              <PropRow label="Method">
                <BaseSelect
                  :model-value="String(getActionDef(compAction.actionId)?.config?.method ?? 'GET')"
                  :options="[{value:'GET',label:'GET'},{value:'POST',label:'POST'},{value:'PUT',label:'PUT'},{value:'PATCH',label:'PATCH'},{value:'DELETE',label:'DELETE'}]"
                  @update:model-value="(v) => updateActionDef(compAction.actionId, { config: { ...getActionDef(compAction.actionId)?.config, method: v } })"
                />
              </PropRow>
              <PropRow label="Endpoint">
                <BaseInput
                  :model-value="String(getActionDef(compAction.actionId)?.config?.endpoint ?? '')"
                  placeholder="/api/resource/:id"
                  mono
                  @update:model-value="(v) => updateActionDef(compAction.actionId, { config: { ...getActionDef(compAction.actionId)?.config, endpoint: v } })"
                />
              </PropRow>
            </template>

            <!-- Dynamic config: dialog.open -->
            <template v-else-if="getActionDef(compAction.actionId)?.type === 'dialog.open'">
              <PropRow label="Target">
                <BaseSelect
                  :model-value="String(getActionDef(compAction.actionId)?.config?.viewId ?? '')"
                  :options="[{value:'',label:'Select view...'}, ...views.map(v => ({value: v.id, label: v.name}))]"
                  @update:model-value="(v) => updateActionDef(compAction.actionId, { config: { viewId: v } })"
                />
              </PropRow>
            </template>

            <!-- Dynamic config: emit -->
            <template v-else-if="getActionDef(compAction.actionId)?.type === 'emit'">
              <PropRow label="Event">
                <BaseInput
                  :model-value="String(getActionDef(compAction.actionId)?.config?.event ?? '')"
                  placeholder="event-name"
                  mono
                  @update:model-value="(v) => updateActionDef(compAction.actionId, { config: { event: v } })"
                />
              </PropRow>
            </template>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="selectedComponent.actions.length === 0" class="text-center py-4">
          <p class="text-xs text-neutral-600 mb-3">No actions defined</p>
        </div>

        <BaseButton label="Add action" variant="outline" size="xs" :icon-before="PlusIcon" @click="addAction" />
      </div>
    </RightPanel>

    <!-- Component palette modal -->
    <ComponentPalette
      :open="paletteOpen"
      :target-row-id="paletteTargetRowId"
      @close="paletteOpen = false"
      @add="handleAddComponent"
    />

    <!-- Delete view confirmation modal -->
    <BaseModal
      :open="viewToDelete !== null"
      title="Delete view"
      size="sm"
      @close="viewToDelete = null"
    >
      <div class="px-5 py-4">
        <p class="text-sm text-neutral-300 mb-1">
          Delete <span class="font-medium text-neutral-100">{{ views.find(v => v.id === viewToDelete)?.name }}</span>?
        </p>
        <p class="text-xs text-neutral-600">All rows and components inside will be removed. This cannot be undone.</p>
      </div>
      <template #footer>
        <div class="flex gap-2 px-5 pb-4">
          <BaseButton label="Cancel" variant="ghost" size="sm" class="flex-1" @click="viewToDelete = null" />
          <BaseButton label="Delete" variant="danger" size="sm" class="flex-1" @click="executeDeleteView" />
        </div>
      </template>
    </BaseModal>
  </div>
</template>
