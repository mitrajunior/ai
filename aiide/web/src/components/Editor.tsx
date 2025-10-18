import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface EditorProps {
  value: string;
  language?: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, language = "python", onChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language,
      automaticLayout: true,
      minimap: { enabled: false },
      theme: "vs-dark",
    });

    const subscription = editorRef.current.onDidChangeModelContent(() => {
      if (editorRef.current) {
        onChange(editorRef.current.getValue());
      }
    });

    return () => {
      subscription.dispose();
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
