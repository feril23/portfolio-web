import { isMotionReduced } from "./motionPreference.js"

const COVER_DURATION = 460
const MORPH_DURATION = 820
const TRANSITION_TIMEOUT = 5200

let running = false
let pendingArticle = null
let activeTransition = null
const journalScrollPositions = new Map()

export function getPendingSharedArticle(slug, locale) {
  if (!pendingArticle || pendingArticle.expiresAt < Date.now()) {
    pendingArticle = null
    return null
  }
  const post = pendingArticle.post
  if (String(post?.slug) !== String(slug)) return null
  if (post?.locale && locale && post.locale !== locale) return null
  return post
}

function stageArticle(post) {
  pendingArticle = post ? { post, expiresAt: Date.now() + 10000 } : null
}

function postKey(post) {
  return String(post?.slug || post?.id || "")
}

function typography(element) {
  const style = getComputedStyle(element)
  return {
    color: style.color,
    fontFamily: style.fontFamily,
    fontFeatureSettings: style.fontFeatureSettings,
    fontKerning: style.fontKerning,
    fontSize: style.fontSize,
    fontStretch: style.fontStretch,
    fontStyle: style.fontStyle,
    fontVariantLigatures: style.fontVariantLigatures,
    fontVariationSettings: style.fontVariationSettings,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    overflowWrap: style.overflowWrap,
    textAlign: style.textAlign,
    textRendering: style.textRendering,
    textTransform: style.textTransform,
    whiteSpace: style.whiteSpace,
    wordBreak: style.wordBreak,
  }
}

function applyLayerStyle(element, rect, styles) {
  Object.assign(element.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    ...styles,
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function fontScale(fromStyles, toStyles) {
  const from = Number.parseFloat(fromStyles.fontSize)
  const to = Number.parseFloat(toStyles.fontSize)
  return from > 0 && to > 0 ? to / from : 1
}

function transformBetween(fromRect, toRect, scale, progress = 1) {
  const x = (toRect.left - fromRect.left) * progress
  const y = (toRect.top - fromRect.top) * progress
  const currentScale = 1 + (scale - 1) * progress
  return `translate3d(${x}px, ${y}px, 0) scale(${currentScale})`
}

function createTitle(className, text, rect, styles) {
  const title = document.createElement("div")
  title.className = `shared-route-title ${className}`
  title.textContent = text
  applyLayerStyle(title, rect, styles)
  return title
}

function scrollToPosition(top = 0) {
  const position = Math.max(0, Number(top) || 0)
  try {
    window.__lenis?.scrollTo?.(position, { immediate: true, force: true })
  } catch {}
  window.scrollTo(0, position)
}

function releaseTransition(state) {
  if (!state || state.released) return
  state.released = true
  window.clearTimeout(state.timeout)
  state.root?.remove()
  if (state.source?.isConnected) state.source.style.visibility = state.sourceVisibility
  if (state.target?.isConnected) state.target.style.visibility = state.targetVisibility
  delete document.documentElement.dataset.sharedTransition
  try {
    window.__lenis?.start?.()
  } catch {}
  if (activeTransition === state) activeTransition = null
  running = false
}

function fadeAndRelease(state) {
  if (!state || state.released) return
  const animation = state.root.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 220, easing: "ease-out", fill: "forwards" },
  )
  animation.finished.catch(() => {}).finally(() => releaseTransition(state))
}

function buildTransition(source, sourceRect, sourceStyles) {
  const entry = source.closest(".journal-entry, [data-shared-entry]")
  const entryRect = entry?.getBoundingClientRect() || sourceRect
  const viewportHeight = window.innerHeight
  const rowTop = clamp(entryRect.top, 0, viewportHeight)
  const rowBottom = clamp(entryRect.bottom, rowTop + 1, viewportHeight)

  const root = document.createElement("div")
  root.className = "shared-route-transition"
  root.setAttribute("aria-hidden", "true")

  const backdrop = document.createElement("div")
  backdrop.className = "shared-route-backdrop"
  backdrop.style.clipPath = `inset(${rowTop}px 0 ${viewportHeight - rowBottom}px 0)`

  const oldTitle = createTitle(
    "shared-route-title--old",
    source.textContent || "",
    sourceRect,
    sourceStyles,
  )

  root.append(backdrop, oldTitle)
  document.body.appendChild(root)

  return { root, backdrop, oldTitle, rowTop, rowBottom }
}

function coverRoute(state) {
  const easing = "cubic-bezier(.76, 0, .24, 1)"
  const viewportHeight = window.innerHeight

  const backdropAnimation = state.backdrop.animate([
    { clipPath: `inset(${state.rowTop}px 0 ${viewportHeight - state.rowBottom}px 0)` },
    { clipPath: "inset(0px 0px 0px 0px)" },
  ], { duration: COVER_DURATION, easing, fill: "forwards" })

  state.covered = backdropAnimation.finished.catch(() => {})
  state.covered.then(() => {
    if (activeTransition !== state || state.released) return
    scrollToPosition(0)
    state.navigateOnce()
  })
}

function positionDestination(state, target) {
  if (state.direction !== "back") {
    scrollToPosition(0)
    return
  }

  if (Number.isFinite(state.returnScrollY)) {
    scrollToPosition(state.returnScrollY)
  } else {
    const rect = target.getBoundingClientRect()
    const landingOffset = clamp(window.innerHeight * 0.28, 120, 260)
    scrollToPosition(window.scrollY + rect.top - landingOffset)
  }

  const positionedRect = target.getBoundingClientRect()
  if (positionedRect.bottom < 72 || positionedRect.top > window.innerHeight - 72) {
    scrollToPosition(window.scrollY + positionedRect.top - window.innerHeight * 0.3)
  }
}

function morphToTarget(state, target) {
  if (activeTransition !== state || state.released || !target?.isConnected) return

  const targetRect = target.getBoundingClientRect()
  const targetStyles = typography(target)
  const targetTitle = createTitle(
    "shared-route-title--new",
    target.textContent || state.oldTitle.textContent || "",
    targetRect,
    targetStyles,
  )
  state.root.appendChild(targetTitle)
  state.target = target
  state.targetVisibility = target.style.visibility
  target.style.visibility = "hidden"

  const sourceToTargetScale = fontScale(state.sourceStyles, targetStyles)
  const targetFromSourceScale = 1 / sourceToTargetScale
  const oldEnd = transformBetween(state.sourceRect, targetRect, sourceToTargetScale)
  const newStart = transformBetween(targetRect, state.sourceRect, targetFromSourceScale)
  const oldCrossfadeStart = transformBetween(state.sourceRect, targetRect, sourceToTargetScale, 0.38)
  const oldCrossfadeEnd = transformBetween(state.sourceRect, targetRect, sourceToTargetScale, 0.62)
  const newCrossfadeStart = transformBetween(targetRect, state.sourceRect, targetFromSourceScale, 0.62)
  const newCrossfadeEnd = transformBetween(targetRect, state.sourceRect, targetFromSourceScale, 0.38)
  const easing = state.direction === "back"
    ? "cubic-bezier(.65, 0, .35, 1)"
    : "cubic-bezier(.16, 1, .3, 1)"

  state.backdrop.animate([
    { opacity: 1, offset: 0 },
    { opacity: 1, offset: 0.5 },
    { opacity: 0, offset: 1 },
  ], { duration: MORPH_DURATION, easing: "linear", fill: "forwards" })

  state.oldTitle.animate([
    { transform: "none", opacity: 1, offset: 0 },
    { transform: oldCrossfadeStart, opacity: 1, offset: 0.38 },
    { transform: oldCrossfadeEnd, opacity: 0, offset: 0.62 },
    { transform: oldEnd, opacity: 0, offset: 1 },
  ], { duration: MORPH_DURATION, easing, fill: "forwards" })

  const targetAnimation = targetTitle.animate([
    { transform: newStart, opacity: 0, offset: 0 },
    { transform: newCrossfadeStart, opacity: 0, offset: 0.38 },
    { transform: newCrossfadeEnd, opacity: 1, offset: 0.62 },
    { transform: "none", opacity: 1, offset: 1 },
  ], { duration: MORPH_DURATION, easing, fill: "forwards" })

  targetAnimation.finished
    .then(() => {
      if (activeTransition !== state || state.released) return
      delete document.documentElement.dataset.sharedTransition
      requestAnimationFrame(() => releaseTransition(state))
    })
    .catch(() => releaseTransition(state))
}

export function finishSharedTextTransition(target) {
  const state = activeTransition
  if (!state || state.finishing || state.released || !target) return false
  state.finishing = true

  state.covered.then(() => {
    if (activeTransition !== state || state.released) return
    requestAnimationFrame(() => {
      positionDestination(state, target)
      requestAnimationFrame(() => morphToTarget(state, target))
    })
  })
  return true
}

export function finishSharedTextTransitionToList() {
  const state = activeTransition
  if (!state || state.direction !== "back") return false
  const key = postKey(state.post)
  const target = Array.from(document.querySelectorAll("[data-shared-list-title]"))
    .find((element) => element.dataset.sharedListTitle === key)
  return target ? finishSharedTextTransition(target) : false
}

export function startSharedTextTransition(source, go, post = null, direction = "forward") {
  stageArticle(post)

  if (typeof document === "undefined" || !source || typeof source.animate !== "function" || isMotionReduced()) {
    go()
    return
  }
  if (running) return
  running = true

  const key = postKey(post)
  if (direction === "forward" && key) {
    if (source.closest(".journal-entry")) journalScrollPositions.set(key, window.scrollY)
    else journalScrollPositions.delete(key)
  }

  const sourceRect = source.getBoundingClientRect()
  const sourceStyles = typography(source)
  const layer = buildTransition(source, sourceRect, sourceStyles)
  let navigated = false
  const navigateOnce = () => {
    if (navigated) return
    navigated = true
    go()
  }

  const state = {
    ...layer,
    source,
    sourceRect,
    sourceStyles,
    sourceVisibility: source.style.visibility,
    direction,
    post,
    returnScrollY: direction === "back" ? journalScrollPositions.get(key) : null,
    navigateOnce,
    finishing: false,
    released: false,
  }
  activeTransition = state

  document.documentElement.dataset.sharedTransition = direction === "back" ? "detail-journal" : "journal-detail"
  source.style.visibility = "hidden"
  try {
    window.__lenis?.stop?.()
  } catch {}

  state.timeout = window.setTimeout(() => {
    navigateOnce()
    fadeAndRelease(state)
  }, TRANSITION_TIMEOUT)

  coverRoute(state)
}
