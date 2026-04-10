<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projects'

const projectStore = useProjectStore()
const theme = computed(() => projectStore.activeProject?.theme)

const bg = computed(() => theme.value?.colors?.background ?? '#0a0a0a')
const surface = computed(() => theme.value?.colors?.surface ?? '#171717')
const primary = computed(() => theme.value?.colors?.primary ?? '#a3e635')
const fg = computed(() => theme.value?.colors?.foreground ?? '#fafafa')
const muted = computed(() => theme.value?.colors?.muted ?? '#71717a')
const destructive = computed(() => theme.value?.colors?.destructive ?? '#f87171')
const radius = computed(() => theme.value?.spacing?.radius ?? 8)
const spacing = computed(() => theme.value?.spacing?.baseUnit ?? 4)
const bodyFont = computed(() => theme.value?.typography?.bodyFont ?? 'DM Sans')

const onPrimary = computed(() => {
  const hex = primary.value.replace('#', '')
  if (hex.length < 6) return '#0a0a0a'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#0a0a0a' : '#fafafa'
})

const cardStyle = computed(() => ({
  background: surface.value,
  borderRadius: `${radius.value}px`,
  border: '1px solid rgba(255,255,255,0.07)',
  padding: `${spacing.value * 3}px`,
  fontFamily: bodyFont.value,
}))
</script>

<template>
  <div class="w-[300px] shrink-0 border-l border-white/[0.07] flex flex-col bg-neutral-950">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-white/[0.07] shrink-0">
      <span class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Component preview</span>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

      <!-- Buttons -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Buttons</p>
        <div :style="{ ...cardStyle, display: 'flex', gap: `${spacing * 2}px`, flexWrap: 'wrap', alignItems: 'center' }">
          <button :style="{
            background: primary,
            color: onPrimary,
            border: 'none',
            borderRadius: `${radius / 1.5}px`,
            padding: `${spacing * 1.5}px ${spacing * 3}px`,
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'default',
            fontFamily: bodyFont,
          }">Primary</button>
          <button :style="{
            background: 'transparent',
            color: fg,
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: `${radius / 1.5}px`,
            padding: `${spacing * 1.5}px ${spacing * 3}px`,
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'default',
            fontFamily: bodyFont,
          }">Outline</button>
          <button :style="{
            background: 'transparent',
            color: muted,
            border: 'none',
            borderRadius: `${radius / 1.5}px`,
            padding: `${spacing * 1.5}px ${spacing * 3}px`,
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'default',
            fontFamily: bodyFont,
          }">Ghost</button>
          <button :style="{
            background: destructive + '18',
            color: destructive,
            border: `1px solid ${destructive}33`,
            borderRadius: `${radius / 1.5}px`,
            padding: `${spacing * 1.5}px ${spacing * 3}px`,
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'default',
            fontFamily: bodyFont,
          }">Danger</button>
        </div>
      </div>

      <!-- Input -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Input</p>
        <div :style="cardStyle">
          <div :style="{ fontSize: '11px', color: muted, marginBottom: `${spacing}px`, fontFamily: bodyFont }">
            Email address
          </div>
          <div :style="{
            background: bg,
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: `${radius / 2}px`,
            padding: `${spacing * 1.5}px ${spacing * 2}px`,
            fontSize: '12px',
            color: fg + '60',
            fontFamily: bodyFont,
          }">
            you@example.com
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Stats</p>
        <div :style="{ display: 'flex', gap: `${spacing * 2}px` }">
          <div
            v-for="stat in [{ label: 'Revenue', value: '$42k' }, { label: 'Users', value: '1,240' }, { label: 'Orders', value: '308' }]"
            :key="stat.label"
            :style="{
              ...cardStyle,
              flex: 1,
              padding: `${spacing * 2}px`,
            }"
          >
            <div :style="{ fontSize: '10px', color: muted, marginBottom: `${spacing}px`, fontFamily: bodyFont }">
              {{ stat.label }}
            </div>
            <div :style="{ fontSize: '16px', fontWeight: '600', color: fg, letterSpacing: '-0.02em', fontFamily: bodyFont }">
              {{ stat.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- Card -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Card</p>
        <div :style="cardStyle">
          <div :style="{ fontSize: '13px', fontWeight: '600', color: fg, marginBottom: `${spacing}px`, fontFamily: bodyFont }">
            Upgrade your plan
          </div>
          <div :style="{ fontSize: '11px', color: muted, marginBottom: `${spacing * 2}px`, lineHeight: '1.5', fontFamily: bodyFont }">
            Unlock advanced analytics and unlimited exports.
          </div>
          <div :style="{ display: 'flex', gap: `${spacing}px` }">
            <button :style="{
              flex: 1,
              background: primary,
              color: onPrimary,
              border: 'none',
              borderRadius: `${radius / 2}px`,
              padding: `${spacing}px`,
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'default',
              fontFamily: bodyFont,
            }">Learn more</button>
            <button :style="{
              flex: 1,
              background: 'transparent',
              color: muted,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: `${radius / 2}px`,
              padding: `${spacing}px`,
              fontSize: '11px',
              cursor: 'default',
              fontFamily: bodyFont,
            }">Dismiss</button>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Badges</p>
        <div :style="{ ...cardStyle, display: 'flex', gap: `${spacing}px`, flexWrap: 'wrap', alignItems: 'center' }">
          <span :style="{
            background: primary + '20',
            color: primary,
            borderRadius: `${radius / 2}px`,
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: bodyFont,
          }">Active</span>
          <span :style="{
            background: 'rgba(255,255,255,0.06)',
            color: muted,
            borderRadius: `${radius / 2}px`,
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: bodyFont,
          }">Draft</span>
          <span :style="{
            background: destructive + '18',
            color: destructive,
            borderRadius: `${radius / 2}px`,
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: bodyFont,
          }">Error</span>
          <span :style="{
            background: 'rgba(34,197,94,0.15)',
            color: '#4ade80',
            borderRadius: `${radius / 2}px`,
            padding: '2px 8px',
            fontSize: '10px',
            fontFamily: bodyFont,
          }">Success</span>
        </div>
      </div>

      <!-- Navigation -->
      <div>
        <p class="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Navigation</p>
        <div :style="{ ...cardStyle, padding: `${spacing}px` }">
          <div :style="{
            display: 'flex',
            alignItems: 'center',
            gap: `${spacing * 2}px`,
            padding: `${spacing * 1.5}px ${spacing * 2}px`,
            borderRadius: `${radius / 2}px`,
            background: primary + '18',
            marginBottom: `${spacing / 2}px`,
          }">
            <div :style="{ width: '14px', height: '14px', borderRadius: '3px', background: primary + '40' }"></div>
            <span :style="{ fontSize: '12px', fontWeight: '500', color: fg, fontFamily: bodyFont }">Dashboard</span>
          </div>
          <div :style="{
            display: 'flex',
            alignItems: 'center',
            gap: `${spacing * 2}px`,
            padding: `${spacing * 1.5}px ${spacing * 2}px`,
            borderRadius: `${radius / 2}px`,
          }">
            <div :style="{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }"></div>
            <span :style="{ fontSize: '12px', color: muted, fontFamily: bodyFont }">Settings</span>
          </div>
          <div :style="{
            display: 'flex',
            alignItems: 'center',
            gap: `${spacing * 2}px`,
            padding: `${spacing * 1.5}px ${spacing * 2}px`,
            borderRadius: `${radius / 2}px`,
          }">
            <div :style="{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }"></div>
            <span :style="{ fontSize: '12px', color: muted, fontFamily: bodyFont }">Profile</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
