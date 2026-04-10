<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { BaseButton, BaseInput, BaseDivider, BaseBadge, BaseModal } from '@/components/ui'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useGuestStore } from '@/stores/guest'
import { useProjectStore } from '@/stores/projects'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const guestStore = useGuestStore()
const projectStore = useProjectStore()

const mode = computed(() => route.name === 'signup' ? 'signup' : 'login')

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')
const loading = ref(false)
const showSaveGuestModal = ref(false)
const pendingRedirect = ref('/dashboard')
const signupSuccess = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
      const redirect = (route.query.redirect as string) ?? '/dashboard'
      pendingRedirect.value = redirect
      if (guestStore.hasProject) {
        showSaveGuestModal.value = true
      } else {
        router.push(redirect)
      }
    } else {
      await authStore.signup(email.value, password.value, name.value)
      signupSuccess.value = true
    }
  } catch (e: any) {
    error.value = (e as Error).message ?? 'Something went wrong'
  } finally {
    loading.value = false
  }
}

function discardGuest() {
  guestStore.clearProject()
  router.push(pendingRedirect.value)
}

const saving = ref(false)

async function saveGuestProject() {
  if (!guestStore.project) {
    router.push(pendingRedirect.value)
    return
  }
  saving.value = true
  try {
    const newProject = await projectStore.createProject(
      guestStore.project.name,
      guestStore.project.framework,
    )
    await projectStore.updateProject(newProject.id, {
      shell: guestStore.project.shell,
      views: guestStore.project.views,
      theme: guestStore.project.theme,
      schemas: guestStore.project.schemas,
      actions: guestStore.project.actions,
    })
    guestStore.clearProject()
    router.push({ name: 'editor', params: { id: newProject.id } })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">

      <!-- Card -->
      <div class="bg-neutral-900 border border-white/[0.07] rounded-2xl p-8">

        <!-- Logo -->
        <div class="flex items-center justify-center gap-2.5 mb-8">
          <div class="w-7 h-7 bg-lime-400 rounded-md flex items-center justify-center text-neutral-950 text-sm font-bold">A</div>
          <span class="text-base font-semibold text-neutral-100">Atelier</span>
        </div>

        <!-- Heading -->
        <h1 class="text-xl font-semibold text-neutral-100 text-center mb-1">
          {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
        </h1>
        <p class="text-sm text-neutral-500 text-center mb-6">
          {{ mode === 'login' ? 'Sign in to access your saved projects' : 'Save and sync projects across devices' }}
        </p>

        <!-- Signup success state -->
        <div v-if="signupSuccess" class="text-center py-4">
          <CheckCircleIcon class="size-10 text-lime-400 mx-auto mb-4" />
          <p class="text-sm font-medium text-neutral-100 mb-2">Check your email</p>
          <p class="text-xs text-neutral-500">
            We sent a confirmation link to <strong>{{ email }}</strong>.<br/>
            Click it to activate your account.
          </p>
        </div>

        <!-- Form -->
        <template v-else>
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
            <BaseInput
              v-if="mode === 'signup'"
              v-model="name"
              label="Name"
              placeholder="Your name"
            />
            <BaseInput
              v-model="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
            />
            <BaseInput
              v-model="password"
              label="Password"
              type="password"
              placeholder="••••••••"
            />

            <p v-if="error" class="text-xs text-red-400 mt-1">{{ error }}</p>

            <BaseButton
              type="submit"
              :label="mode === 'login' ? 'Sign in' : 'Create account'"
              :loading="loading"
              class="w-full mt-2"
            />
          </form>

          <!-- Toggle -->
          <p class="text-xs text-neutral-500 text-center mt-4">
            <template v-if="mode === 'login'">
              Don't have an account?
              <RouterLink to="/signup" class="text-lime-600 hover:text-lime-400 transition-colors">Sign up</RouterLink>
            </template>
            <template v-else>
              Already have an account?
              <RouterLink to="/login" class="text-lime-600 hover:text-lime-400 transition-colors">Log in</RouterLink>
            </template>
          </p>

          <BaseDivider label="or" class="my-4" />

          <button
            type="button"
            class="text-xs text-neutral-600 hover:text-neutral-400 text-center cursor-pointer block w-full transition-colors"
            @click="router.push({ name: 'guest-editor' })"
          >
            Continue without an account →
          </button>
        </template>
      </div>
    </div>

    <!-- Save guest project modal -->
    <BaseModal
      :open="showSaveGuestModal"
      title="Save your project?"
      size="sm"
      @close="discardGuest"
    >
      <div class="px-5 py-4">
        <p class="text-sm text-neutral-300 mb-3">
          You have an unsaved guest project. Would you like to save it to your account?
        </p>
        <BaseBadge :label="guestStore.project?.name ?? 'My project'" variant="default" size="md" />
      </div>
      <template #footer>
        <div class="flex gap-2 px-5 pb-4">
          <BaseButton label="Discard" variant="ghost" size="sm" class="flex-1" @click="discardGuest" />
          <BaseButton label="Save project" variant="default" size="sm" class="flex-1" @click="saveGuestProject" />
        </div>
      </template>
    </BaseModal>
  </div>
</template>
