import { createRouter, createWebHistory } from 'vue-router'
import LandingView     from '@/views/LandingView.vue'
import ProjectListView from '@/views/ProjectListView.vue'
import EditorView      from '@/views/EditorView.vue'
import SettingsView    from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',              name: 'landing',  component: LandingView },
    { path: '/projects',      name: 'projects', component: ProjectListView },
    { path: '/project/:id',   name: 'editor',   component: EditorView },
    { path: '/settings',      name: 'settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/projects' },
  ],
})

export default router
