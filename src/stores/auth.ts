import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoggedIn = computed(() => user.value !== null)
  const loading = ref(true)

  function mapUser(supabaseUser: User, profile?: { name?: string }): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: profile?.name ?? supabaseUser.email?.split('@')[0] ?? '',
    }
  }

  async function init(): Promise<void> {
    loading.value = true

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single()
      user.value = mapUser(session.user, profile ?? undefined)
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
        user.value = mapUser(session.user, profile ?? undefined)
      } else {
        user.value = null
      }
    })

    loading.value = false
  }

  async function login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signup(email: string, password: string, name: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut()
    user.value = null
  }

  async function updateProfile(patch: { name?: string; avatar_url?: string }): Promise<void> {
    if (!user.value) return
    const { error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.value.id)
    if (error) throw new Error(error.message)
    if (patch.name) user.value = { ...user.value, name: patch.name }
  }

  init()

  return { user, isLoggedIn, loading, login, signup, logout, updateProfile }
})
