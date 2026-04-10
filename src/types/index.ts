// ─── Primitives ───────────────────────────────────────────────

export type Framework =
  | 'vue3' | 'react' | 'svelte' | 'nuxt' | 'angular' | 'agnostic'

export type NavPattern =
  | 'top-only' | 'sidebar-only' | 'top-sidebar' | 'none'

export type FieldType =
  | 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'

export type ActionType =
  | 'router.push' | 'router.back'
  | 'dialog.open' | 'dialog.close'
  | 'api.call' | 'state.set' | 'emit'

export type ActionTrigger =
  | 'onClick' | 'onSubmit' | 'onChange' | 'onMount'

export type EditorMode = 'layout' | 'views' | 'theme' | 'data'

export type ComponentType =
  | 'UiStats' | 'UiCard' | 'UiTable' | 'UiForm'
  | 'UiButton' | 'UiInput' | 'UiBadge' | 'UiTab'
  | 'Row' | 'Grid' | 'Stack' | 'Card'


// ─── Shell ────────────────────────────────────────────────────

export interface NavItem {
  id: string
  label: string
  icon: string
  targetViewId?: string
  targetType: 'view' | 'component' | 'action'
  order: number
}

export interface DropdownItem {
  id: string
  label: string
  icon?: string
  targetViewId?: string
  action?: string
  destructive?: boolean
}

export interface UserMenuConfig {
  showAvatar: boolean
  nameBinding: string
  emailBinding: string
  dropdownItems: DropdownItem[]
}

export interface GlobalElement {
  id: string
  label: string
  type: 'command-palette' | 'toast' | 'custom'
  shortcut?: string
}

export interface ShellConfig {
  pattern: NavPattern
  topBar: {
    height: 48 | 56 | 64
    sticky: boolean
    border: boolean
  }
  sidebar: {
    width: 64 | 180 | 220 | 260
    collapsible: boolean
    border: boolean
  }
  brand: {
    appName: string
    logoType: 'text' | 'icon-text' | 'icon' | 'image'
    icon: string
    faviconUrl: string
  }
  sidebarItems: NavItem[]
  topBarItems: NavItem[]
  userMenu: UserMenuConfig
  globalElements: GlobalElement[]
}


// ─── Views ────────────────────────────────────────────────────

export interface ComponentAction {
  id: string
  trigger: ActionTrigger
  actionId: string
}

export interface ComponentSpec {
  id: string
  type: ComponentType
  name: string
  props: Record<string, unknown>
  bindings: Record<string, string>
  actions: ComponentAction[]
  order: number
}

export interface Row {
  id: string
  label: string
  tag: 'row' | 'grid' | 'stack'
  components: ComponentSpec[]
  order: number
  collapsed: boolean
}

export interface View {
  id: string
  name: string
  rows: Row[]
  order: number
}


// ─── Theme ────────────────────────────────────────────────────

export interface ThemeConfig {
  mode: 'light' | 'dark'
  colors: {
    background: string
    foreground: string
    surface: string
    primary: string
    secondary: string
    muted: string
    destructive: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    monoFont: string
  }
  spacing: {
    baseUnit: number
    radius: number
  }
  icons: {
    boxed: boolean
    source: string
  }
}


// ─── Data schemas ─────────────────────────────────────────────

export interface SchemaField {
  id: string
  name: string
  type: FieldType
  description: string
  required: boolean
}

export interface DataSchema {
  id: string
  name: string
  color: string
  fields: SchemaField[]
}


// ─── Actions ──────────────────────────────────────────────────

export interface ActionDefinition {
  id: string
  name: string
  type: ActionType
  config: Record<string, unknown>
}


// ─── Project ──────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  framework: Framework
  ownerId?: string
  createdAt: string
  updatedAt: string
  shell: ShellConfig
  views: View[]
  theme: ThemeConfig
  schemas: DataSchema[]
  actions: ActionDefinition[]
}
