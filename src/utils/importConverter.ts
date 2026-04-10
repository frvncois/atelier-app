import type { AtelierImportSchema } from '@/types/import'
import type { Project } from '@/types'
import { createProject, createView, createRow, createComponent } from '@/utils/factories'
import { generateId } from '@/utils/id'

export function buildProjectFromSchema(schema: AtelierImportSchema): Project {
  const project = createProject(schema.name, schema.framework)

  // Shell
  project.shell.pattern = schema.shell.pattern
  project.shell.brand.appName = schema.shell.brand.appName
  project.shell.brand.logoType = schema.shell.brand.logoType as any

  project.shell.sidebarItems = schema.shell.sidebarItems.map((item, i) => ({
    id: generateId(),
    label: item.label,
    icon: item.icon ?? 'HomeIcon',
    targetType: 'view' as const,
    order: i,
  }))

  project.shell.topBarItems = schema.shell.topBarItems.map((item, i) => ({
    id: generateId(),
    label: item.label,
    icon: 'BellIcon',
    targetType: 'component' as const,
    order: i,
  }))

  // Views
  project.views = schema.views.map((v, vi) => {
    const view = createView(v.name, vi)
    view.rows = v.rows.map((r, ri) => {
      const row = createRow(r.label, ri)
      row.components = r.components.map((c, ci) => {
        const comp = createComponent(c.type as any, c.name, ci)
        if (c.props) comp.props = { ...comp.props, ...c.props }
        if (c.dataSource) comp.bindings = { value: c.dataSource }
        return comp
      })
      return row
    })
    return view
  })

  // Theme
  if (schema.theme) {
    const t = schema.theme
    if (t.primary) project.theme.colors.primary = t.primary
    if (t.background) project.theme.colors.background = t.background
    if (t.surface) project.theme.colors.surface = t.surface
    if (t.foreground) project.theme.colors.foreground = t.foreground
    if (t.radius !== undefined) project.theme.spacing.radius = t.radius
    if (t.font) {
      project.theme.typography.headingFont = t.font
      project.theme.typography.bodyFont = t.font
    }
  }

  // Schemas
  if (schema.schemas) {
    project.schemas = schema.schemas.map(s => ({
      id: generateId(),
      name: s.name,
      color: 'bg-sky-400',
      fields: s.fields.map(f => ({
        id: generateId(),
        name: f.name,
        type: f.type as any,
        description: f.description ?? '',
        required: false,
      })),
    }))
  }

  return project
}
