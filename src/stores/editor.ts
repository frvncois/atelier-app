import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EditorMode, Project, ComponentSpec, Row, View } from '@/types'
import { deepClone } from '@/utils/clone'
import { useProjectStore } from './projects'

const MAX_HISTORY = 50

export const useEditorStore = defineStore('editor', () => {
  const activeMode = ref<EditorMode>('layout')
  const activeShellSection = ref<string>('nav-pattern')
  const activeViewId = ref<string | null>(null)
  const selectedRowId = ref<string | null>(null)
  const selectedComponentId = ref<string | null>(null)
  const activeTokenSection = ref<string>('colors')
  const activeSchemaId = ref<string | null>(null)
  const exportOpen = ref<boolean>(false)

  // Undo/redo history — array of deep-cloned Project snapshots
  const history = ref<Project[]>([])
  const historyIndex = ref<number>(-1)

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const activeView = computed((): View | undefined => {
    const projectStore = useProjectStore()
    return projectStore.activeProject?.views.find(v => v.id === activeViewId.value)
  })

  const selectedRow = computed((): Row | undefined => {
    return activeView.value?.rows.find(r => r.id === selectedRowId.value)
  })

  const selectedComponent = computed((): ComponentSpec | undefined => {
    if (!selectedComponentId.value) return undefined
    for (const view of (useProjectStore().activeProject?.views ?? [])) {
      for (const row of view.rows) {
        const comp = row.components.find(c => c.id === selectedComponentId.value)
        if (comp) return comp
      }
    }
    return undefined
  })

  function setMode(mode: EditorMode): void {
    activeMode.value = mode
  }

  function setShellSection(section: string): void {
    activeShellSection.value = section
  }

  function setActiveView(viewId: string): void {
    activeViewId.value = viewId
    selectedRowId.value = null
    selectedComponentId.value = null
  }

  function selectRow(rowId: string | null): void {
    selectedRowId.value = rowId
    selectedComponentId.value = null
  }

  function selectComponent(componentId: string | null): void {
    selectedComponentId.value = componentId
  }

  function setTokenSection(section: string): void {
    activeTokenSection.value = section
  }

  function setActiveSchema(schemaId: string | null): void {
    activeSchemaId.value = schemaId
  }

  function toggleExport(): void {
    exportOpen.value = !exportOpen.value
  }

  function pushHistory(project: Project): void {
    // Slice off any redo future
    history.value = history.value.slice(0, historyIndex.value + 1)
    // Add the new snapshot
    history.value.push(deepClone(project))
    // Enforce max history
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  function undo(): void {
    if (!canUndo.value) return
    historyIndex.value--
    const projectStore = useProjectStore()
    if (!projectStore.activeProjectId) return
    const snap = history.value[historyIndex.value]
    if (!snap) return
    projectStore.updateProject(projectStore.activeProjectId, deepClone(snap))
  }

  function redo(): void {
    if (!canRedo.value) return
    historyIndex.value++
    const projectStore = useProjectStore()
    if (!projectStore.activeProjectId) return
    const snap = history.value[historyIndex.value]
    if (!snap) return
    projectStore.updateProject(projectStore.activeProjectId, deepClone(snap))
  }

  function clearHistory(): void {
    history.value = []
    historyIndex.value = -1
  }

  return {
    activeMode,
    activeShellSection,
    activeViewId,
    selectedRowId,
    selectedComponentId,
    activeTokenSection,
    activeSchemaId,
    exportOpen,
    history,
    historyIndex,
    canUndo,
    canRedo,
    activeView,
    selectedRow,
    selectedComponent,
    setMode,
    setShellSection,
    setActiveView,
    selectRow,
    selectComponent,
    setTokenSection,
    setActiveSchema,
    toggleExport,
    pushHistory,
    undo,
    redo,
    clearHistory,
  }
})
