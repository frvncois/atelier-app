<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SidebarPanel, SectionHeader, BaseButton, BaseBadge, BaseInput, BaseSelect, BaseToggle, BaseModal, SchemaItem, DataTable, ColorSwatch } from '@/components/ui'
import { PlusIcon, TrashIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'
import { useProjectStore } from '@/stores/projects'
import { useEditorStore } from '@/stores/editor'
import { useHistory } from '@/composables/useHistory'
import { createSchema, createAction } from '@/utils/factories'
import { generateId } from '@/utils/id'
import type { FieldType, ActionType, ActionDefinition, SchemaField } from '@/types'

const projectStore = useProjectStore()
const editorStore = useEditorStore()
const { snapshot } = useHistory()

// ─── State ────────────────────────────────────────────────────
const schemas = computed(() => projectStore.activeProject?.schemas ?? [])
const actions = computed(() => projectStore.activeProject?.actions ?? [])
const activeSchemaId = computed(() => editorStore.activeSchemaId)
const activeSchema = computed(() =>
  schemas.value.find(s => s.id === activeSchemaId.value) ?? schemas.value[0] ?? null
)
const activeFields = computed(() => activeSchema.value?.fields ?? [])

// ─── Schema add state ─────────────────────────────────────────
const addingSchema = ref(false)
const newSchemaName = ref('')
const newSchemaColor = ref('bg-sky-400')
const schemaColorOptions = ['bg-sky-400', 'bg-violet-400', 'bg-lime-400', 'bg-amber-400', 'bg-rose-400', 'bg-teal-400', 'bg-orange-400', 'bg-pink-400']
const schemaColorHexMap: Record<string, string> = {
  'bg-sky-400': '#38bdf8',
  'bg-violet-400': '#a78bfa',
  'bg-lime-400': '#a3e635',
  'bg-amber-400': '#fbbf24',
  'bg-rose-400': '#fb7185',
  'bg-teal-400': '#2dd4bf',
  'bg-orange-400': '#fb923c',
  'bg-pink-400': '#f472b6',
}

// ─── Delete schema state ──────────────────────────────────────
const deleteSchemaId = ref<string | null>(null)

// ─── Field add/edit state ─────────────────────────────────────
const fieldFormOpen = ref(false)
const editingFieldId = ref<string | null>(null)
const fieldForm = ref<{ name: string; type: FieldType; description: string; required: boolean }>({
  name: '',
  type: 'string',
  description: '',
  required: false,
})

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
]

// ─── Action modal state ───────────────────────────────────────
const actionModalOpen = ref(false)
const editingActionId = ref<string | null>(null)
const actionForm = ref<{ name: string; type: ActionType; config: Record<string, string> }>({
  name: '',
  type: 'router.push',
  config: {},
})

const actionTypeOptions: { value: ActionType; label: string }[] = [
  { value: 'router.push', label: 'router.push' },
  { value: 'router.back', label: 'router.back' },
  { value: 'dialog.open', label: 'dialog.open' },
  { value: 'dialog.close', label: 'dialog.close' },
  { value: 'api.call', label: 'api.call' },
  { value: 'state.set', label: 'state.set' },
  { value: 'emit', label: 'emit' },
]

// ─── Mount ────────────────────────────────────────────────────
onMounted(() => {
  if (!editorStore.activeSchemaId && schemas.value.length > 0) {
    editorStore.setActiveSchema(schemas.value[0]?.id ?? null)
  }
})

// ─── Schema CRUD ──────────────────────────────────────────────
function commitAddSchema() {
  if (!newSchemaName.value.trim() || !projectStore.activeProject) return
  snapshot()
  const schema = createSchema(newSchemaName.value.trim(), newSchemaColor.value)
  projectStore.updateProject(projectStore.activeProject.id, {
    schemas: [...projectStore.activeProject.schemas, schema],
  })
  editorStore.setActiveSchema(schema.id)
  addingSchema.value = false
  newSchemaName.value = ''
  newSchemaColor.value = 'bg-sky-400'
}

function executeDeleteSchema() {
  if (!deleteSchemaId.value || !projectStore.activeProject) return
  snapshot()
  const updated = projectStore.activeProject.schemas.filter(s => s.id !== deleteSchemaId.value)
  projectStore.updateProject(projectStore.activeProject.id, { schemas: updated })
  if (editorStore.activeSchemaId === deleteSchemaId.value) {
    editorStore.setActiveSchema(updated[0]?.id ?? null)
  }
  deleteSchemaId.value = null
}

// ─── Field CRUD ───────────────────────────────────────────────
function openAddField() {
  editingFieldId.value = null
  fieldForm.value = { name: '', type: 'string', description: '', required: false }
  fieldFormOpen.value = true
}

function openEditField(field: SchemaField) {
  editingFieldId.value = field.id
  fieldForm.value = { name: field.name, type: field.type, description: field.description, required: field.required }
  fieldFormOpen.value = true
}

function commitField() {
  if (!fieldForm.value.name.trim() || !projectStore.activeProject || !activeSchema.value) return
  snapshot()

  const project = projectStore.activeProject
  if (editingFieldId.value) {
    // Edit existing
    const updatedSchemas = project.schemas.map(s =>
      s.id === activeSchema.value!.id
        ? {
            ...s,
            fields: s.fields.map(f =>
              f.id === editingFieldId.value
                ? { ...f, ...fieldForm.value }
                : f
            ),
          }
        : s
    )
    projectStore.updateProject(project.id, { schemas: updatedSchemas })
  } else {
    // Add new
    const newField: SchemaField = { id: generateId(), ...fieldForm.value }
    const updatedSchemas = project.schemas.map(s =>
      s.id === activeSchema.value!.id
        ? { ...s, fields: [...s.fields, newField] }
        : s
    )
    projectStore.updateProject(project.id, { schemas: updatedSchemas })
  }

  fieldFormOpen.value = false
}

function deleteField(fieldId: string) {
  if (!projectStore.activeProject || !activeSchema.value) return
  snapshot()
  const project = projectStore.activeProject
  const updatedSchemas = project.schemas.map(s =>
    s.id === activeSchema.value!.id
      ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
      : s
  )
  projectStore.updateProject(project.id, { schemas: updatedSchemas })
}

// ─── Action CRUD ──────────────────────────────────────────────
function openAddAction() {
  editingActionId.value = null
  actionForm.value = { name: 'New action', type: 'router.push', config: {} }
  actionModalOpen.value = true
}

function openEditAction(action: ActionDefinition) {
  editingActionId.value = action.id
  actionForm.value = {
    name: action.name,
    type: action.type,
    config: Object.fromEntries(Object.entries(action.config).map(([k, v]) => [k, String(v)])),
  }
  actionModalOpen.value = true
}

function commitAction() {
  if (!actionForm.value.name.trim() || !projectStore.activeProject) return
  snapshot()
  const project = projectStore.activeProject

  if (editingActionId.value) {
    const updatedActions = project.actions.map(a =>
      a.id === editingActionId.value
        ? { ...a, name: actionForm.value.name, type: actionForm.value.type, config: actionForm.value.config }
        : a
    )
    projectStore.updateProject(project.id, { actions: updatedActions })
  } else {
    const action: ActionDefinition = {
      id: generateId(),
      name: actionForm.value.name,
      type: actionForm.value.type,
      config: actionForm.value.config,
    }
    projectStore.updateProject(project.id, { actions: [...project.actions, action] })
  }

  actionModalOpen.value = false
}

function deleteAction(actionId: string) {
  if (!projectStore.activeProject) return
  snapshot()
  const updated = projectStore.activeProject.actions.filter(a => a.id !== actionId)
  projectStore.updateProject(projectStore.activeProject.id, { actions: updated })
}

// Dynamic config field label for the action type
const actionConfigKey = computed(() => {
  switch (actionForm.value.type) {
    case 'router.push': return 'path'
    case 'api.call': return 'endpoint'
    case 'dialog.open': return 'targetViewId'
    case 'state.set': return 'key'
    case 'emit': return 'event'
    default: return null
  }
})
</script>

<template>
  <div class="flex flex-1 overflow-hidden">

    <!-- Left: schema list -->
    <SidebarPanel width="w-[175px]">
      <template #header>
        <div class="px-3 py-2 text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Schemas</div>
      </template>

      <div class="p-2 flex flex-col gap-0.5">
        <div v-for="schema in schemas" :key="schema.id" class="group relative">
          <SchemaItem
            :name="schema.name"
            :color="schema.color"
            :active="activeSchemaId === schema.id"
            @click="editorStore.setActiveSchema(schema.id)"
          />
          <button
            @click.stop="deleteSchemaId = schema.id"
            class="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 text-neutral-600 hover:text-red-400 transition-all cursor-pointer"
          >
            <XMarkIcon class="size-3" />
          </button>
        </div>

        <!-- Inline add schema form -->
        <div v-if="addingSchema" class="mt-1 px-1 flex flex-col gap-2 pb-2 border-t border-white/[0.07] pt-2">
          <input
            v-model="newSchemaName"
            autofocus
            placeholder="Schema name..."
            class="w-full bg-neutral-800 border border-white/[0.07] rounded px-2 py-1 text-xs text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-lime-400/40"
            @keydown.enter="commitAddSchema"
            @keydown.escape="addingSchema = false"
          />
          <div class="flex flex-wrap gap-1">
            <div
              v-for="c in schemaColorOptions"
              :key="c"
              class="w-4 h-4 rounded-full cursor-pointer border-2 transition-all"
              :class="[c, newSchemaColor === c ? 'border-white' : 'border-transparent']"
              @click="newSchemaColor = c"
            />
          </div>
          <div class="flex gap-1">
            <button @click="commitAddSchema" class="flex-1 text-[10px] bg-lime-400/10 text-lime-600 rounded px-2 py-1 hover:bg-lime-400/20 transition-colors cursor-pointer">Add</button>
            <button @click="addingSchema = false" class="text-[10px] text-neutral-500 hover:text-neutral-300 px-2 py-1 cursor-pointer">Cancel</button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="p-2">
          <BaseButton label="Add schema" variant="ghost" size="xs" :icon-before="PlusIcon" class="w-full" @click="addingSchema = true" />
        </div>
      </template>
    </SidebarPanel>

    <!-- Center: field table -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <SectionHeader :title="activeSchema?.name ?? 'No schema'">
        <template #actions>
          <BaseBadge :label="`${activeFields.length} fields`" variant="default" size="sm" />
          <BaseButton label="Add field" variant="outline" size="sm" :icon-before="PlusIcon" @click="openAddField" />
        </template>
      </SectionHeader>

      <!-- Field form (slide-down above table) -->
      <div v-if="fieldFormOpen" class="border-b border-white/[0.07] bg-neutral-900 p-4 flex flex-col gap-3">
        <p class="text-xs font-medium text-neutral-300">{{ editingFieldId ? 'Edit field' : 'Add field' }}</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-neutral-500 uppercase tracking-wide block mb-1">Name</label>
            <input
              v-model="fieldForm.name"
              placeholder="field_name"
              class="w-full bg-neutral-800 border border-white/[0.07] rounded-md px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/[0.2] font-mono"
            />
          </div>
          <div>
            <label class="text-[10px] text-neutral-500 uppercase tracking-wide block mb-1">Type</label>
            <select
              v-model="fieldForm.type"
              class="w-full bg-neutral-800 border border-white/[0.07] rounded-md px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-white/[0.2] appearance-none cursor-pointer"
            >
              <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="text-[10px] text-neutral-500 uppercase tracking-wide block mb-1">Description</label>
            <input
              v-model="fieldForm.description"
              placeholder="What this field represents..."
              class="w-full bg-neutral-800 border border-white/[0.07] rounded-md px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-white/[0.2]"
            />
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="fieldForm.required" id="field-required" class="accent-lime-400" />
            <label for="field-required" class="text-xs text-neutral-400 cursor-pointer">Required</label>
          </div>
        </div>
        <div class="flex gap-2">
          <BaseButton :label="editingFieldId ? 'Save field' : 'Add field'" size="sm" @click="commitField" />
          <BaseButton label="Cancel" variant="ghost" size="sm" @click="fieldFormOpen = false" />
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <!-- Custom table with edit/delete per row -->
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Field</th>
              <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Type</th>
              <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0">Description</th>
              <th class="text-[10px] font-medium text-neutral-600 uppercase tracking-wider px-4 py-2 text-left border-b border-white/[0.07] bg-neutral-900 sticky top-0 w-16"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in activeFields" :key="field.id" class="hover:bg-neutral-900 group transition-colors">
              <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
                <span class="font-mono text-xs text-lime-600">{{ field.name }}</span>
                <span v-if="field.required" class="ml-1 text-[10px] text-red-400">*</span>
              </td>
              <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
                <BaseBadge :label="field.type" :variant="({string:'blue',number:'purple',boolean:'amber',date:'accent',array:'red',object:'default'} as any)[field.type]" size="sm" mono />
              </td>
              <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
                <span class="text-xs text-neutral-500">{{ field.description }}</span>
              </td>
              <td class="px-4 py-2.5 border-b border-white/[0.07] align-middle">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEditField(field)" class="p-1 text-neutral-500 hover:text-neutral-100 cursor-pointer transition-colors">
                    <PencilSquareIcon class="size-3.5" />
                  </button>
                  <button @click="deleteField(field.id)" class="p-1 text-neutral-500 hover:text-red-400 cursor-pointer transition-colors">
                    <TrashIcon class="size-3.5" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="activeFields.length === 0">
              <td colspan="4" class="px-4 py-6 text-center text-xs text-neutral-600">
                No fields yet — click "Add field" to get started
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Right: actions panel -->
    <div class="w-[220px] shrink-0 border-l border-white/[0.07] flex flex-col overflow-hidden">
      <div class="px-4 py-3 border-b border-white/[0.07] shrink-0 flex items-center justify-between">
        <p class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Actions defined</p>
        <BaseBadge :label="`${actions.length}`" variant="default" size="sm" />
      </div>

      <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <div
          v-for="(action, index) in actions"
          :key="action.id"
          class="bg-neutral-800 border border-white/[0.07] rounded-md p-2.5 group cursor-pointer hover:border-white/[0.12] transition-colors"
          @click="openEditAction(action)"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-[10px] text-neutral-600">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="font-mono text-xs text-sky-400 truncate max-w-[100px]">{{ action.type }}</span>
            </div>
            <button
              @click.stop="deleteAction(action.id)"
              class="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-600 hover:text-red-400 cursor-pointer transition-all"
            >
              <XMarkIcon class="size-3" />
            </button>
          </div>
          <p class="text-[10px] text-neutral-500 truncate">{{ action.name }}</p>
          <p v-if="Object.values(action.config)[0]" class="font-mono text-[10px] text-neutral-600 truncate mt-0.5">
            {{ Object.values(action.config)[0] }}
          </p>
        </div>

        <div v-if="actions.length === 0" class="text-center py-4">
          <p class="text-xs text-neutral-600">No actions defined</p>
        </div>
      </div>

      <div class="p-3 border-t border-white/[0.07] shrink-0">
        <BaseButton label="New action" variant="outline" size="xs" :icon-before="PlusIcon" class="w-full" @click="openAddAction" />
      </div>
    </div>

    <!-- Delete schema confirmation -->
    <BaseModal :open="!!deleteSchemaId" title="Delete schema" size="sm" @close="deleteSchemaId = null">
      <div class="p-5">
        <p class="text-sm text-neutral-300">
          Delete "{{ schemas.find(s => s.id === deleteSchemaId)?.name }}"? All fields will be lost.
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" label="Cancel" @click="deleteSchemaId = null" />
          <BaseButton variant="danger" label="Delete schema" @click="executeDeleteSchema" />
        </div>
      </template>
    </BaseModal>

    <!-- Action add/edit modal -->
    <BaseModal :open="actionModalOpen" :title="editingActionId ? 'Edit action' : 'New action'" size="sm" @close="actionModalOpen = false">
      <div class="p-5 flex flex-col gap-4">
        <BaseInput v-model="actionForm.name" label="Name" placeholder="Action name" />
        <BaseSelect
          v-model="actionForm.type"
          label="Type"
          :options="actionTypeOptions"
        />
        <BaseInput
          v-if="actionConfigKey"
          :model-value="actionForm.config[actionConfigKey] ?? ''"
          :label="actionConfigKey"
          :placeholder="`Enter ${actionConfigKey}...`"
          :mono="true"
          @update:model-value="actionForm.config[actionConfigKey!] = $event"
        />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" label="Cancel" @click="actionModalOpen = false" />
          <BaseButton :label="editingActionId ? 'Save action' : 'Add action'" @click="commitAction" />
        </div>
      </template>
    </BaseModal>

  </div>
</template>
