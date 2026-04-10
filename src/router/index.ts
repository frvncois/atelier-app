import { createRouter, createWebHistory } from 'vue-router'
import LandingView   from '@/views/LandingView.vue'
import AuthView      from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import EditorView    from '@/views/EditorView.vue'
import SettingsView  from '@/views/SettingsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',              name: 'landing',      component: LandingView },
    { path: '/login',         name: 'login',        component: AuthView },
    { path: '/signup',        name: 'signup',       component: AuthView },
    { path: '/dashboard',     name: 'dashboard',    component: DashboardView, meta: { requiresAuth: true } },
    { path: '/editor',        name: 'guest-editor', component: EditorView },
    { path: '/project/:id',   name: 'editor',       component: EditorView, meta: { requiresAuth: true } },
    { path: '/settings',      name: 'settings',     component: SettingsView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
