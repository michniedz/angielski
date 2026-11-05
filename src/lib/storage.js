const PROGRESS_KEY = 'angielski-app:progress:v2'

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // np. tryb prywatny lub brak miejsca — aplikacja nadal działa w pamięci
  }
}

export function loadProgress() {
  const value = read(PROGRESS_KEY, {})
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function saveProgress(progress) {
  write(PROGRESS_KEY, progress)
}

export function makeWordKey(word) {
  const section = word.sectionId || 'all'
  return `${word.classId}/${word.unitId}/${section}/${String(word.en).toLowerCase().trim()}`
}
