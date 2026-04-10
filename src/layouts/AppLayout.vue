<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
    <header class="h-14 border-b border-white/[0.07] flex items-center px-6 gap-3 shrink-0 sticky top-0 z-10 bg-neutral-950">
      <!-- Logo -->
      <div class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold">A</div>
      <span class="text-sm font-semibold text-neutral-100">Atelier</span>

      <!-- Right side -->
      <div class="ml-auto flex items-center gap-3">
        <RouterLink to="/settings">
          <Cog6ToothIcon class="size-4 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer" />
        </RouterLink>
        <div class="w-7 h-7 rounded-full bg-sky-400/20 border border-sky-400/20 flex items-center justify-center text-xs font-medium text-sky-400">J</div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
