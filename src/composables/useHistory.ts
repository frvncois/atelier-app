import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useProjectStore } from '@/stores/projects'
import { deepClone } from '@/utils/clone'

export function useHistory() {
  const editorStore = useEditorStore()
  const projectStore = useProjectStore()

  function snapshot() {
    if (!projectStore.activeProject) return
    editorStore.pushHistory(deepClone(projectStore.activeProject))
  }

  return {
    snapshot,
    undo: editorStore.undo,
    redo: editorStore.redo,
    canUndo: computed(() => editorStore.canUndo),
    canRedo: computed(() => editorStore.canRedo),
  }
}
