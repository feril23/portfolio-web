"use client"
import { DEMO } from "../../../src/lib/api.js"
import Profile from "../../../src/admin/pages/Profile.jsx"

export default function AdminProfilePage() {
  return <Profile demo={DEMO} />
}
