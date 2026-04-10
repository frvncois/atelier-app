<script setup lang="ts">
import { ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseToggle from '@/components/ui/BaseToggle.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import FieldGroup from '@/components/ui/FieldGroup.vue'
import FieldRow from '@/components/ui/FieldRow.vue'

const activeSection = ref('account')

const sections = [
  { id: 'account', label: 'Account' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'billing', label: 'Billing' },
  { id: 'integrations', label: 'Integrations' },
]

const integrations = [
  { abbrev: 'GH', name: 'GitHub', description: 'Sync projects with repositories' },
  { abbrev: 'FG', name: 'Figma', description: 'Import designs as component specs' },
  { abbrev: 'VS', name: 'VS Code', description: 'Open projects directly in your editor' },
]
</script>

<template>
  <AppLayout>
    <div class="flex min-h-full">
      <!-- Left nav -->
      <nav class="w-[200px] shrink-0 border-r border-white/[0.07] p-4 flex flex-col gap-1">
        <button
          v-for="s in sections"
          :key="s.id"
          @click="activeSection = s.id"
          class="w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
          :class="activeSection === s.id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'"
        >{{ s.label }}</button>
      </nav>

      <!-- Right content -->
      <div class="flex-1 px-10 py-8 max-w-[560px]">

        <!-- Account -->
        <template v-if="activeSection === 'account'">
          <h2 class="text-base font-semibold text-neutral-100 mb-6">Account</h2>
          <FieldGroup label="Profile">
            <FieldRow label="Name">
              <BaseInput model-value="Jane Smith" placeholder="Your name" />
            </FieldRow>
            <FieldRow label="Email">
              <BaseInput model-value="jane@example.com" placeholder="you@example.com" />
            </FieldRow>
          </FieldGroup>
          <div class="mt-4 flex justify-end">
            <BaseButton label="Save changes" size="sm" />
          </div>
          <div class="mt-10">
            <FieldGroup label="Danger zone">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-neutral-300">Delete account</p>
                  <p class="text-xs text-neutral-600 mt-0.5">This action cannot be undone.</p>
                </div>
                <BaseButton variant="danger" label="Delete account" :icon-before="TrashIcon" size="sm" />
              </div>
            </FieldGroup>
          </div>
        </template>

        <!-- Appearance -->
        <template v-else-if="activeSection === 'appearance'">
          <h2 class="text-base font-semibold text-neutral-100 mb-6">Appearance</h2>
          <FieldGroup label="Editor theme">
            <FieldRow label="Compact mode" hint="Reduces padding in the editor">
              <BaseToggle :model-value="true" />
            </FieldRow>
            <FieldRow label="Component previews" hint="Show visual previews in the editor">
              <BaseToggle :model-value="false" />
            </FieldRow>
            <FieldRow label="Auto-collapse rows" hint="Collapse rows when selecting a component">
              <BaseToggle :model-value="true" />
            </FieldRow>
          </FieldGroup>
        </template>

        <!-- Billing -->
        <template v-else-if="activeSection === 'billing'">
          <h2 class="text-base font-semibold text-neutral-100 mb-6">Billing</h2>
          <BaseCard class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-neutral-100">Pro plan</span>
              <BaseBadge label="Active" variant="accent" />
            </div>
            <p class="text-xs text-neutral-600">Renews on May 1, 2026</p>
          </BaseCard>
          <BaseButton label="Upgrade plan" />
        </template>

        <!-- Integrations -->
        <template v-else>
          <h2 class="text-base font-semibold text-neutral-100 mb-6">Integrations</h2>
          <div
            v-for="integration in integrations"
            :key="integration.name"
            class="flex items-center gap-4 py-4 border-b border-white/[0.07]"
          >
            <div class="w-8 h-8 rounded-md bg-neutral-800 border border-white/[0.07] flex items-center justify-center text-xs font-bold text-neutral-400">
              {{ integration.abbrev }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-neutral-200">{{ integration.name }}</p>
              <p class="text-xs text-neutral-600">{{ integration.description }}</p>
            </div>
            <BaseButton variant="outline" label="Connect" size="sm" />
          </div>
        </template>

      </div>
    </div>
  </AppLayout>
</template>
