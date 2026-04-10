<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseModal, BaseButton, BaseTextarea } from '@/components/ui'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'
import { generateImportPrompt } from '@/utils/importPrompt'
import { buildProjectFromSchema } from '@/utils/importConverter'
import { supabase } from '@/lib/supabase'
import { useProjectStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import type { Project } from '@/types'
import type { AtelierImportSchema } from '@/types/import'

const emit = defineEmits<{
  close: []
  imported: [project: Project]
}>()

const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()

const step = ref<1 | 2 | 3>(1)
const importToken = ref<string | null>(null)
const pastedJson = ref('')
const parseError = ref('')
const importing = ref(false)
const copied = ref(false)
const importedProject = ref<Project | null>(null)
let pollChannel: ReturnType<typeof supabase.channel> | null = null

const importUrl = computed(() =>
  importToken.value
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-receive/${importToken.value}`
    : ''
)
const prompt = computed(() => generateImportPrompt(importUrl.value))

async function generateToken(): Promise<void> {
  if (!authStore.user) return
  const { data, error } = await supabase
    .from('import_tokens')
    .insert({ user_id: authStore.user.id })
    .select('id')
    .single()
  if (error || !data) return
  importToken.value = data.id
}

async function copyPrompt() {
  await navigator.clipboard.writeText(prompt.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function startPolling(): void {
  if (!importToken.value) return

  pollChannel = supabase
    .channel(`import_token:${importToken.value}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'import_tokens',
        filter: `id=eq.${importToken.value}`,
      },
      (payload) => {
        const row = payload.new as any
        if (row.status === 'received' && row.payload) {
          processSchema(row.payload as AtelierImportSchema)
        }
      }
    )
    .subscribe()
}

function stopPolling(): void {
  pollChannel?.unsubscribe()
  pollChannel = null
}

async function processSchema(schema: AtelierImportSchema): Promise<void> {
  stopPolling()
  try {
    const local = buildProjectFromSchema(schema)
    const saved = await projectStore.createProject(local.name, local.framework)
    await projectStore.updateProject(saved.id, {
      shell: local.shell,
      views: local.views,
      theme: local.theme,
      schemas: local.schemas,
      actions: local.actions,
    })
    const project: Project = { ...saved, shell: local.shell, views: local.views, theme: local.theme, schemas: local.schemas, actions: local.actions }
    importedProject.value = project
    emit('imported', project)
    step.value = 3
    if (importToken.value) {
      await supabase.from('import_tokens').update({ status: 'processed' }).eq('id', importToken.value)
    }
  } catch {
    parseError.value = 'The AI response was not a valid Atelier schema.'
  }
}

async function handleImport() {
  parseError.value = ''
  importing.value = true
  try {
    const raw = JSON.parse(pastedJson.value) as AtelierImportSchema
    await processSchema(raw)
  } catch {
    parseError.value = 'Invalid JSON — make sure you copied the full response from your AI.'
  } finally {
    importing.value = false
  }
}

function advanceToStep2(): void {
  step.value = 2
  startPolling()
}

function openProject() {
  if (!importedProject.value) return
  router.push({ name: 'editor', params: { id: importedProject.value.id } })
  emit('close')
}

const viewCount = computed(() => importedProject.value?.views.length ?? 0)
const componentCount = computed(() => {
  let count = 0
  for (const view of importedProject.value?.views ?? []) {
    for (const row of view.rows) count += row.components.length
  }
  return count
})
const schemaCount = computed(() => importedProject.value?.schemas.length ?? 0)

onMounted(() => generateToken())
onUnmounted(() => stopPolling())
</script>

<template>
  <BaseModal
    :open="true"
    :title="step === 1 ? 'Import from codebase' : step === 2 ? 'Waiting for response' : 'Import successful'"
    :size="step === 3 ? 'sm' : 'lg'"
    @close="emit('close')"
  >

    <!-- Step 1: Copy prompt -->
    <div v-if="step === 1" class="px-5 py-4">
      <div class="mb-4">
        <p class="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">Step 1 of 2 — Copy this prompt into your LLM IDE</p>
        <div class="flex flex-col gap-2 text-sm text-neutral-400 mb-4">
          <p>1. Open Cursor, Claude Code, Windsurf, or any AI IDE</p>
          <p>2. Open your project's codebase</p>
          <p>3. Paste this prompt into the AI chat</p>
          <p>4. The AI will analyze your project and return the schema</p>
        </div>
        <pre class="font-mono text-xs text-neutral-300 bg-neutral-950 rounded-lg p-4 max-h-48 overflow-y-auto whitespace-pre-wrap border border-white/[0.07]">{{ prompt }}</pre>
      </div>
      <div class="flex items-center gap-2 mb-4 p-3 bg-neutral-800 rounded-lg border border-white/[0.07]">
        <span class="text-[10px] text-neutral-600">Import URL:</span>
        <span class="font-mono text-[10px] text-sky-400 flex-1 truncate">{{ importUrl || 'Generating…' }}</span>
      </div>
    </div>

    <!-- Step 2: Waiting / manual paste -->
    <div v-else-if="step === 2" class="px-5 py-4 flex flex-col gap-4">
      <p class="text-xs font-medium text-neutral-400 uppercase tracking-widest">Step 2 of 2 — Waiting for your AI's response</p>

      <!-- Listening indicator -->
      <div class="p-3 bg-neutral-800 rounded-lg border border-white/[0.07] flex flex-col gap-1">
        <p class="text-[10px] text-neutral-600">Listening at:</p>
        <p class="font-mono text-[10px] text-sky-400">{{ importUrl }}</p>
        <div class="flex items-center gap-2 mt-1">
          <div class="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
          <span class="text-[10px] text-neutral-500">Waiting for response…</span>
        </div>
      </div>

      <!-- Manual paste fallback -->
      <div>
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 h-px bg-white/[0.07]"></div>
          <span class="text-[10px] text-neutral-600">or paste manually</span>
          <div class="flex-1 h-px bg-white/[0.07]"></div>
        </div>
        <BaseTextarea
          v-model="pastedJson"
          placeholder="Paste the JSON response from your AI here..."
          :rows="8"
        />
        <p v-if="parseError" class="text-xs text-red-400 mt-2">{{ parseError }}</p>
      </div>
    </div>

    <!-- Step 3: Success -->
    <div v-else class="px-5 py-6 flex flex-col items-center text-center gap-4">
      <CheckCircleIcon class="size-12 text-lime-400" />
      <div>
        <h3 class="text-base font-semibold text-neutral-100 mb-1">Import successful</h3>
        <p class="text-sm text-neutral-400">
          "{{ importedProject?.name }}" has been imported.
        </p>
        <p class="text-xs text-neutral-600 mt-1">
          {{ viewCount }} views · {{ componentCount }} components · {{ schemaCount }} schemas
        </p>
      </div>
      <BaseButton label="Open project" @click="openProject" />
    </div>

    <template #footer>
      <div v-if="step === 1" class="flex gap-2 px-5 pb-4">
        <BaseButton
          :label="copied ? 'Copied ✓' : 'Copy prompt'"
          :icon-before="ClipboardDocumentIcon"
          variant="outline"
          size="sm"
          class="flex-1"
          @click="copyPrompt"
        />
        <BaseButton
          label="I've pasted it, waiting..."
          variant="default"
          size="sm"
          class="flex-1"
          :disabled="!importToken"
          @click="advanceToStep2"
        />
      </div>
      <div v-else-if="step === 2" class="flex gap-2 px-5 pb-4">
        <BaseButton label="Back" variant="ghost" size="sm" @click="step = 1; stopPolling()" />
        <BaseButton
          label="Import from JSON"
          size="sm"
          :loading="importing"
          :disabled="!pastedJson.trim()"
          class="flex-1"
          @click="handleImport"
        />
      </div>
    </template>

  </BaseModal>
</template>
