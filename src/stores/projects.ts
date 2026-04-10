import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { createProject as makeProject } from '@/utils/factories'
import { deepClone } from '@/utils/clone'
import type { Project, Framework } from '@/types'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const activeProjectId = ref<string | null>(null)
  const loading = ref(false)

  const activeProject = computed(() =>
    projects.value.find(p => p.id === activeProjectId.value)
  )

  const sortedProjects = computed(() =>
    [...projects.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  // ─── Fetch all projects for the current user ──────────────────
  async function fetchProjects(): Promise<void> {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, framework, owner_id, created_at, updated_at')
        .order('updated_at', { ascending: false })

      if (error) throw error

      projects.value = (data ?? []).map(row => ({
        id: row.id,
        name: row.name,
        framework: row.framework as Framework,
        ownerId: row.owner_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        shell: {} as any,
        views: [],
        theme: {} as any,
        schemas: [],
        actions: [],
      }))
    } finally {
      loading.value = false
    }
  }

  // ─── Load full project content ────────────────────────────────
  async function loadProjectContent(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('project_content')
      .select('shell, views, theme, schemas, actions')
      .eq('project_id', id)
      .single()

    if (error || !data) return

    const idx = projects.value.findIndex(p => p.id === id)
    if (idx === -1) return

    projects.value[idx] = {
      ...projects.value[idx]!,
      shell: data.shell,
      views: data.views,
      theme: data.theme,
      schemas: data.schemas,
      actions: data.actions,
    }
  }

  // ─── Create project ──────────────────────────────────────────
  async function createProject(name: string, framework: Framework): Promise<Project> {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('Not authenticated')

    const local = makeProject(name, framework)

    const { data: projRow, error: projError } = await supabase
      .from('projects')
      .insert({ id: local.id, name, framework, owner_id: authStore.user.id })
      .select()
      .single()

    if (projError) throw projError

    const { error: contentError } = await supabase
      .from('project_content')
      .insert({
        project_id: local.id,
        shell: local.shell,
        views: local.views,
        theme: local.theme,
        schemas: local.schemas,
        actions: local.actions,
      })

    if (contentError) throw contentError

    const project: Project = {
      ...local,
      ownerId: authStore.user.id,
      createdAt: projRow.created_at,
      updatedAt: projRow.updated_at,
    }

    projects.value.unshift(project)
    activeProjectId.value = project.id
    return project
  }

  // ─── Update project ──────────────────────────────────────────
  async function updateProject(id: string, patch: Partial<Project>): Promise<void> {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx === -1) return

    const now = new Date().toISOString()
    projects.value[idx] = { ...projects.value[idx]!, ...patch, updatedAt: now }

    const metaFields: Record<string, unknown> = {}
    const contentFields: Record<string, unknown> = {}

    if (patch.name !== undefined)      metaFields.name = patch.name
    if (patch.framework !== undefined) metaFields.framework = patch.framework
    if (patch.shell !== undefined)     contentFields.shell = patch.shell
    if (patch.views !== undefined)     contentFields.views = patch.views
    if (patch.theme !== undefined)     contentFields.theme = patch.theme
    if (patch.schemas !== undefined)   contentFields.schemas = patch.schemas
    if (patch.actions !== undefined)   contentFields.actions = patch.actions

    const ops: PromiseLike<unknown>[] = []

    if (Object.keys(metaFields).length > 0) {
      ops.push(supabase.from('projects').update(metaFields).eq('id', id))
    }

    if (Object.keys(contentFields).length > 0) {
      ops.push(
        supabase.from('project_content').update(contentFields).eq('project_id', id)
      )
    }

    await Promise.all(ops)
  }

  // ─── Update local only (used by Realtime handler) ─────────────
  function updateProjectLocal(id: string, patch: Partial<Project>): void {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx === -1) return
    projects.value[idx] = { ...projects.value[idx]!, ...patch }
  }

  // ─── Delete project ──────────────────────────────────────────
  async function deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    projects.value = projects.value.filter(p => p.id !== id)
    if (activeProjectId.value === id) activeProjectId.value = null
  }

  // ─── Duplicate project ───────────────────────────────────────
  async function duplicateProject(id: string): Promise<Project> {
    const original = projects.value.find(p => p.id === id)
    if (!original) throw new Error('Project not found')

    const copy = deepClone(original)
    const created = await createProject(`${original.name} (copy)`, copy.framework)
    // Copy content from original
    await updateProject(created.id, {
      shell: copy.shell,
      views: copy.views,
      theme: copy.theme,
      schemas: copy.schemas,
      actions: copy.actions,
    })
    return created
  }

  // ─── Set active project ──────────────────────────────────────
  function setActiveProject(id: string): void {
    activeProjectId.value = id
  }

  return {
    projects,
    activeProjectId,
    activeProject,
    sortedProjects,
    loading,
    fetchProjects,
    loadProjectContent,
    createProject,
    updateProject,
    updateProjectLocal,
    deleteProject,
    duplicateProject,
    setActiveProject,
  }
})
