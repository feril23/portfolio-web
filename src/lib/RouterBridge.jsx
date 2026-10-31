"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { bindNavigate, bindPrefetch } from "./router.jsx"

// Binds Next.js's imperative router into the navigate() shim so components can
// keep calling navigate(to, { label }) from anywhere (site + dashboard).
export default function RouterBridge() {
  const router = useRouter()
  useEffect(() => {
    bindNavigate((to) => router.push(to))
    bindPrefetch((to) => router.prefetch(to, { kind: "full" }))
  }, [router])
  return null
}
