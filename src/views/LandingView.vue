<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton, BaseBadge } from '@/components/ui'
import { BoltIcon, ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const features = [
  {
    icon: BoltIcon,
    title: 'No friction',
    desc: 'Start speccing instantly. No account, no setup. Export your entire app structure whenever you\'re ready.',
  },
  {
    icon: ArrowDownTrayIcon,
    title: 'Import from any codebase',
    desc: 'Point your AI assistant at an existing project. Atelier generates the import prompt — paste it back to sync your schema.',
  },
  {
    icon: DocumentTextIcon,
    title: 'AI-ready output',
    desc: 'Six structured markdown files. LLMs and IDEs understand them immediately. Drop them into Cursor, Windsurf, or Claude Code.',
  },
]

const steps = [
  { num: '01', title: 'Spec it', desc: 'Define your views, components, data schemas, and shell — visually.' },
  { num: '02', title: 'Export it', desc: 'Generate AI-ready markdown in one click. No account needed.' },
  { num: '03', title: 'Build it', desc: 'Paste the output into your LLM IDE. Let it build.' },
]

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="bg-neutral-950 min-h-screen text-neutral-100">

    <!-- Nav -->
    <nav class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-8 gap-4 bg-neutral-950/80 backdrop-blur border-b border-white/[0.07]">
      <div class="flex items-center gap-2.5 flex-1">
        <div class="w-6 h-6 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-xs font-bold select-none">A</div>
        <span class="text-sm font-semibold text-neutral-100">Atelier</span>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton label="Log in" variant="ghost" size="sm" @click="router.push('/login')" />
        <BaseButton label="Get started free" size="sm" @click="router.push('/editor')" />
      </div>
    </nav>

    <!-- Hero -->
    <section class="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-14 relative overflow-hidden">
      <!-- Lime glow -->
      <div style="position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(200,240,74,0.06) 0%,transparent 70%);pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%)" aria-hidden="true"></div>

      <div class="relative max-w-[680px] mx-auto">
        <div class="mb-6">
          <BaseBadge label="Now in beta" variant="accent" size="md" />
        </div>
        <h1 class="text-5xl sm:text-6xl font-semibold tracking-tight text-neutral-100 leading-tight mb-5">
          Spec your app.<br />Export to code.
        </h1>
        <p class="text-lg text-neutral-400 max-w-lg mx-auto mb-8 leading-relaxed">
          Build your app structure visually. Atelier turns views, components, and data schemas into AI-ready markdown your IDE can build from — no account needed.
        </p>
        <div class="flex items-center gap-3 justify-center">
          <BaseButton label="Start building free" size="lg" @click="router.push('/editor')" />
          <BaseButton label="See how it works" variant="outline" size="lg" @click="scrollToFeatures" />
        </div>
        <p class="mt-4 text-xs text-neutral-600">No account required · Export anytime · Works with any LLM IDE</p>
      </div>

      <!-- App screenshot mockup -->
      <div class="mt-16 w-full max-w-4xl mx-auto px-4 relative">
        <div class="w-full rounded-xl overflow-hidden border border-white/[0.12] bg-neutral-900 shadow-2xl">
          <!-- Browser chrome -->
          <div class="h-9 bg-neutral-800 border-b border-white/[0.07] flex items-center px-4 gap-2">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-neutral-600"></div>
              <div class="w-3 h-3 rounded-full bg-neutral-600"></div>
              <div class="w-3 h-3 rounded-full bg-neutral-600"></div>
            </div>
            <div class="flex-1 bg-neutral-700 rounded h-5 mx-4 flex items-center px-3">
              <span class="text-[10px] text-neutral-500">atelier.app/editor</span>
            </div>
          </div>
          <!-- Editor chrome -->
          <div style="height:400px;display:flex;flex-direction:column;">
            <!-- Top bar -->
            <div class="h-12 border-b border-white/[0.07] flex items-center px-4 gap-3 bg-neutral-900 shrink-0">
              <div class="w-5 h-5 bg-lime-400 rounded flex items-center justify-center text-neutral-950 text-[10px] font-bold">A</div>
              <div class="w-px h-4 bg-white/[0.07]"></div>
              <div class="h-5 px-2 rounded border border-white/[0.07] bg-neutral-800 text-[10px] text-neutral-400 flex items-center">My project</div>
              <div class="ml-3 flex gap-1">
                <div v-for="label in ['Layout','Views','Theme','Data']" :key="label" class="px-3 py-1 rounded-md text-[10px]" :class="label === 'Views' ? 'bg-neutral-700 text-neutral-100' : 'text-neutral-500'">{{ label }}</div>
              </div>
              <div class="ml-auto flex gap-2">
                <div class="h-6 px-3 rounded bg-lime-400 text-neutral-950 text-[10px] font-medium flex items-center">Export</div>
              </div>
            </div>
            <!-- Body -->
            <div class="flex flex-1 overflow-hidden">
              <!-- Left sidebar -->
              <div class="w-[200px] border-r border-white/[0.07] p-2 flex flex-col gap-1 shrink-0">
                <div v-for="(view, i) in ['Dashboard','Users','Settings']" :key="view" class="px-2.5 py-2 rounded-md text-[10px]" :class="i === 0 ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-500'">
                  <div class="flex items-center justify-between">
                    <span>{{ view }}</span>
                    <span class="text-neutral-600">{{ [3,2,1][i] }}</span>
                  </div>
                </div>
              </div>
              <!-- Center -->
              <div class="flex-1 p-4 flex flex-col gap-3 overflow-hidden bg-neutral-950">
                <div v-for="row in ['Stats row', 'Table row']" :key="row" class="bg-neutral-900 border border-white/[0.07] rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] text-neutral-500">{{ row }}</span>
                  </div>
                  <div class="flex gap-2">
                    <div v-for="i in (row === 'Stats row' ? 3 : 1)" :key="i" class="flex-1 bg-neutral-800 rounded p-2 h-10"></div>
                  </div>
                </div>
              </div>
              <!-- Right panel -->
              <div class="w-[220px] border-l border-white/[0.07] p-3 flex flex-col gap-2 shrink-0">
                <div class="h-4 bg-neutral-800 rounded w-3/4"></div>
                <div v-for="i in 4" :key="i" class="flex justify-between items-center">
                  <div class="h-2.5 bg-neutral-800 rounded w-1/3"></div>
                  <div class="h-5 bg-neutral-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Fade gradient -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(to bottom,transparent,#0a0a0a);pointer-events:none"></div>
      </div>
    </section>

    <!-- Features section -->
    <section id="features" class="py-24 px-6 max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-xs font-medium text-lime-600 uppercase tracking-widest mb-3">Why Atelier</p>
        <h2 class="text-3xl font-semibold text-neutral-100 tracking-tight mb-4">From spec to code, faster</h2>
        <p class="text-neutral-400 max-w-xl mx-auto">Stop writing documentation nobody reads. Atelier generates structured specs that AI tools can act on immediately.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="f in features" :key="f.title" class="bg-neutral-900 border border-white/[0.07] rounded-xl p-6">
          <div class="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center mb-4">
            <component :is="f.icon" class="size-4 text-lime-400" />
          </div>
          <h3 class="text-sm font-semibold text-neutral-100 mb-2">{{ f.title }}</h3>
          <p class="text-sm text-neutral-500 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-6 max-w-3xl mx-auto text-center">
      <p class="text-xs font-medium text-lime-600 uppercase tracking-widest mb-3">How it works</p>
      <h2 class="text-3xl font-semibold text-neutral-100 tracking-tight mb-16">Three steps to ship faster</h2>
      <div class="grid grid-cols-3 gap-8">
        <div v-for="step in steps" :key="step.num" class="flex flex-col items-center">
          <div class="text-5xl font-semibold text-neutral-800 mb-3">{{ step.num }}</div>
          <h3 class="text-sm font-medium text-neutral-300 mb-2">{{ step.title }}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 px-6 text-center">
      <h2 class="text-3xl font-semibold text-neutral-100 mb-4">Ready to start?</h2>
      <p class="text-neutral-400 mb-8">No account needed. Start building in seconds.</p>
      <BaseButton label="Start building free" size="lg" @click="router.push('/editor')" />
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/[0.07] py-8 px-8 flex items-center justify-between text-xs text-neutral-600">
      <span>© 2025 Atelier</span>
      <div class="flex gap-4">
        <span class="cursor-pointer hover:text-neutral-400 transition-colors" @click="router.push('/login')">Log in</span>
        <span class="cursor-pointer hover:text-neutral-400 transition-colors" @click="router.push('/settings')">Settings</span>
      </div>
    </footer>

  </div>
</template>
