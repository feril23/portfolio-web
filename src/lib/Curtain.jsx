"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { registerCurtain } from "./router.jsx"
import { isMotionReduced } from "./motionPreference.js"

// The overlay survives locale-layout remounts because its transient DOM and
// state live at module scope rather than inside the React component instance.
const foldState = { busy: false, awaiting: false, overlay: null }

function buildFold(label, direction) {
  const root = document.createElement("div")
  root.className = `editorial-transition editorial-transition--${direction}`
  root.setAttribute("aria-hidden", "true")
  const preventScroll = (event) => event.preventDefault()
  root.addEventListener("wheel", preventScroll, { passive: false })
  root.addEventListener("touchmove", preventScroll, { passive: false })

  const sheet = document.createElement("div")
  sheet.className = "editorial-transition-sheet"

  const frame = document.createElement("div")
  frame.className = "editorial-transition-frame"

  const meta = document.createElement("div")
  meta.className = "editorial-transition-meta"
  const marker = document.createElement("span")
  marker.className = "editorial-transition-marker"
  const identity = document.createElement("span")
  identity.textContent = `FF / ${new Date().getFullYear()}`
  meta.append(marker, identity)

  const labelMask = document.createElement("div")
  labelMask.className = "editorial-transition-label-mask"
  const destination = document.createElement("span")
  destination.className = "editorial-transition-label"
  destination.textContent = label || ""
  labelMask.appendChild(destination)

  frame.append(meta, labelMask)
  sheet.appendChild(frame)
  root.appendChild(sheet)
  root.style.visibility = "hidden"
  document.body.appendChild(root)

  return { root, sheet, meta, destination, direction, sourceMain: null, revealed: false }
}

function removeFold(overlay) {
  if (overlay?.root?.parentNode) overlay.root.parentNode.removeChild(overlay.root)
}

function travelFor(direction, entering) {
  if (direction === "locale") return { xPercent: entering ? 101 : -101 }
  const sign = direction === "back" ? -1 : 1
  return { yPercent: entering ? sign * 101 : sign * -101 }
}

function contentOffset(direction, incoming) {
  if (direction === "locale") return { x: incoming ? 16 : -12, y: 0 }
  const sign = direction === "back" ? -1 : 1
  return { x: 0, y: incoming ? sign * 16 : sign * -12 }
}

function finishFold(overlay, destinationMain) {
  if (overlay?.sourceMain?.isConnected) gsap.set(overlay.sourceMain, { clearProps: "transform,opacity" })
  if (destinationMain?.isConnected) gsap.set(destinationMain, { clearProps: "transform,opacity" })
  removeFold(overlay)
  if (foldState.overlay === overlay) foldState.overlay = null
  foldState.awaiting = false
  foldState.busy = false
  try {
    window.__lenis?.start?.()
  } catch {}
}

function revealFold(overlay) {
  if (!overlay || overlay.revealed) return
  overlay.revealed = true
  foldState.awaiting = false
  try {
    window.__lenis?.stop?.()
  } catch {}

  if (isMotionReduced()) {
    finishFold(overlay)
    return
  }

  const destinationMain = document.querySelector(".site-root > main")
  const incoming = contentOffset(overlay.direction, true)
  const labelExit = overlay.direction === "back" ? 110 : -110
  const sheetExit = travelFor(overlay.direction, false)
  const tl = gsap.timeline({ onComplete: () => finishFold(overlay, destinationMain) })

  tl.to(overlay.destination, {
    yPercent: labelExit,
    duration: 0.3,
    ease: "power2.in",
  }, 0)
  tl.to(overlay.meta, {
    autoAlpha: 0,
    y: overlay.direction === "back" ? 7 : -7,
    duration: 0.2,
    ease: "power2.in",
  }, 0)
  tl.to(overlay.sheet, {
    ...sheetExit,
    duration: 0.62,
    ease: "power3.inOut",
  }, 0.1)

  if (destinationMain) {
    tl.fromTo(destinationMain, {
      ...incoming,
      opacity: 0.68,
    }, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
    }, 0.26)
  }
}

function coverWithFold(overlay, go) {
  const entering = travelFor(overlay.direction, true)
  const outgoing = contentOffset(overlay.direction, false)
  const labelStart = overlay.direction === "back" ? -112 : 112
  overlay.sourceMain = document.querySelector(".site-root > main")
  try {
    window.__lenis?.stop?.()
  } catch {}

  gsap.set(overlay.root, { autoAlpha: 1, visibility: "visible" })
  gsap.set(overlay.sheet, entering)
  gsap.set(overlay.destination, { yPercent: labelStart })
  gsap.set(overlay.meta, { autoAlpha: 0, y: 8 })

  const tl = gsap.timeline({
    onComplete() {
      window.scrollTo(0, 0)
      foldState.awaiting = true
      go()
      const pending = overlay
      window.setTimeout(() => {
        if (!pending.revealed && foldState.overlay === pending) revealFold(pending)
      }, 3000)
    },
  })

  if (overlay.sourceMain) {
    tl.to(overlay.sourceMain, {
      ...outgoing,
      opacity: 0.48,
      duration: 0.34,
      ease: "power3.in",
    }, 0)
  }
  tl.to(overlay.sheet, {
    xPercent: 0,
    yPercent: 0,
    duration: 0.56,
    ease: "power3.inOut",
  }, 0)
  tl.to(overlay.destination, {
    yPercent: 0,
    duration: 0.44,
    ease: "power3.out",
  }, 0.2)
  tl.to(overlay.meta, {
    autoAlpha: 1,
    y: 0,
    duration: 0.3,
    ease: "power3.out",
  }, 0.18)
}

export function Curtain() {
  const pathname = usePathname()

  useEffect(() => {
    const api = {
      play({ label, direction = "forward", go }) {
        if (foldState.busy || isMotionReduced() || typeof document === "undefined") {
          go()
          return
        }
        if (foldState.overlay) removeFold(foldState.overlay)

        foldState.busy = true
        const overlay = buildFold(label, direction)
        foldState.overlay = overlay
        coverWithFold(overlay, go)
      },
    }
    registerCurtain(api)
    return () => registerCurtain(null)
  }, [])

  useEffect(() => {
    if (!foldState.awaiting || !foldState.overlay) return
    const overlay = foldState.overlay
    requestAnimationFrame(() => revealFold(overlay))
  }, [pathname])

  return null
}
