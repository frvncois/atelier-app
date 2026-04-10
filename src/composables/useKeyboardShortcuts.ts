import { useEventListener } from '@vueuse/core'
import { useEditorStore } from '@/stores/editor'
import { useProjectStore } from '@/stores/projects'
import { deepClone } from '@/utils/clone'

export function useKeyboardShortcuts() {
  const editorStore = useEditorStore()
  const projectStore = useProjectStore()

  function isInputFocused(): boolean {
    const tag = document.activeElement?.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
  }

  function handleDuplicate() {
    const project = projectStore.activeProject
    if (!project) return

    // Duplicate selected component
    if (editorStore.selectedComponentId) {
      const comp = editorStore.selectedComponent
      const row = editorStore.selectedRow
      const view = editorStore.activeView
      if (!comp || !row || !view) return

      const clone = deepClone(comp)
      clone.id = crypto.randomUUID()
      clone.name = `${comp.name} (copy)`
      clone.order = row.components.length

      const updatedViews = project.views.map(v =>
        v.id === view.id
          ? {
              ...v,
              rows: v.rows.map(r =>
                r.id === row.id
                  ? { ...r, components: [...r.components, clone] }
                  : r
              ),
            }
          : v
      )
      projectStore.updateProject(project.id, { views: updatedViews })
    }
  }

  function handleDelete() {
    const project = projectStore.activeProject
    if (!project) return

    if (editorStore.selectedComponentId) {
      const view = editorStore.activeView
      if (!view) return

      const updatedViews = project.views.map(v =>
        v.id === view.id
          ? {
              ...v,
              rows: v.rows.map(r => ({
                ...r,
                components: r.components.filter(c => c.id !== editorStore.selectedComponentId),
              })),
            }
          : v
      )
      projectStore.updateProject(project.id, { views: updatedViews })
      editorStore.selectComponent(null)
    }
  }

  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey

    if (ctrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      editorStore.undo()
      return
    }

    if ((ctrl && e.shiftKey && e.key === 'z') || (ctrl && e.key === 'y')) {
      e.preventDefault()
      editorStore.redo()
      return
    }

    if (ctrl && e.key === 'd') {
      e.preventDefault()
      handleDuplicate()
      return
    }

    if (e.key === 'Escape') {
      editorStore.selectComponent(null)
      editorStore.selectRow(null)
      return
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused()) {
      handleDelete()
    }
  })
}
