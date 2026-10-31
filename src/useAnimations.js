"use client"
import { useEffect } from "react"
import { isMotionReduced } from "./lib/motionPreference.js"

export function useAnimations(scope, routeKey) {
  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      const [{ gsap }, scrollTriggerModule, lenisModule, splitTypeModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
        import("split-type"),
      ])
      if (cancelled) return

      const ScrollTrigger = scrollTriggerModule.ScrollTrigger
      const Lenis = lenisModule.default
      const SplitType = splitTypeModule.default
      gsap.registerPlugin(ScrollTrigger)

      const reduced = isMotionReduced()
      const finePointer = window.matchMedia("(pointer: fine)").matches
      const listeners = []
      const splits = []
      let lenis
      let rafCallback
      let capabilityMedia

      if (!reduced) {
        lenis = new Lenis({
          duration: 1.12,
          smoothWheel: true,
          wheelMultiplier: 0.88,
          touchMultiplier: 1.05,
          syncTouch: false,
        })
        lenis.on("scroll", ScrollTrigger.update)
        rafCallback = (time) => lenis.raf(time * 1000)
        gsap.ticker.add(rafCallback)
        gsap.ticker.lagSmoothing(0)
        window.__lenis = lenis
      }

      const ctx = gsap.context(() => {
        if (reduced) return

        const nav = document.querySelector(".nav")
        const hero = document.querySelector(".hero")

        // Deliberate first impression: metadata, headline, then actions.
        if (hero) {
          const intro = gsap.timeline({ defaults: { ease: "power4.out" } })
          intro
            .from(".hero-top > *", { y: 14, opacity: 0, duration: 0.65, stagger: 0.07 })
            .from(".hero-kicker", { y: 18, opacity: 0, duration: 0.7 }, "-=0.35")
            .from(".hero-word-inner", {
              yPercent: 112,
              opacity: 0,
              duration: 1.05,
              stagger: 0.045,
              clearProps: "transform,opacity",
            }, "-=0.46")
            .from(".hero-bottom", { y: 22, opacity: 0, duration: 0.78 }, "-=0.48")

          // The hero gently recedes to hand attention to the next section.
          gsap.to(".hero-copy", {
            yPercent: -7,
            opacity: 0.56,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "55% center", end: "bottom top", scrub: 1 },
          })
        }

        // Reading/scroll feedback integrated into the navigation rule.
        if (nav) {
          const setProgress = gsap.quickSetter(nav, "--scroll-progress")
          ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate(self) {
              setProgress(self.progress)
              gsap.to(nav, {
                yPercent: self.direction === 1 && self.scroll() > 220 ? -105 : 0,
                duration: 0.38,
                ease: "power3.out",
                overwrite: true,
              })
            },
          })
        }

        // Small index items establish rhythm before the long sections.
        const practiceItems = gsap.utils.toArray(".practice-index-inner > div > span")
        if (practiceItems.length) {
          gsap.from(practiceItems, {
            y: 12,
            opacity: 0,
            duration: 0.6,
            stagger: 0.055,
            ease: "power3.out",
            scrollTrigger: { trigger: ".practice-index", start: "top 88%", once: true },
          })
        }

        // Section metadata enters quietly; the content remains the focus.
        gsap.utils.toArray(".section-meta").forEach((element) => {
          gsap.from(element.children, {
            y: 10,
            opacity: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          })
          gsap.from(element, {
            "--rule-scale": 0,
            duration: 1.05,
            ease: "power3.inOut",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
          })
        })

        // Editorial headings reveal by line and word rather than by character.
        gsap.utils.toArray("[data-split]").forEach((element) => {
          const split = new SplitType(element, { types: "lines,words", tagName: "span" })
          splits.push(split)
          split.lines.forEach((line) => line.classList.add("motion-line"))
          gsap.from(split.words, {
            yPercent: 105,
            opacity: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.028,
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          })
        })

        // Keep journal rows geometrically stable while a shared title lands
        // back in the list; the route overlay already provides their reveal.
        const returningToJournal = document.documentElement.dataset.sharedTransition === "detail-journal"
        const revealTargets = gsap.utils.toArray("[data-reveal]").filter((element) => (
          !returningToJournal || !element.closest(".journal-list")
        ))
        if (revealTargets.length) {
          gsap.set(revealTargets, { opacity: 0, y: 26 })
          ScrollTrigger.batch(revealTargets, {
            start: "top 89%",
            once: true,
            onEnter: (batch) => gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.82,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }),
          })
        }

        // Capability sheets layer naturally with CSS sticky. GSAP only
        // orchestrates their content and compresses the previous sheet.
        const capabilityItems = gsap.utils.toArray("[data-capability-item]")
        if (capabilityItems.length && CSS.supports("position", "sticky")) {
          capabilityMedia = gsap.matchMedia()
          capabilityMedia.add({
            mobile: "(max-width: 760px)",
            desktop: "(min-width: 761px)",
            tall: "(min-height: 600px)",
          }, (media) => {
            if (!media.conditions.tall) return
            const mobile = media.conditions.mobile
            const baseTop = mobile ? 74 : 92
            const step = mobile ? 7 : 12

            capabilityItems.forEach((item, index) => {
              const parts = [
                item.querySelector(".capability-index"),
                item.querySelector(".capability-content h3"),
                item.querySelector(".capability-detail > p"),
                item.querySelector(".capability-scope"),
              ].filter(Boolean)

              gsap.from(parts, {
                y: mobile ? 18 : 26,
                opacity: 0,
                duration: mobile ? 0.64 : 0.76,
                stagger: mobile ? 0.055 : 0.075,
                ease: "power3.out",
                clearProps: "transform,opacity",
                scrollTrigger: { trigger: item, start: "top 84%", once: true },
              })

              const next = capabilityItems[index + 1]
              ScrollTrigger.create({
                trigger: item,
                start: `top ${baseTop + index * step + 2}px`,
                endTrigger: next || item,
                end: next ? `top ${baseTop + (index + 1) * step + 2}px` : "bottom top",
                onEnter: () => item.classList.add("is-stack-active"),
                onEnterBack: () => item.classList.add("is-stack-active"),
                onLeave: () => item.classList.remove("is-stack-active"),
                onLeaveBack: () => item.classList.remove("is-stack-active"),
              })

              if (!next) return
              const stackTimeline = gsap.timeline({
                scrollTrigger: {
                  trigger: next,
                  start: "top 88%",
                  end: `top ${baseTop + (index + 1) * step}px`,
                  scrub: mobile ? 0.45 : 0.7,
                  invalidateOnRefresh: true,
                },
              })
              stackTimeline.to(item, {
                y: mobile ? -4 : -10,
                scale: mobile ? 0.992 : 0.98,
                ease: "none",
              }, 0)
              stackTimeline.to(item.querySelector(".capability-content"), {
                opacity: mobile ? 0.22 : 0.14,
                ease: "none",
              }, 0)
              stackTimeline.to(item.querySelector(".capability-index"), {
                opacity: mobile ? 0.5 : 0.38,
                ease: "none",
              }, 0)
            })
            return () => capabilityItems.forEach((item) => item.classList.remove("is-stack-active"))
          })
        }

        // Project imagery is revealed as a physical surface, then drifts subtly.
        gsap.utils.toArray(".project-media").forEach((media) => {
          const visual = media.firstElementChild
          gsap.fromTo(media,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.05,
              ease: "power4.inOut",
              scrollTrigger: { trigger: media, start: "top 88%", once: true },
            }
          )
          if (visual) {
            gsap.fromTo(visual, { scale: 1.06 }, {
              scale: 1,
              duration: 1.25,
              ease: "power3.out",
              scrollTrigger: { trigger: media, start: "top 88%", once: true },
            })
            gsap.to(visual, {
              yPercent: 4,
              ease: "none",
              scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: 1.2 },
            })
          }
        })

        // Experience rows progressively draw their divider and content.
        gsap.utils.toArray(".timeline-item").forEach((item) => {
          gsap.from(item, {
            "--item-rule": 0,
            duration: 0.9,
            ease: "power3.inOut",
            scrollTrigger: { trigger: item, start: "top 90%", once: true },
          })
        })

        // The closing statement holds for a moment as it enters the viewport.
        const contact = document.querySelector(".contact")
        if (contact) {
          gsap.from(".contact-email", {
            y: 18,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: ".contact-email", start: "top 90%", once: true },
          })
          gsap.to(".contact-title", {
            yPercent: -5,
            ease: "none",
            scrollTrigger: { trigger: contact, start: "top bottom", end: "bottom top", scrub: 1.2 },
          })
        }

        // Route pages without a hero still receive a composed entrance.
        if (!hero) {
          gsap.from("[data-enter]", {
            y: 22,
            opacity: 0,
            duration: 0.78,
            ease: "power3.out",
            stagger: 0.07,
          })
        }

        // Pointer interactions are local, subtle, and never required.
        if (finePointer) {
          gsap.utils.toArray(".text-link, .contact-email, .contact-socials a").forEach((element) => {
            const xTo = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3" })
            const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3" })
            const move = (event) => {
              const rect = element.getBoundingClientRect()
              xTo((event.clientX - rect.left - rect.width / 2) * 0.035)
              yTo((event.clientY - rect.top - rect.height / 2) * 0.08)
            }
            const leave = () => { xTo(0); yTo(0) }
            element.addEventListener("pointermove", move)
            element.addEventListener("pointerleave", leave)
            listeners.push(() => {
              element.removeEventListener("pointermove", move)
              element.removeEventListener("pointerleave", leave)
            })
          })
        }

        ScrollTrigger.refresh()
      }, scope)

      cleanup = () => {
        listeners.forEach((remove) => remove())
        splits.forEach((split) => split.revert())
        if (capabilityMedia) capabilityMedia.revert()
        ctx.revert()
        if (rafCallback) gsap.ticker.remove(rafCallback)
        if (lenis) lenis.destroy()
        if (window.__lenis === lenis) window.__lenis = null
      }
    })().catch(() => {})

    return () => {
      cancelled = true
      cleanup()
    }
  }, [scope, routeKey])
}
