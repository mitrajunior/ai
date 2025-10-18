import { useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface EditorProps {
  value: string;
  language?: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, language = "python", onChange }: EditorProps) {
  const handleMount = useCallback<OnMount>((editorInstance) => {
    editorInstance.focus();
  }, []);

  const handleChange = useCallback(
    (content?: string) => {
      onChange(content ?? "");
    },
    [onChange]
  );

  return (
    <Editor
      theme="vs-dark"
      language={language}
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
      }}
      height="100%"
    />
  );
}
