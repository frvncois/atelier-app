import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Project, Framework } from '@/types'
import { createProject } from '@/utils/factories'

const GUEST_KEY = 'atelier_guest_project'

export const useGuestStore = defineStore('guest', () => {
  const project = ref<Project | null>(null)
  const hasProject = computed(() => project.value !== null)

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(GUEST_KEY)
      if (raw) project.value = JSON.parse(raw) as Project
    } catch {
      project.value = null
    }
  }

  function initProject(name = 'My project', framework: Framework = 'vue3'): Project {
    const p = createProject(name, framework)
    project.value = p
    return p
  }

  function updateProject(patch: Partial<Project>): void {
    if (!project.value) return
    project.value = {
      ...project.value,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
  }

  function clearProject(): void {
    project.value = null
    localStorage.removeItem(GUEST_KEY)
  }

  watch(project, (val) => {
    if (val) localStorage.setItem(GUEST_KEY, JSON.stringify(val))
  }, { deep: true })

  loadFromStorage()

  return { project, hasProject, loadFromStorage, initProject, updateProject, clearProject }
})
