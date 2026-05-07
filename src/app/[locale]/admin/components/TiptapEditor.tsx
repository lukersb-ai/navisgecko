'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2 } from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-earth max-w-none focus:outline-none min-h-[300px] p-4 bg-white/50 rounded-b-xl border-x border-b border-earth-dark/10',
      },
    },
  });

  // Keep editor content in sync with external value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col w-full shadow-sm">
      <div className="flex flex-wrap gap-2 p-2 bg-earth-beige/50 border border-earth-dark/10 rounded-t-xl sticky top-0 z-10">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-earth-dark/10 transition ${editor.isActive('bold') ? 'bg-earth-dark/20 text-earth-dark font-bold' : 'text-earth-dark/70'}`}
          title="Pogrubienie"
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-earth-dark/10 transition ${editor.isActive('italic') ? 'bg-earth-dark/20 text-earth-dark font-bold' : 'text-earth-dark/70'}`}
          title="Kursywa"
        >
          <Italic className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-earth-dark/20 my-auto mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-earth-dark/10 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-earth-dark/20 text-earth-dark' : 'text-earth-dark/70'}`}
          title="Nagłówek 2"
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-earth-dark/20 my-auto mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-earth-dark/10 transition ${editor.isActive('bulletList') ? 'bg-earth-dark/20 text-earth-dark font-bold' : 'text-earth-dark/70'}`}
          title="Lista punktowa"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-earth-dark/10 transition ${editor.isActive('orderedList') ? 'bg-earth-dark/20 text-earth-dark font-bold' : 'text-earth-dark/70'}`}
          title="Lista numerowana"
        >
          <ListOrdered className="w-5 h-5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
