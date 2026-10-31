import { useEffect, useRef } from "react"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

/**
 * A Notion-style WYSIWYG editor (BlockNote) that keeps Markdown as the source
 * of truth. Incoming Markdown is parsed into blocks when the editor mounts, and
 * every change is serialized back to Markdown via `onChange`. This means
 * `posts.content` stays Markdown and the public site keeps rendering as before.
 */
export default function BlockNoteEditor({ initialMarkdown = "", onChange }) {
  const editor = useCreateBlockNote()
  const ready = useRef(false)

  // Load the incoming Markdown into the editor once, on mount.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (initialMarkdown && initialMarkdown.trim()) {
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown)
          if (!alive) return
          editor.replaceBlocks(editor.document, blocks)
        }
      } catch {
        // If parsing fails, start from an empty document.
      } finally {
        ready.current = true
      }
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  // Serialize the document back to Markdown on every change.
  const handleChange = async () => {
    if (!ready.current) return
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document)
      onChange?.(md)
    } catch {
      /* ignore serialization errors */
    }
  }

  return (
    <div className="editor-bn">
      <BlockNoteView editor={editor} theme="light" onChange={handleChange} />
    </div>
  )
}
