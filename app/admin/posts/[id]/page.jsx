"use client"
import { useParams } from "next/navigation"
import { DEMO } from "../../../../src/lib/api.js"
import PostEditor from "../../../../src/admin/pages/PostEditor.jsx"

export default function AdminPostEditorPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  return <PostEditor demo={DEMO} postId={id === "new" ? null : id} />
}
