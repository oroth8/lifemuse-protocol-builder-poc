"use client";

import { useCallback, useRef } from "react";

function ToolbarBtn({ onAction, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAction}
      className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
    >
      {children}
    </button>
  );
}

function exec(name, value = null) {
  try {
    document.execCommand(name, false, value);
  } catch {
    /* noop */
  }
}

export function RichTextEditor({ onChange, className = "" }) {
  const elRef = useRef(null);

  const sync = useCallback(() => {
    const el = elRef.current;
    if (el) onChange?.(el.innerHTML);
  }, [onChange]);

  const run = useCallback(
    (name, val = null) => {
      elRef.current?.focus();
      exec(name, val);
      sync();
    },
    [sync],
  );

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarBtn title="Undo" onAction={() => run("undo")}>
          ↶
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onAction={() => run("redo")}>
          ↷
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <select
          className="max-w-[140px] rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800"
          defaultValue="p"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => run("formatBlock", e.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <ToolbarBtn title="Bold" onAction={() => run("bold")}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="Italic" onAction={() => run("italic")}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="Underline" onAction={() => run("underline")}>
          <span className="underline">U</span>
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <ToolbarBtn title="Align left" onAction={() => run("justifyLeft")}>
          L
        </ToolbarBtn>
        <ToolbarBtn title="Align center" onAction={() => run("justifyCenter")}>
          C
        </ToolbarBtn>
        <ToolbarBtn title="Align right" onAction={() => run("justifyRight")}>
          R
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <ToolbarBtn title="Bullet list" onAction={() => run("insertUnorderedList")}>
          • List
        </ToolbarBtn>
        <ToolbarBtn title="Numbered list" onAction={() => run("insertOrderedList")}>
          1. List
        </ToolbarBtn>
        <ToolbarBtn title="Horizontal line" onAction={() => run("insertHorizontalRule")}>
          HR
        </ToolbarBtn>
        <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden />
        <ToolbarBtn
          title="Link"
          onAction={() => {
            const url = typeof window !== "undefined" ? window.prompt("Link URL", "https://") : "";
            if (url) run("createLink", url);
          }}
        >
          Link
        </ToolbarBtn>
        <ToolbarBtn
          title="Image"
          onAction={() => {
            const url = typeof window !== "undefined" ? window.prompt("Image URL", "https://") : "";
            if (url) run("insertImage", url);
          }}
        >
          Image
        </ToolbarBtn>
      </div>
      <div
        ref={elRef}
        className="min-h-[220px] px-3 py-2 text-sm text-gray-900 outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
      />
    </div>
  );
}
