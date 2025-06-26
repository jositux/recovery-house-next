"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { Bold, List } from "lucide-react"
import styles from "./rich-text-editor.module.css"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  error?: boolean
}

export function RichTextEditor({ content, onChange, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we don't need
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        orderedList: false,
        heading: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={`${styles.editorContainer} ${error ? styles.error : ""}`}>
      <div className={styles.toolbar}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive("bold") ? styles.active : ""}`}
        >
          <Bold className={styles.icon} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive("bulletList") ? styles.active : ""}`}
        >
          <List className={styles.icon} />
        </Button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  )
}
