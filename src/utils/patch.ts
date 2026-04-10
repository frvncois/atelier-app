import type { View, ComponentSpec, Row } from '@/types'

/**
 * Immutably patches a single component inside the views/rows tree.
 */
export function patchComponentInViews(
  views: View[],
  componentId: string,
  patch: Partial<ComponentSpec>,
): View[] {
  return views.map(view => ({
    ...view,
    rows: view.rows.map(row => ({
      ...row,
      components: row.components.map(comp =>
        comp.id === componentId ? { ...comp, ...patch } : comp
      ),
    })),
  }))
}

/**
 * Immutably patches a single row inside the views tree.
 */
export function patchRowInViews(
  views: View[],
  viewId: string,
  rowId: string,
  patch: Partial<Row>,
): View[] {
  return views.map(view =>
    view.id === viewId
      ? {
          ...view,
          rows: view.rows.map(row =>
            row.id === rowId ? { ...row, ...patch } : row
          ),
        }
      : view
  )
}

/**
 * Removes a component from the views/rows tree.
 */
export function removeComponentFromViews(
  views: View[],
  componentId: string,
): View[] {
  return views.map(view => ({
    ...view,
    rows: view.rows.map(row => ({
      ...row,
      components: row.components.filter(c => c.id !== componentId),
    })),
  }))
}

/**
 * Removes a row from its view.
 */
export function removeRowFromViews(
  views: View[],
  viewId: string,
  rowId: string,
): View[] {
  return views.map(view =>
    view.id === viewId
      ? { ...view, rows: view.rows.filter(r => r.id !== rowId) }
      : view
  )
}
