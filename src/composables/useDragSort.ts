import { ref, type Ref } from 'vue'
import { reorder } from '@/utils/reorder'

export function useDragSort<T extends { id: string; order: number }>(
  items: Ref<T[]>,
  onReorder: (reordered: T[]) => void,
) {
  const draggingId = ref<string | null>(null)
  const dragOverId = ref<string | null>(null)

  function onDragStart(id: string) {
    draggingId.value = id
  }

  function onDragOver(event: DragEvent, id: string) {
    event.preventDefault()
    dragOverId.value = id
  }

  function onDrop() {
    if (!draggingId.value || !dragOverId.value || draggingId.value === dragOverId.value) {
      onDragEnd()
      return
    }

    const fromIndex = items.value.findIndex(item => item.id === draggingId.value)
    const toIndex = items.value.findIndex(item => item.id === dragOverId.value)

    if (fromIndex === -1 || toIndex === -1) {
      onDragEnd()
      return
    }

    const reordered = reorder(items.value, fromIndex, toIndex).map((item, idx) => ({
      ...item,
      order: idx,
    }))

    onReorder(reordered)
    onDragEnd()
  }

  function onDragEnd() {
    draggingId.value = null
    dragOverId.value = null
  }

  function dragClass(id: string): string {
    if (draggingId.value === id) return 'opacity-40'
    if (dragOverId.value === id) return 'border-t-2 border-lime-400'
    return ''
  }

  return {
    draggingId,
    dragOverId,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    dragClass,
  }
}
