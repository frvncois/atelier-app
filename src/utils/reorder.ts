export function reorder<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array]
  const removed = result.splice(fromIndex, 1)[0]!
  result.splice(toIndex, 0, removed)
  return result
}

export function moveBetween<T>(
  source: T[],
  sourceIndex: number,
  target: T[],
  targetIndex: number,
): { source: T[]; target: T[] } {
  const newSource = [...source]
  const newTarget = [...target]
  const removed = newSource.splice(sourceIndex, 1)[0]!
  newTarget.splice(targetIndex, 0, removed)
  return { source: newSource, target: newTarget }
}
