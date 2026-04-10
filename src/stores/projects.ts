import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Project, Framework } from '@/types'
import { createProject as makeProject, createView, createRow, createComponent } from '@/utils/factories'
import { deepClone } from '@/utils/clone'

const STORAGE_KEY = 'atelier_projects'

function makeSeedProjects(): Project[] {
  // Seed 1: Admin Dashboard (vue3)
  const p1 = makeProject('Admin Dashboard', 'vue3')
  // Override dates so they appear "2 days ago"
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  p1.createdAt = twoDaysAgo
  p1.updatedAt = twoDaysAgo

  // Add views/rows/components
  const dashboard = createView('Dashboard', 0)
  const statsRow = createRow('Stats', 0)
  statsRow.components.push(
    createComponent('UiStats', 'Revenue', 0),
    createComponent('UiStats', 'Users', 1),
    createComponent('UiStats', 'Orders', 2),
  )
  const tableRow = createRow('Recent orders', 1)
  tableRow.components.push(createComponent('UiTable', 'Orders table', 0))
  dashboard.rows.push(statsRow, tableRow)

  const usersView = createView('Users', 1)
  const usersRow = createRow('User list', 0)
  usersRow.components.push(createComponent('UiTable', 'Users table', 0))
  usersView.rows.push(usersRow)

  const settingsView = createView('Settings', 2)
  const settingsRow = createRow('Profile', 0)
  settingsRow.components.push(createComponent('UiForm', 'Profile form', 0))
  settingsView.rows.push(settingsRow)

  p1.views = [dashboard, usersView, settingsView]

  // Seed 2: Marketing Site (nuxt)
  const p2 = makeProject('Marketing Site', 'nuxt')
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  p2.createdAt = fiveDaysAgo
  p2.updatedAt = fiveDaysAgo

  const heroView = createView('Landing', 0)
  const heroRow = createRow('Hero', 0)
  heroRow.components.push(createComponent('UiCard', 'Hero block', 0))
  heroView.rows.push(heroRow)
  const featuresView = createView('Features', 1)
  const pricingView = createView('Pricing', 2)
  const blogView = createView('Blog', 3)
  const contactView = createView('Contact', 4)
  p2.views = [heroView, featuresView, pricingView, blogView, contactView]

  // Seed 3: Mobile App (react)
  const p3 = makeProject('Mobile App', 'react')
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  p3.createdAt = weekAgo
  p3.updatedAt = weekAgo

  const homeView = createView('Home', 0)
  const profileView = createView('Profile', 1)
  const feedView = createView('Feed', 2)
  const searchView = createView('Search', 3)
  p3.views = [homeView, profileView, feedView, searchView]

  return [p1, p2, p3]
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const activeProjectId = ref<string | null>(null)

  const activeProject = computed(() =>
    projects.value.find(p => p.id === activeProjectId.value)
  )

  const sortedProjects = computed(() =>
    [...projects.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  function loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        projects.value = JSON.parse(raw) as Project[]
      } else {
        projects.value = makeSeedProjects()
        saveToStorage()
      }
    } catch {
      projects.value = makeSeedProjects()
    }
  }

  function saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
  }

  function createProject(name: string, framework: Framework): Project {
    const project = makeProject(name, framework)
    projects.value.unshift(project)
    activeProjectId.value = project.id
    saveToStorage()
    return project
  }

  function updateProject(id: string, patch: Partial<Project>): void {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx === -1) return
    projects.value[idx] = {
      ...projects.value[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as Project
    saveToStorage()
  }

  function deleteProject(id: string): void {
    projects.value = projects.value.filter(p => p.id !== id)
    if (activeProjectId.value === id) activeProjectId.value = null
    saveToStorage()
  }

  function duplicateProject(id: string): Project {
    const original = projects.value.find(p => p.id === id)
    if (!original) throw new Error(`Project ${id} not found`)
    const copy = deepClone(original)
    copy.id = crypto.randomUUID()
    copy.name = `${original.name} (copy)`
    const now = new Date().toISOString()
    copy.createdAt = now
    copy.updatedAt = now
    projects.value.unshift(copy)
    saveToStorage()
    return copy
  }

  function setActiveProject(id: string): void {
    activeProjectId.value = id
  }

  // Auto-save on deep change
  watch(projects, saveToStorage, { deep: true })

  // Load on store init
  loadFromStorage()

  return {
    projects,
    activeProjectId,
    activeProject,
    sortedProjects,
    loadFromStorage,
    saveToStorage,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    setActiveProject,
  }
})
