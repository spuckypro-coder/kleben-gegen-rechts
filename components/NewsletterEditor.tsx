"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { emailTemplate, convertBodyHtmlForEmail } from "@/lib/email-template";

interface Props {
  subject: string;
  onSubjectChange: (s: string) => void;
  body: string;
  onBodyChange: (html: string) => void;
}

export default function NewsletterEditor({ subject, onSubjectChange, body, onBodyChange }: Props) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Schreibe deinen Newsletter-Text hier..." }),
    ],
    content: body,
    onUpdate: ({ editor }) => onBodyChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[280px] p-4 focus:outline-none text-gray-200",
      },
    },
  });

  // Update iframe when switching to preview tab
  useEffect(() => {
    if (activeTab !== "preview") return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const currentHtml = editor ? editor.getHTML() : body;
    const converted = convertBodyHtmlForEmail(currentHtml);
    const subjectLine = subject.trim()
      ? `<p style="margin:0 0 20px 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:2px;">Betreff: ${subject}</p>`
      : "";
    const fullHtml = emailTemplate(subjectLine + converted);

    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();
    }
  }, [activeTab, body, subject, editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-blog-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL eingeben:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `px-2 py-1 text-xs font-black uppercase border transition-colors ${
      active
        ? "border-red-600 bg-red-600 text-white"
        : "border-gray-700 text-gray-400 hover:border-white hover:text-white"
    }`;

  return (
    <div className="space-y-4">

      {/* Subject */}
      <div>
        <label className="block text-gray-500 text-xs uppercase mb-1 tracking-widest">Betreff</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="z.B. Neues von Kleben Gegen Rechts"
          className="w-full bg-black border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-0 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-5 py-2 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors ${
            activeTab === "edit" ? "border-red-600 text-white" : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          ✏ Bearbeiten
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-5 py-2 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors ${
            activeTab === "preview" ? "border-red-600 text-white" : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          👁 Vorschau
        </button>
      </div>

      {/* Edit panel */}
      {activeTab === "edit" && (
        <div className="border border-gray-700 bg-gray-900">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-700 bg-gray-950">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>B</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><em>I</em></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}><u>U</u></button>
            <div className="w-px bg-gray-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
            <div className="w-px bg-gray-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>•—</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1.</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>&ldquo;&rdquo;</button>
            <div className="w-px bg-gray-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btn(editor.isActive({ textAlign: "left" }))}>⬅</button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btn(editor.isActive({ textAlign: "center" }))}>☰</button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btn(editor.isActive({ textAlign: "right" }))}>➡</button>
            <div className="w-px bg-gray-700 mx-1" />
            <button type="button" onClick={setLink} className={btn(editor.isActive("link"))}>🔗</button>
            <button type="button" onClick={() => imgInputRef.current?.click()} className={btn(false)}>🖼</button>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
            <div className="w-px bg-gray-700 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>↩</button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>↪</button>
          </div>
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Preview panel */}
      {activeTab === "preview" && (
        <div className="border border-gray-700 bg-gray-950">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600 text-xs ml-2 uppercase tracking-widest font-bold">E-Mail Vorschau</span>
          </div>
          <iframe
            ref={iframeRef}
            className="w-full border-0"
            style={{ height: "600px" }}
            title="Newsletter Vorschau"
          />
        </div>
      )}
    </div>
  );
}
