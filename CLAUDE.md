# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Type-check + build for production (parallel)
npm run build-only   # Build without type-checking
npm run type-check   # Run vue-tsc type checking only
npm run preview      # Preview production build locally
```

No test or lint scripts are currently configured.

## Architecture

Vue 3 SPA using Composition API throughout.

**Stack:** Vue 3 + Vite + TypeScript + Vue Router 5 + Pinia

**Bootstrap flow:** `index.html` → `src/main.ts` (creates app, registers Pinia + Router, mounts to `#app`) → `src/App.vue` (renders `<RouterView />`)

**Key conventions:**
- Use `@/` alias for imports from `src/` (e.g. `import Foo from '@/components/Foo.vue'`)
- Stores live in `src/stores/`, use Pinia Composition API style (see `counter.ts` for reference)
- Views (routed pages) in `src/views/`, reusable components in `src/components/`
- Routes are registered in `src/router/index.ts`

**TypeScript:** Strict mode with `noUncheckedIndexedAccess`. Two tsconfig targets: `tsconfig.app.json` (browser/Vue code) and `tsconfig.node.json` (Vite config and tooling).

**Node requirement:** `^20.19.0 || >=22.12.0`
