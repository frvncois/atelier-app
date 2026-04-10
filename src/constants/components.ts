import type { ComponentType } from '@/types'

export interface ComponentDefinition {
  type: ComponentType
  label: string
  description: string
  category: 'layout' | 'display' | 'input' | 'data'
  badge: string
}

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  // Layout
  { type: 'Row',     label: 'Row',        description: 'Horizontal flex container',          category: 'layout',  badge: 'purple' },
  { type: 'Grid',    label: 'Grid',       description: 'Responsive grid layout',             category: 'layout',  badge: 'purple' },
  { type: 'Stack',   label: 'Stack',      description: 'Vertical stack with spacing',        category: 'layout',  badge: 'purple' },
  { type: 'Card',    label: 'Card',       description: 'Surface container with border',      category: 'layout',  badge: 'default' },

  // Display
  { type: 'UiStats', label: 'Stats card', description: 'Metric with icon and label',         category: 'display', badge: 'accent' },
  { type: 'UiCard',  label: 'Card',       description: 'Content card with actions',          category: 'display', badge: 'blue' },
  { type: 'UiBadge', label: 'Badge',      description: 'Status or label chip',               category: 'display', badge: 'default' },
  { type: 'UiTab',   label: 'Tabs',       description: 'Tab navigation strip',               category: 'display', badge: 'blue' },

  // Data
  { type: 'UiTable', label: 'Table',      description: 'Data table with pagination',         category: 'data',    badge: 'purple' },

  // Input
  { type: 'UiForm',  label: 'Form',       description: 'Form with fields and submit button', category: 'input',   badge: 'amber' },
  { type: 'UiButton',label: 'Button',     description: 'Standalone action button',           category: 'input',   badge: 'default' },
  { type: 'UiInput', label: 'Input',      description: 'Single text input field',            category: 'input',   badge: 'amber' },
]
