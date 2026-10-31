const STORAGE_KEY = "portfolio-motion"
export const MOTION_EVENT = "portfolio:motion-change"

function systemPrefersReduced() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

export function getMotionPreference() {
  if (typeof window === "undefined") return "full"
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "reduced" || saved === "full") return saved
  } catch {}
  return systemPrefersReduced() ? "reduced" : "full"
}

export function isMotionReduced() {
  if (typeof document !== "undefined" && document.documentElement.dataset.motion) {
    return document.documentElement.dataset.motion === "reduced"
  }
  return getMotionPreference() === "reduced"
}

export function applyMotionPreference(preference = getMotionPreference(), persist = false) {
  const value = preference === "reduced" ? "reduced" : "full"
  if (typeof document !== "undefined") document.documentElement.dataset.motion = value
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, value) } catch {}
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: { preference: value, reduced: value === "reduced" } }))
  }
  return value
}

export function setMotionEnabled(enabled) {
  return applyMotionPreference(enabled ? "full" : "reduced", true)
}

export function initializeMotionPreference() {
  return applyMotionPreference(getMotionPreference(), false)
}
