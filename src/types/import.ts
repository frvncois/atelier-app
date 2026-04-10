export interface AtelierImportSchema {
  version: '1.0'
  name: string
  framework: 'vue3' | 'react' | 'svelte' | 'nuxt' | 'angular' | 'agnostic'
  shell: {
    pattern: 'top-only' | 'sidebar-only' | 'top-sidebar' | 'none'
    brand: { appName: string; logoType: string }
    sidebarItems: Array<{ label: string; path: string; icon?: string }>
    topBarItems: Array<{ label: string; type: string }>
  }
  views: Array<{
    name: string
    rows: Array<{
      label: string
      components: Array<{
        type: string
        name: string
        props?: Record<string, unknown>
        dataSource?: string
      }>
    }>
  }>
  theme?: {
    primary?: string
    background?: string
    surface?: string
    foreground?: string
    radius?: number
    font?: string
  }
  schemas?: Array<{
    name: string
    fields: Array<{ name: string; type: string; description?: string }>
  }>
}
