"use client"
import { DEMO } from "../../src/lib/api.js"
import Overview from "../../src/admin/pages/Overview.jsx"

export default function AdminOverviewPage() {
  return <Overview demo={DEMO} />
}
