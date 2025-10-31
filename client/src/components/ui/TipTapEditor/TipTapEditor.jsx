import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import './TipTapEditor.css';

export default function TipTapEditor({ value = '', onChange = () => {}, placeholder = '', className = '' }) {
  const [isPreview, setIsPreview] = React.useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      BulletList,
      OrderedList,
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  return (
    <div className={`tiptap-editor-root ${className}`}>
      <div className="tiptap-toolbar">
        <button type="button" onClick={() => setIsPreview((v) => !v)} className={`preview-toggle${isPreview ? ' active' : ''}`}>{isPreview ? 'Edit' : 'Preview'}</button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleBulletList().run()}>•</button>
        <button type="button" onClick={() => editor && editor.chain().focus().toggleOrderedList().run()}>1.</button>
        <button type="button" onClick={() => editor && editor.chain().focus().undo().run()}>↺ Undo</button>
        <button type="button" onClick={() => editor && editor.chain().focus().redo().run()}>↻ Redo</button>
      </div>
      {isPreview ? (
        <div className="tiptap-preview">
          <div dangerouslySetInnerHTML={{ __html: editor ? editor.getHTML() : value }} />
        </div>
      ) : (
        <>
          {!editor?.getText() && !value && placeholder && (
            <div className="tiptap-placeholder">{placeholder}</div>
          )}
          <EditorContent editor={editor} />
        </>
      )}
    </div>
  );
}
