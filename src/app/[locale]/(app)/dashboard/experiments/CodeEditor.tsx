"use client";

import dynamic from "next/dynamic";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";

// CodeMirror touches the DOM, so load it client-only.
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <div className="h-[180px] rounded-lg bg-surface-container animate-pulse" />,
});

export function CodeEditor({
  value,
  language,
  onChange,
  placeholder,
}: {
  value: string;
  language: "js" | "css";
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-outline-variant/30">
      <CodeMirror
        value={value}
        height="180px"
        theme="dark"
        placeholder={placeholder}
        extensions={[language === "js" ? javascript() : css()]}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
}
