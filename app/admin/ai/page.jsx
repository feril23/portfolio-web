"use client"
import { DEMO } from "../../../src/lib/api.js"
import AIAssistant from "../../../src/admin/pages/AIAssistant.jsx"

export default function AdminAIPage() {
  return <AIAssistant demo={DEMO} />
}
