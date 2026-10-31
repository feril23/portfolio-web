"use client"
import { DEMO } from "../../../src/lib/api.js"
import Posts from "../../../src/admin/pages/Posts.jsx"

export default function AdminPostsPage() {
  return <Posts demo={DEMO} />
}
