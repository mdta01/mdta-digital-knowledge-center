"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import YouTube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CharacterCount from "@tiptap/extension-character-count";
import { createLowlight, common } from "lowlight";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Type,
  Palette,
  Youtube,
  Minus,
  Pilcrow,
  Languages,
  Loader2,
  Columns,
  Footprints,
  Hash,
  BookOpen,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const lowlight = createLowlight(common);

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc",
  "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff",
  "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3",
  "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
];

const HIGHLIGHTS = [
  "#fef08a", "#fde047", "#facc15", "#fb7185", "#fda4af", "#f87171",
  "#86efac", "#4ade80", "#22c55e", "#93c5fd", "#60a5fa", "#3b82f6",
  "#c4b5fd", "#a78bfa", "#8b5cf6", "#fbcfe8", "#f9a8d4", "#ec4899",
];

/** Parse a combined HTML value into { arabic, translation } if it uses split divs. */
function parseSplitContent(html: string): { arabic: string; translation: string } | null {
  if (!html) return null;
  if (!html.includes("split-arabic") && !html.includes("split-translation")) return null;
  try {
    if (typeof window === "undefined") return null;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const ar = wrapper.querySelector(".split-arabic");
    const tr = wrapper.querySelector(".split-translation");
    return {
      arabic: ar ? ar.innerHTML : "",
      translation: tr ? tr.innerHTML : "",
    };
  } catch {
    return null;
  }
}

/** Combine arabic + translation into a single HTML string. */
function buildSplitContent(arabic: string, translation: string): string {
  return `<div class="split-arabic" dir="rtl">${arabic}</div><div class="split-translation" dir="ltr">${translation}</div>`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Mulai menulis…",
  className,
  minHeight = 480,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [rtlMode, setRtlMode] = useState(false);
  const [arabicMode, setArabicMode] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [footnoteText, setFootnoteText] = useState("");
  const [footnoteOpen, setFootnoteOpen] = useState(false);
  const [footnoteCount, setFootnoteCount] = useState(0);
  const editorRef = useRef<Editor | null>(null);
  const splitArabicRef = useRef<Editor | null>(null);
  const splitModeRef = useRef(false);
  const lastEmittedRef = useRef<string>("");

  // Detect existing split content on mount
  const initialParsed = typeof window !== "undefined" ? parseSplitContent(value) : null;
  const initialIsSplit = !!initialParsed;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full h-auto" },
      }),
      TableKit.configure({
        resizable: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      YouTube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: { class: "rounded-xl overflow-hidden my-4" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      CharacterCount,
      Placeholder.configure({
        placeholder: splitMode ? "Terjemahan / latin…" : placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground/60 before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: initialIsSplit ? (initialParsed?.translation ?? "") : value || "",
    editorProps: {
      attributes: {
        class: "prose-kitap max-w-none focus:outline-none min-h-[var(--editor-min-height)] px-5 py-4",
        style: `--editor-min-height: ${minHeight}px`,
        dir: "ltr",
      },
    },
    onUpdate: ({ editor: e }) => {
      if (splitModeRef.current) {
        const ar = splitArabicRef.current?.getHTML() ?? "";
        const tr = e.getHTML();
        const combined = buildSplitContent(ar, tr);
        lastEmittedRef.current = combined;
        onChange(combined);
      } else {
        const html = e.getHTML();
        lastEmittedRef.current = html;
        onChange(html);
      }
    },
  });

  // Split-mode arabic editor (RTL)
  const splitArabicEditor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      Underline, Subscript, Superscript, TextStyle, Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full h-auto" } }),
      Typography, CharacterCount,
      Placeholder.configure({
        placeholder: "Teks Arab (RTL)…",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground/60 before:float-left before:h-0 before:pointer-events-none",
      }),
    ],
    content: initialParsed?.arabic ?? "",
    editorProps: {
      attributes: {
        class: "prose-kitap font-arabic max-w-none focus:outline-none min-h-[300px] px-5 py-4",
        dir: "rtl",
        style: "font-family: var(--font-arabic), serif; line-height: 2.2; font-size: 1.2em;",
      },
    },
    onUpdate: () => {
      const ar = splitArabicRef.current?.getHTML() ?? "";
      const tr = editorRef.current?.getHTML() ?? "";
      const combined = buildSplitContent(ar, tr);
      lastEmittedRef.current = combined;
      onChange(combined);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    splitArabicRef.current = splitArabicEditor;
    return () => {
      editorRef.current = null;
      splitArabicRef.current = null;
    };
  }, [editor, splitArabicEditor]);

  // Initialize footnote count from existing content
  useEffect(() => {
    if (typeof document === "undefined" || !value) return;
    try {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = value;
      const sups = wrapper.querySelectorAll('sup[data-footnote]');
      setFootnoteCount(sups.length);
    } catch {
      // ignore
    }
  }, [value]);

  // Sync external value changes (e.g. form reset) without losing caret on each keystroke
  useEffect(() => {
    if (!editor) return;
    if (value === undefined || value === null) return;
    if (value === lastEmittedRef.current) return;
    const parsed = parseSplitContent(value);
    if (parsed) {
      // external split content
      setSplitMode(true);
      if (splitArabicEditor && splitArabicEditor.getHTML() !== parsed.arabic) {
        splitArabicEditor.commands.setContent(parsed.arabic || "", false);
      }
      if (editor.getHTML() !== parsed.translation) {
        editor.commands.setContent(parsed.translation || "", false);
      }
    } else {
      const current = editor.getHTML();
      if (value !== current && document.activeElement?.tagName !== "TEXTAREA") {
        editor.commands.setContent(value || "", false);
      }
    }
  }, [value, editor, splitArabicEditor]);

  // Apply RTL mode to editor
  useEffect(() => {
    if (!editor) return;
    const el = editor.view.dom as HTMLElement;
    el.dir = rtlMode ? "rtl" : "ltr";
    el.classList.toggle("font-arabic", arabicMode);
    if (arabicMode) {
      el.style.fontFamily = "var(--font-arabic), serif";
      el.style.lineHeight = "2.2";
      el.style.fontSize = "1.2em";
    } else {
      el.style.fontFamily = "";
      el.style.lineHeight = "";
      el.style.fontSize = "";
    }
  }, [rtlMode, arabicMode, editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", "image");
        const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload gagal");
        const data = await res.json();
        return data.url as string;
      } catch (e: any) {
        toast.error(e.message || "Gagal mengunggah gambar");
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const url = await uploadImage(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor, uploadImage]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL link:", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  const addYouTube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Masukkan URL YouTube:");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // Insert footnote
  const insertFootnote = useCallback(() => {
    if (!editor) return;
    const n = footnoteCount + 1;
    editor
      .chain()
      .focus()
      .insertContent(
        `<sup data-footnote="${n}" class="text-primary font-semibold cursor-pointer" title="${footnoteText.replace(/"/g, "&quot;")}">${n}</sup>`
      )
      .run();
    setFootnoteCount(n);
    setFootnoteText("");
    setFootnoteOpen(false);
  }, [editor, footnoteCount, footnoteText]);

  // Insert chapter number
  const insertChapter = useCallback(() => {
    if (!editor) return;
    // Count existing chapters in document
    let count = 0;
    try {
      const html = editor.getHTML();
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      count = wrapper.querySelectorAll("span.chapter-num").length;
    } catch {
      // ignore
    }
    const n = count + 1;
    editor
      .chain()
      .focus()
      .insertContent(
        `<span class="chapter-num" data-level="1" style="display:inline-block; padding:2px 10px; margin:0 4px; background:rgba(5,150,105,0.12); color:#059669; border-radius:9999px; font-weight:600; font-size:0.85em;">Bab ${n}</span> `
      )
      .run();
  }, [editor]);

  // Insert verse number
  const insertVerse = useCallback(() => {
    if (!editor) return;
    let count = 0;
    try {
      const html = editor.getHTML();
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      count = wrapper.querySelectorAll("span.verse-num").length;
    } catch {
      // ignore
    }
    const n = count + 1;
    editor
      .chain()
      .focus()
      .insertContent(
        `<span class="verse-num" style="display:inline-block; padding:1px 6px; margin:0 2px; background:rgba(212,175,55,0.18); color:#92660f; border-radius:4px; font-size:0.8em; font-weight:600;">[${n}]</span> `
      )
      .run();
  }, [editor]);

  // Insert hadith number
  const insertHadith = useCallback(() => {
    if (!editor) return;
    const num = window.prompt("Masukkan nomor hadits:", "123");
    if (!num) return;
    editor
      .chain()
      .focus()
      .insertContent(
        `<span class="hadith-num" style="display:inline-block; padding:1px 8px; margin:0 4px; background:rgba(139,92,246,0.15); color:#7c3aed; border-radius:6px; font-size:0.8em; font-weight:600;">No. ${num.replace(/</g, "&lt;")}</span> `
      )
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div
        className="rounded-2xl border border-border/60 grid place-items-center bg-secondary/20"
        style={{ minHeight }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border/60 overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60 p-2 flex flex-wrap items-center gap-0.5">
        <ToolbarButton icon={Undo2} tooltip="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <ToolbarButton icon={Redo2} tooltip="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />

        <ToolbarDivider />

        {/* Heading dropdown */}
        <Select
          value={
            editor.isActive("heading", { level: 1 }) ? "h1" :
            editor.isActive("heading", { level: 2 }) ? "h2" :
            editor.isActive("heading", { level: 3 }) ? "h3" :
            "p"
          }
          onValueChange={(v) => {
            if (v === "p") editor.chain().focus().setParagraph().run();
            else if (v === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraf</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <ToolbarDivider />

        <ToolbarToggle icon={Bold} tooltip="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarToggle icon={Italic} tooltip="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarToggle icon={UnderlineIcon} tooltip="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarToggle icon={Strikethrough} tooltip="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <ToolbarToggle icon={SubscriptIcon} tooltip="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} />
        <ToolbarToggle icon={SuperscriptIcon} tooltip="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} />

        <ToolbarDivider />

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButtonRaw tooltip="Warna Teks" active={editor.isActive("textStyle")}>
              <Palette className="h-4 w-4" />
            </ToolbarButtonRaw>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-10 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                  className="w-5 h-5 rounded-md border border-border/60 hover:scale-110 transition-transform"
                  style={{ background: c }}
                  aria-label={`Warna ${c}`}
                />
              ))}
            </div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              Reset Warna
            </Button>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButtonRaw tooltip="Highlight" active={editor.isActive("highlight")}>
              <Highlighter className="h-4 w-4" />
            </ToolbarButtonRaw>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {HIGHLIGHTS.map((c) => (
                <button
                  key={c}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                  className="w-8 h-8 rounded-md border border-border/60 hover:scale-110 transition-transform"
                  style={{ background: c }}
                  aria-label={`Highlight ${c}`}
                />
              ))}
            </div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              Reset Highlight
            </Button>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        <ToolbarToggle icon={List} tooltip="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarToggle icon={ListOrdered} tooltip="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolbarToggle icon={ListChecks} tooltip="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} />
        <ToolbarToggle icon={Quote} tooltip="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolbarToggle icon={Code2} tooltip="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />

        <ToolbarDivider />

        <ToolbarToggle icon={AlignLeft} tooltip="Rata Kiri" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <ToolbarToggle icon={AlignCenter} tooltip="Rata Tengah" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <ToolbarToggle icon={AlignRight} tooltip="Rata Kanan" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
        <ToolbarToggle icon={AlignJustify} tooltip="Rata Kanan-Kiri" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} />

        <ToolbarDivider />

        <ToolbarButton icon={LinkIcon} tooltip="Tambah Link" onClick={setLink} active={editor.isActive("link")} />
        <ToolbarButton icon={ImageIcon} tooltip="Sisipkan Gambar" onClick={addImage} />
        <ToolbarButton icon={TableIcon} tooltip="Sisipkan Tabel" onClick={insertTable} />
        <ToolbarButton icon={Youtube} tooltip="Sisipkan Video YouTube" onClick={addYouTube} />
        <ToolbarButton icon={Minus} tooltip="Garis Pemisah" onClick={() => editor.chain().focus().setHorizontalRule().run()} />

        <ToolbarDivider />

        {/* Islamic / Kitab toolbar */}
        <Popover open={footnoteOpen} onOpenChange={setFootnoteOpen}>
          <PopoverTrigger asChild>
            <ToolbarButtonRaw tooltip="Sisipkan Footnote" active={false}>
              <Footprints className="h-4 w-4" />
            </ToolbarButtonRaw>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2">
            <Label className="text-xs">Teks Footnote</Label>
            <Input
              value={footnoteText}
              onChange={(e) => setFootnoteText(e.target.value)}
              placeholder="Catatan kaki…"
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertFootnote();
                }
              }}
            />
            <Button size="sm" className="w-full" onClick={insertFootnote}>
              Sisipkan sebagai superscript
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Nomor footnote akan di-auto-increment ({footnoteCount + 1} berikutnya).
            </p>
          </PopoverContent>
        </Popover>
        <ToolbarButton icon={Hash} tooltip="Sisipkan Nomor Bab" onClick={insertChapter} />
        <ToolbarButton icon={BookOpen} tooltip="Sisipkan Nomor Ayat" onClick={insertVerse} />
        <ToolbarButton icon={ScrollText} tooltip="Sisipkan Nomor Hadits" onClick={insertHadith} />

        <ToolbarDivider />

        {/* Split View + RTL / Arabic Mode */}
        <div className="flex items-center gap-2 ml-auto pl-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/60">
            <Columns className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Split</span>
            <Switch
              checked={splitMode}
              onCheckedChange={(v) => {
                setSplitMode(v);
                splitModeRef.current = v;
                if (v) {
                  // when enabling split, parse current content
                  const parsed = parseSplitContent(editor.getHTML());
                  if (parsed) {
                    splitArabicEditor?.commands.setContent(parsed.arabic || "", false);
                    editor.commands.setContent(parsed.translation || "", false);
                  } else {
                    // move existing content to translation, clear arabic
                    const current = editor.getHTML();
                    splitArabicEditor?.commands.setContent("", false);
                    editor.commands.setContent(current, false);
                  }
                } else {
                  // when disabling split, parse combined content back to single
                  const ar = splitArabicEditor?.getHTML() ?? "";
                  const tr = editor.getHTML();
                  if (ar.trim() && ar !== "<p></p>" && tr.trim() && tr !== "<p></p>") {
                    // combine into one — keep arabic at top, translation below
                    const combined = `${ar}<hr class="my-4 border-border/60" />${tr}`;
                    editor.commands.setContent(combined, false);
                    onChange(combined);
                    lastEmittedRef.current = combined;
                  } else if (ar.trim() && ar !== "<p></p>") {
                    editor.commands.setContent(ar, false);
                    onChange(ar);
                    lastEmittedRef.current = ar;
                  } else if (tr.trim() && tr !== "<p></p>") {
                    editor.commands.setContent(tr, false);
                    onChange(tr);
                    lastEmittedRef.current = tr;
                  }
                }
              }}
              className="scale-75 origin-center"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/60">
            <Languages className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">RTL</span>
            <Switch
              checked={rtlMode}
              onCheckedChange={setRtlMode}
              className="scale-75 origin-center"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/60">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Arab</span>
            <Switch
              checked={arabicMode}
              onCheckedChange={setArabicMode}
              className="scale-75 origin-center"
            />
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative">
        {isUploading && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah gambar…
            </div>
          </div>
        )}

        {splitMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
            <div>
              <div className="px-5 py-2 bg-secondary/40 border-b border-border/60 text-[11px] font-medium text-muted-foreground flex items-center gap-2">
                <Languages className="h-3.5 w-3.5" /> Teks Arab (RTL)
              </div>
              {splitArabicEditor && <EditorContent editor={splitArabicEditor} />}
            </div>
            <div>
              <div className="px-5 py-2 bg-secondary/40 border-b border-border/60 text-[11px] font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Terjemahan / Latin
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-border/60 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/30">
        <div className="flex items-center gap-3">
          <span>{editor.storage.characterCount?.characters?.() ?? 0} karakter</span>
          <span>{editor.storage.characterCount?.words?.() ?? 0} kata</span>
          {footnoteCount > 0 && <span>{footnoteCount} footnote</span>}
        </div>
        <div className="flex items-center gap-2">
          {splitMode && <span className="text-emerald-600 font-medium">Split Aktif</span>}
          {rtlMode && <span className="text-amber-600 font-medium">RTL Aktif</span>}
          {arabicMode && <span className="text-emerald-600 font-medium">Mode Arab</span>}
          <span>HTML</span>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  onClick,
  active,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        "h-8 w-8 rounded-lg",
        active && "bg-primary/15 text-primary",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function ToolbarToggle(props: Omit<Parameters<typeof ToolbarButton>[0], "active"> & { active: boolean }) {
  return <ToolbarButton {...props} />;
}

function ToolbarButtonRaw({
  children,
  tooltip,
  active,
  onClick,
}: {
  children: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      className={cn("h-8 w-8 rounded-lg", active && "bg-primary/15 text-primary")}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <Separator orientation="vertical" className="h-6 mx-1" />;
}
