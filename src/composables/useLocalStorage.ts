import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  let initial: T = defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      initial = JSON.parse(raw) as T
    }
  } catch {
    initial = defaultValue
  }

  const state = ref<T>(initial) as Ref<T>

  watch(
    state,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true },
  )

  return state
}
