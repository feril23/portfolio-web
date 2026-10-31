import { isMotionReduced } from "./motionPreference.js"

const easeOutQuart = (t) => 1 - (1 - t) ** 4

// In-page scrolling goes through Lenis so links share the wheel's easing.
export function scrollToElement(element, { immediate = false } = {}) {
  if (!element) return
  const reduced = isMotionReduced()
  const lenis = window.__lenis
  if (lenis && !reduced) {
    lenis.start()
    lenis.scrollTo(element, { duration: 1.25, easing: easeOutQuart, immediate, force: true })
  } else {
    element.scrollIntoView({ behavior: immediate || reduced ? "auto" : "smooth" })
  }
}
