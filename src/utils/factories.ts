import { generateId } from './id'
import type {
  Project, View, Row, ComponentSpec, ShellConfig,
  ThemeConfig, DataSchema, ActionDefinition, NavItem,
  ComponentType, Framework,
} from '@/types'

export function defaultTheme(): ThemeConfig {
  return {
    mode: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#1a1a1a',
      surface: '#f5f5f4',
      primary: '#534AB7',
      secondary: '#e5e5e5',
      muted: '#a0a0a0',
      destructive: '#e24b4a',
    },
    typography: {
      headingFont: 'DM Sans',
      bodyFont: 'DM Sans',
      monoFont: 'DM Mono',
    },
    spacing: { baseUnit: 4, radius: 8 },
    icons: { boxed: false, source: 'heroicons' },
  }
}

function defaultShell(appName: string): ShellConfig {
  return {
    pattern: 'top-sidebar',
    topBar: { height: 48, sticky: true, border: true },
    sidebar: { width: 220, collapsible: true, border: true },
    brand: {
      appName,
      logoType: 'icon-text',
      icon: 'SquaresPlusIcon',
      faviconUrl: '',
    },
    sidebarItems: [],
    topBarItems: [],
    userMenu: {
      showAvatar: true,
      nameBinding: 'user.name',
      emailBinding: 'user.email',
      dropdownItems: [],
    },
    globalElements: [],
  }
}

export function createProject(name: string, framework: Framework): Project {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name,
    framework,
    createdAt: now,
    updatedAt: now,
    shell: defaultShell(name),
    views: [createView('Home', 0)],
    theme: defaultTheme(),
    schemas: [],
    actions: [],
  }
}

export function createView(name: string, order: number): View {
  return {
    id: generateId(),
    name,
    rows: [],
    order,
  }
}

export function createRow(label: string, order: number): Row {
  return {
    id: generateId(),
    label,
    tag: 'row',
    components: [],
    order,
    collapsed: false,
  }
}

const defaultPropsByType: Record<ComponentType, Record<string, unknown>> = {
  UiStats: { title: 'Stat', icon: 'ChartBarIcon', description: '', value: '—', variant: 'default', size: 'md' },
  UiCard: { title: 'Card', icon: '', description: '', variant: 'default' },
  UiTable: { columns: [], paginated: true, pageSize: 10 },
  UiForm: { fields: [], submitLabel: 'Submit' },
  UiButton: {},
  UiInput: {},
  UiBadge: {},
  UiTab: {},
  Row: {},
  Grid: {},
  Stack: {},
  Card: {},
}

export function createComponent(type: ComponentType, name: string, order: number): ComponentSpec {
  return {
    id: generateId(),
    type,
    name,
    props: { ...(defaultPropsByType[type] ?? {}) },
    bindings: {},
    actions: [],
    order,
  }
}

export function createNavItem(label: string, icon: string, order: number): NavItem {
  return {
    id: generateId(),
    label,
    icon,
    targetType: 'view',
    order,
  }
}

export function createSchema(name: string, color: string): DataSchema {
  return {
    id: generateId(),
    name,
    color,
    fields: [],
  }
}

export function createAction(type: ActionDefinition['type']): ActionDefinition {
  return {
    id: generateId(),
    name: type,
    type,
    config: {},
  }
}
