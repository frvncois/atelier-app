import { ref } from 'vue'
import JSZip from 'jszip'
import type { Project, View, Row, ComponentSpec, ThemeConfig, DataSchema, ActionDefinition } from '@/types'

export function useExport() {
  const generating = ref(false)

  async function exportProject(project: Project): Promise<void> {
    generating.value = true
    try {
      const zip = new JSZip()
      const folder = zip.folder('atelier-output')!

      folder.file('00_MASTER.md',     _generateMaster(project))
      folder.file('01_TOKENS.md',     generateTokens(project))
      folder.file('02_COMPONENTS.md', generateComponents(project))
      folder.file('03_LAYOUT.md',     generateLayout(project))
      folder.file('04_VIEWS.md',      generateViews(project))
      folder.file('05_DATA.md',       generateData(project))

      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `${slugify(project.name)}-atelier.zip`)
    } finally {
      generating.value = false
    }
  }

  return { exportProject, generating }
}

// ─── Helpers ────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function now(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Generators ─────────────────────────────────────────────────

function _generateMaster(project: Project): string {
  const viewList = project.views.map(v => `- ${v.name}`).join('\n')

  return `# ${project.name} — Atelier Spec
Generated: ${now()}
Framework: ${project.framework}

## Files
- 01_TOKENS.md     — Design tokens and theme
- 02_COMPONENTS.md — Component contracts
- 03_LAYOUT.md     — Shell and navigation structure
- 04_VIEWS.md      — Views and component trees
- 05_DATA.md       — Data schemas and actions

## Views (${project.views.length})
${viewList}

## Shell pattern
${project.shell.pattern}

## Brand
App name: ${project.shell.brand.appName}
Logo type: ${project.shell.brand.logoType}
`
}

function generateTokens(project: Project): string {
  const { colors, typography, spacing } = project.theme

  const colorTable = Object.entries(colors)
    .map(([name, value]) => `| ${name} | \`${value}\` |`)
    .join('\n')

  const cssVars = Object.entries(colors)
    .map(([name, value]) => `  --color-${name}: ${value};`)
    .join('\n')

  return `# Design Tokens — ${project.name}

## Color palette
| Token | Value |
|---|---|
${colorTable}

## Typography
| Role | Font |
|---|---|
| Heading | ${typography.headingFont} |
| Body | ${typography.bodyFont} |
| Mono | ${typography.monoFont} |

## Spacing
- Base unit: ${spacing.baseUnit}px
- Border radius: ${spacing.radius}px

## CSS variables
\`\`\`css
:root {
${cssVars}
  --font-heading: '${typography.headingFont}';
  --font-body: '${typography.bodyFont}';
  --font-mono: '${typography.monoFont}';
  --radius-base: ${spacing.radius}px;
  --spacing-base: ${spacing.baseUnit}px;
}
\`\`\`
`
}

function generateComponents(project: Project): string {
  // Collect unique component types
  const typeMap = new Map<string, ComponentSpec>()
  for (const view of project.views) {
    for (const row of view.rows) {
      for (const comp of row.components) {
        if (!typeMap.has(comp.type)) {
          typeMap.set(comp.type, comp)
        }
      }
    }
  }

  if (typeMap.size === 0) {
    return `# Component Specs — ${project.name}\n\nNo components defined yet.\n`
  }

  let output = `# Component Specs — ${project.name}\n\n`

  for (const [type, example] of typeMap) {
    output += `## ${type}\n\n`
    output += `### Props\n`
    if (Object.keys(example.props).length > 0) {
      output += '| Prop | Default |\n|---|---|\n'
      for (const [k, v] of Object.entries(example.props)) {
        output += `| ${k} | \`${JSON.stringify(v)}\` |\n`
      }
    } else {
      output += '_No props defined_\n'
    }
    output += '\n'
  }

  return output
}

function generateLayout(project: Project): string {
  const { shell } = project
  const sidebarItems = shell.sidebarItems
    .map(item => `- ${item.label} → ${item.targetViewId ?? '(no target)'}`)
    .join('\n') || '_None_'
  const topBarItems = shell.topBarItems
    .map(item => `- ${item.label}`)
    .join('\n') || '_None_'
  const globalEls = shell.globalElements
    .map(el => `- ${el.label} (${el.type})${el.shortcut ? ` [${el.shortcut}]` : ''}`)
    .join('\n') || '_None_'

  return `# Shell Layout — ${project.name}

## Navigation pattern
${shell.pattern}

## Top bar
- Height: ${shell.topBar.height}px
- Sticky: ${shell.topBar.sticky}
- Border: ${shell.topBar.border}

### Top bar items
${topBarItems}

## Sidebar
- Width: ${shell.sidebar.width}px
- Collapsible: ${shell.sidebar.collapsible}
- Border: ${shell.sidebar.border}

### Sidebar items
${sidebarItems}

## User menu
- Show avatar: ${shell.userMenu.showAvatar}
- Name binding: \`${shell.userMenu.nameBinding}\`
- Email binding: \`${shell.userMenu.emailBinding}\`

## Global elements
${globalEls}
`
}

function generateViews(project: Project): string {
  if (project.views.length === 0) {
    return `# Views — ${project.name}\n\nNo views defined yet.\n`
  }

  let output = `# Views — ${project.name}\n\n`

  for (const view of project.views) {
    output += `## ${view.name}\n\n`

    if (view.rows.length === 0) {
      output += '_No rows defined_\n\n'
      continue
    }

    for (const row of view.rows) {
      output += `### Row: ${row.label}\n`
      output += `Layout: ${row.tag}\n\n`

      if (row.components.length === 0) {
        output += '_No components_\n\n'
        continue
      }

      for (const comp of row.components) {
        output += `#### ${comp.name} (${comp.type})\n`

        if (Object.keys(comp.props).length > 0) {
          output += 'Props:\n'
          for (const [k, v] of Object.entries(comp.props)) {
            output += `- ${k}: \`${JSON.stringify(v)}\`\n`
          }
        }

        if (Object.keys(comp.bindings).length > 0) {
          output += 'Bindings:\n'
          for (const [k, v] of Object.entries(comp.bindings)) {
            output += `- ${k} → ${v}\n`
          }
        }

        if (comp.actions.length > 0) {
          output += 'Actions:\n'
          for (const action of comp.actions) {
            output += `- ${action.trigger} → ${action.actionId}\n`
          }
        }

        output += '\n'
      }
    }
  }

  return output
}

// Named export for preview without download
export function generateMasterMarkdown(project: Project): string {
  return _generateMaster(project)
}

function generateData(project: Project): string {
  let output = `# Data Schemas & Actions — ${project.name}\n\n`

  if (project.schemas.length === 0 && project.actions.length === 0) {
    return output + '_No schemas or actions defined yet._\n'
  }

  // Schemas
  if (project.schemas.length > 0) {
    output += `## Schemas\n\n`
    for (const schema of project.schemas) {
      output += `### ${schema.name}\n\n`
      if (schema.fields.length > 0) {
        output += '| Field | Type | Required | Description |\n|---|---|---|---|\n'
        for (const field of schema.fields) {
          output += `| ${field.name} | ${field.type} | ${field.required ? 'Yes' : 'No'} | ${field.description} |\n`
        }
      } else {
        output += '_No fields defined_\n'
      }
      output += '\n'
    }
  }

  // Actions
  if (project.actions.length > 0) {
    output += `## Action Definitions\n\n`
    for (const action of project.actions) {
      output += `### ${action.name} (${action.type})\n`
      if (Object.keys(action.config).length > 0) {
        output += '```json\n'
        output += JSON.stringify(action.config, null, 2)
        output += '\n```\n'
      }
      output += '\n'
    }
  }

  return output
}
