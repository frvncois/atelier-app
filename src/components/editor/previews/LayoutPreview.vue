<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projects'

const projectStore = useProjectStore()
const shell = computed(() => projectStore.activeProject?.shell)
const theme = computed(() => projectStore.activeProject?.theme)

const pattern = computed(() => shell.value?.pattern ?? 'top-sidebar')
const showTopBar = computed(() => pattern.value === 'top-only' || pattern.value === 'top-sidebar')
const showSidebar = computed(() => pattern.value === 'sidebar-only' || pattern.value === 'top-sidebar')
const showTopBorder = computed(() => shell.value?.topBar?.border ?? true)
const appName = computed(() => shell.value?.brand?.appName ?? 'App')
const sidebarItems = computed(() => [...(shell.value?.sidebarItems ?? [])].sort((a, b) => a.order - b.order))
const topBarItems = computed(() => [...(shell.value?.topBarItems ?? [])].sort((a, b) => a.order - b.order))
const showAvatar = computed(() => shell.value?.userMenu?.showAvatar ?? true)

const primary = computed(() => theme.value?.colors?.primary ?? '#a3e635')
const background = computed(() => theme.value?.colors?.background ?? '#0a0a0a')
const surface = computed(() => theme.value?.colors?.surface ?? '#171717')
const foreground = computed(() => theme.value?.colors?.foreground ?? '#fafafa')
const radius = computed(() => theme.value?.spacing?.radius ?? 8)
</script>

<template>
  <div class="w-[300px] shrink-0 border-l border-white/[0.07] flex flex-col bg-neutral-950">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-white/[0.07] shrink-0">
      <span class="text-[10px] font-medium text-neutral-600 uppercase tracking-widest">Shell preview</span>
    </div>

    <!-- Body -->
    <div class="flex-1 flex items-start justify-center p-4 overflow-y-auto">
      <div class="w-full flex flex-col gap-0">
        <!-- Browser frame -->
        <div class="w-full rounded-xl overflow-hidden border border-white/[0.12] bg-neutral-900 shadow-2xl">
          <!-- Chrome bar -->
          <div class="h-8 bg-neutral-800 border-b border-white/[0.07] flex items-center px-3 gap-2">
            <div class="flex gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-600"></div>
            </div>
            <div class="flex-1 bg-neutral-700 rounded h-4 mx-2 flex items-center px-2">
              <span class="text-[9px] text-neutral-500 truncate">{{ appName }}.app</span>
            </div>
          </div>

          <!-- Shell frame -->
          <div class="flex flex-col" style="height: 320px;">

            <!-- top-sidebar pattern -->
            <template v-if="pattern === 'top-sidebar'">
              <!-- Top bar -->
              <div
                class="flex items-center shrink-0 px-2 gap-2"
                :style="{
                  height: '28px',
                  background: '#111114',
                  borderBottom: showTopBorder ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }"
              >
                <div class="w-3.5 h-3.5 rounded shrink-0" :style="{ background: primary }"></div>
                <span class="text-[9px] font-medium truncate" :style="{ color: foreground, opacity: 0.7 }">{{ appName }}</span>
                <div class="flex items-center gap-1 ml-auto">
                  <div v-for="item in topBarItems.slice(0, 3)" :key="item.id" class="w-4 h-4 rounded-sm" :style="{ background: 'rgba(255,255,255,0.06)' }"></div>
                  <div v-if="showAvatar" class="w-4 h-4 rounded-full ml-0.5" :style="{ background: primary, opacity: 0.6 }"></div>
                </div>
              </div>
              <!-- Body row -->
              <div class="flex flex-1 overflow-hidden">
                <!-- Sidebar -->
                <div
                  class="flex flex-col shrink-0 py-1.5"
                  :style="{ width: '40px', background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)' }"
                >
                  <template v-if="sidebarItems.length > 0">
                    <div
                      v-for="(item, idx) in sidebarItems.slice(0, 5)"
                      :key="item.id"
                      class="mx-1 mb-0.5 px-1.5 rounded flex items-center gap-1"
                      :style="{ height: '20px', background: idx === 0 ? `${primary}22` : 'transparent' }"
                    >
                      <div class="w-2 h-2 rounded-sm shrink-0" :style="{ background: idx === 0 ? primary : 'rgba(255,255,255,0.15)' }"></div>
                      <div class="h-1.5 rounded-sm flex-1" :style="{ background: idx === 0 ? `${primary}66` : 'rgba(255,255,255,0.08)' }"></div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-for="i in 4" :key="i" class="mx-1 mb-0.5 px-1.5 rounded flex items-center gap-1" style="height:20px">
                      <div class="w-2 h-2 rounded-sm" :style="{ background: i === 1 ? `${primary}33` : 'rgba(255,255,255,0.08)' }"></div>
                      <div class="h-1.5 rounded-sm flex-1" :style="{ background: i === 1 ? `${primary}44` : 'rgba(255,255,255,0.06)' }"></div>
                    </div>
                  </template>
                </div>
                <!-- Content -->
                <div class="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden" :style="{ background: background }">
                  <div class="flex gap-1.5">
                    <div v-for="i in 3" :key="i" class="flex-1 rounded p-1.5" :style="{ background: surface, borderRadius: `${radius / 3}px` }">
                      <div class="h-1.5 rounded mb-1" style="width:60%;background:rgba(255,255,255,0.08)"></div>
                      <div class="h-3 rounded" style="width:80%;background:rgba(255,255,255,0.12)"></div>
                    </div>
                  </div>
                  <div class="rounded p-2 flex-1" :style="{ background: surface, borderRadius: `${radius / 3}px`, border: '1px solid rgba(255,255,255,0.06)' }">
                    <div class="h-2 rounded mb-1.5" style="width:40%;background:rgba(255,255,255,0.1)"></div>
                    <div class="h-1.5 rounded mb-1" style="background:rgba(255,255,255,0.06)"></div>
                    <div class="h-1.5 rounded mb-2" style="width:70%;background:rgba(255,255,255,0.06)"></div>
                    <div class="flex gap-1">
                      <div class="h-4 rounded px-2 flex items-center justify-center" :style="{ background: primary, borderRadius: `${radius / 3}px`, minWidth: '36px' }">
                        <div class="h-1.5 w-6 rounded" style="background:rgba(0,0,0,0.3)"></div>
                      </div>
                      <div class="h-4 rounded px-2 flex items-center justify-center" :style="{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: `${radius / 3}px`, minWidth: '36px' }">
                        <div class="h-1.5 w-6 rounded" style="background:rgba(255,255,255,0.12)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- top-only pattern -->
            <template v-else-if="pattern === 'top-only'">
              <div
                class="flex items-center shrink-0 px-2 gap-2"
                :style="{
                  height: '28px',
                  background: '#111114',
                  borderBottom: showTopBorder ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }"
              >
                <div class="w-3.5 h-3.5 rounded shrink-0" :style="{ background: primary }"></div>
                <span class="text-[9px] font-medium truncate" :style="{ color: foreground, opacity: 0.7 }">{{ appName }}</span>
                <div class="flex items-center gap-1 ml-auto">
                  <div v-for="item in topBarItems.slice(0, 3)" :key="item.id" class="w-4 h-4 rounded-sm" :style="{ background: 'rgba(255,255,255,0.06)' }"></div>
                  <div v-if="showAvatar" class="w-4 h-4 rounded-full ml-0.5" :style="{ background: primary, opacity: 0.6 }"></div>
                </div>
              </div>
              <div class="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden" :style="{ background: background }">
                <div class="flex gap-1.5">
                  <div v-for="i in 3" :key="i" class="flex-1 rounded p-1.5" :style="{ background: surface, borderRadius: `${radius / 3}px` }">
                    <div class="h-1.5 rounded mb-1" style="width:60%;background:rgba(255,255,255,0.08)"></div>
                    <div class="h-3 rounded" style="width:80%;background:rgba(255,255,255,0.12)"></div>
                  </div>
                </div>
                <div class="rounded p-2 flex-1" :style="{ background: surface, borderRadius: `${radius / 3}px`, border: '1px solid rgba(255,255,255,0.06)' }">
                  <div class="h-2 rounded mb-1.5" style="width:40%;background:rgba(255,255,255,0.1)"></div>
                  <div class="h-1.5 rounded mb-1" style="background:rgba(255,255,255,0.06)"></div>
                  <div class="h-1.5 rounded mb-2" style="width:70%;background:rgba(255,255,255,0.06)"></div>
                </div>
              </div>
            </template>

            <!-- sidebar-only pattern -->
            <template v-else-if="pattern === 'sidebar-only'">
              <div class="flex flex-1 overflow-hidden">
                <div
                  class="flex flex-col shrink-0 py-1.5"
                  :style="{ width: '40px', background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.05)' }"
                >
                  <template v-if="sidebarItems.length > 0">
                    <div
                      v-for="(item, idx) in sidebarItems.slice(0, 6)"
                      :key="item.id"
                      class="mx-1 mb-0.5 px-1.5 rounded flex items-center gap-1"
                      :style="{ height: '20px', background: idx === 0 ? `${primary}22` : 'transparent' }"
                    >
                      <div class="w-2 h-2 rounded-sm shrink-0" :style="{ background: idx === 0 ? primary : 'rgba(255,255,255,0.15)' }"></div>
                      <div class="h-1.5 rounded-sm flex-1" :style="{ background: idx === 0 ? `${primary}66` : 'rgba(255,255,255,0.08)' }"></div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-for="i in 5" :key="i" class="mx-1 mb-0.5 px-1.5 rounded flex items-center gap-1" style="height:20px">
                      <div class="w-2 h-2 rounded-sm" :style="{ background: i === 1 ? `${primary}33` : 'rgba(255,255,255,0.08)' }"></div>
                      <div class="h-1.5 rounded-sm flex-1" :style="{ background: i === 1 ? `${primary}44` : 'rgba(255,255,255,0.06)' }"></div>
                    </div>
                  </template>
                </div>
                <div class="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden" :style="{ background: background }">
                  <div class="flex gap-1.5">
                    <div v-for="i in 3" :key="i" class="flex-1 rounded p-1.5" :style="{ background: surface, borderRadius: `${radius / 3}px` }">
                      <div class="h-1.5 rounded mb-1" style="width:60%;background:rgba(255,255,255,0.08)"></div>
                      <div class="h-3 rounded" style="width:80%;background:rgba(255,255,255,0.12)"></div>
                    </div>
                  </div>
                  <div class="rounded p-2 flex-1" :style="{ background: surface, borderRadius: `${radius / 3}px`, border: '1px solid rgba(255,255,255,0.06)' }">
                    <div class="h-2 rounded mb-1.5" style="width:40%;background:rgba(255,255,255,0.1)"></div>
                    <div class="h-1.5 rounded mb-1" style="background:rgba(255,255,255,0.06)"></div>
                    <div class="h-1.5 rounded mb-2" style="width:70%;background:rgba(255,255,255,0.06)"></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- none pattern -->
            <template v-else>
              <div class="flex-1 p-2 flex flex-col gap-1.5 overflow-hidden" :style="{ background: background }">
                <div class="flex gap-1.5">
                  <div v-for="i in 3" :key="i" class="flex-1 rounded p-1.5" :style="{ background: surface, borderRadius: `${radius / 3}px` }">
                    <div class="h-1.5 rounded mb-1" style="width:60%;background:rgba(255,255,255,0.08)"></div>
                    <div class="h-3 rounded" style="width:80%;background:rgba(255,255,255,0.12)"></div>
                  </div>
                </div>
                <div class="rounded p-2 flex-1" :style="{ background: surface, borderRadius: `${radius / 3}px`, border: '1px solid rgba(255,255,255,0.06)' }">
                  <div class="h-2 rounded mb-1.5" style="width:40%;background:rgba(255,255,255,0.1)"></div>
                  <div class="h-1.5 rounded mb-1" style="background:rgba(255,255,255,0.06)"></div>
                  <div class="h-1.5 rounded mb-2" style="width:70%;background:rgba(255,255,255,0.06)"></div>
                </div>
              </div>
            </template>

          </div>
        </div>

        <!-- Spec summary -->
        <div class="mt-3 px-1 flex flex-col gap-1">
          <div class="flex justify-between">
            <span class="text-[10px] text-neutral-600">Pattern</span>
            <span class="text-[10px] font-mono text-lime-600">{{ pattern }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[10px] text-neutral-600">Top bar</span>
            <span class="text-[10px] font-mono" :style="{ color: showTopBar ? '#86efac' : '#6b7280' }">
              {{ showTopBar ? (shell?.topBar?.height ?? 48) + 'px' : 'hidden' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[10px] text-neutral-600">Sidebar</span>
            <span class="text-[10px] font-mono" :style="{ color: showSidebar ? '#86efac' : '#6b7280' }">
              {{ showSidebar ? (shell?.sidebar?.width ?? 220) + 'px' : 'hidden' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[10px] text-neutral-600">Nav items</span>
            <span class="text-[10px] font-mono text-neutral-400">{{ sidebarItems.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
