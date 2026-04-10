<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { Squares2X2Icon, TableCellsIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const router = useRouter()
</script>

<template>
  <div class="bg-neutral-950 text-neutral-100">

    <!-- Nav -->
    <nav class="h-14 flex items-center px-8 gap-4 border-b border-white/[0.07]">
      <!-- Logo -->
      <div class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold">A</div>
      <span class="text-sm font-semibold text-neutral-100">Atelier</span>

      <!-- Right side -->
      <div class="ml-auto flex items-center gap-3">
        <BaseButton variant="ghost" size="sm" label="Sign in" @click="router.push('/projects')" />
        <BaseButton variant="default" size="sm" label="Get started" @click="router.push('/projects')" />
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-neutral-950">
      <!-- Radial glow -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-[600px] h-[400px] rounded-full bg-lime-400/5 blur-3xl"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center">
        <!-- Pill badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-xs text-lime-600 mb-8">
          <div class="w-1.5 h-1.5 rounded-full bg-lime-400"></div>
          Now in beta
        </div>

        <!-- Headline -->
        <h1 class="text-5xl font-semibold tracking-tight text-neutral-100 max-w-2xl mb-4">
          Spec your app.<br/>Export to code.
        </h1>

        <!-- Subheadline -->
        <p class="text-lg text-neutral-400 max-w-xl mb-8">
          Atelier turns your app structure into AI-ready specs your IDE can build from.
        </p>

        <!-- CTA row -->
        <div class="flex items-center gap-3 mb-16">
          <BaseButton label="Start building" @click="router.push('/projects')" />
          <BaseButton variant="outline" label="See how it works" />
        </div>

        <!-- Editor mockup -->
        <div class="w-full max-w-[860px] h-[320px] bg-neutral-900 border border-white/[0.07] rounded-2xl overflow-hidden relative">
          <!-- Editor top bar -->
          <div class="h-10 bg-neutral-800 border-b border-white/[0.07] flex items-center px-4 gap-2">
            <!-- Window dots -->
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
            </div>
            <!-- Skeleton pills -->
            <div class="flex items-center gap-2 ml-4">
              <div class="h-4 w-16 bg-neutral-700 rounded-full"></div>
              <div class="h-4 w-20 bg-neutral-700 rounded-full"></div>
              <div class="h-4 w-12 bg-neutral-700 rounded-full"></div>
            </div>
          </div>

          <!-- Editor body -->
          <div class="flex h-full">
            <!-- Left sidebar stub -->
            <div class="w-40 border-r border-white/[0.07] p-3 flex flex-col gap-2 shrink-0">
              <div class="h-2 bg-neutral-700 rounded-full w-3/4"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-full"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-5/6"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-2/3"></div>
              <div class="h-2 bg-neutral-700 rounded-full w-3/4 mt-2"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-full"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-4/5"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-3/5"></div>
              <div class="h-2 bg-neutral-800 rounded-full w-full"></div>
            </div>

            <!-- Main area -->
            <div class="flex-1 p-4 grid grid-cols-2 gap-3 content-start">
              <!-- Skeleton card 1 -->
              <div class="bg-neutral-800 rounded-lg border border-white/[0.07] p-3 flex flex-col gap-2">
                <div class="h-2 bg-neutral-700 rounded-full w-1/2"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-full"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-4/5"></div>
              </div>
              <!-- Skeleton card 2 -->
              <div class="bg-neutral-800 rounded-lg border border-white/[0.07] p-3 flex flex-col gap-2">
                <div class="h-2 bg-neutral-700 rounded-full w-2/3"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-full"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-3/4"></div>
              </div>
              <!-- Skeleton card 3 -->
              <div class="bg-neutral-800 rounded-lg border border-white/[0.07] p-3 flex flex-col gap-2">
                <div class="h-2 bg-neutral-700 rounded-full w-3/5"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-full"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-5/6"></div>
              </div>
              <!-- Skeleton card 4 -->
              <div class="bg-neutral-800 rounded-lg border border-white/[0.07] p-3 flex flex-col gap-2">
                <div class="h-2 bg-neutral-700 rounded-full w-1/2"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-full"></div>
                <div class="h-2 bg-neutral-700 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-6 max-w-5xl mx-auto w-full">
      <!-- Label -->
      <p class="text-xs font-medium text-lime-600 uppercase tracking-widest mb-3">Why Atelier</p>

      <!-- Title -->
      <h2 class="text-3xl font-semibold text-neutral-100 mb-16">Built for the spec-first workflow</h2>

      <!-- Feature cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Card 1: Define your shell -->
        <BaseCard padding="lg">
          <BaseBadge variant="accent" label="Shell" size="md" />
          <div class="mt-3 mb-1 flex items-center gap-2">
            <Squares2X2Icon class="size-4 text-lime-400" />
            <h3 class="text-sm font-medium text-neutral-100">Define your shell</h3>
          </div>
          <p class="text-sm text-neutral-400">Set up navigation patterns, brand, and global layout in one place.</p>
        </BaseCard>

        <!-- Card 2: Spec every view -->
        <BaseCard padding="lg">
          <BaseBadge variant="accent" label="Views" size="md" />
          <div class="mt-3 mb-1 flex items-center gap-2">
            <TableCellsIcon class="size-4 text-lime-400" />
            <h3 class="text-sm font-medium text-neutral-100">Spec every view</h3>
          </div>
          <p class="text-sm text-neutral-400">Lay out components row by row, bind data, and define actions.</p>
        </BaseCard>

        <!-- Card 3: Export AI-ready markdown -->
        <BaseCard padding="lg">
          <BaseBadge variant="accent" label="Export" size="md" />
          <div class="mt-3 mb-1 flex items-center gap-2">
            <DocumentTextIcon class="size-4 text-lime-400" />
            <h3 class="text-sm font-medium text-neutral-100">Export AI-ready markdown</h3>
          </div>
          <p class="text-sm text-neutral-400">Get structured markdown files your AI coding assistant can build from.</p>
        </BaseCard>

      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/[0.07] py-8 text-xs text-neutral-600 flex justify-between px-8">
      <span>© 2025 Atelier. All rights reserved.</span>
      <RouterLink to="/settings" class="hover:text-neutral-400 transition-colors">Settings</RouterLink>
    </footer>

  </div>
</template>
