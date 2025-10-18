import { useState } from "react";
import dynamic from "next/dynamic";
import Chat from "@/components/Chat";
import { runCmd } from "@/lib/api";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });

export default function Home() {
  const [code, setCode] = useState<string>('print("hello aiide")');
  const [output, setOutput] = useState<string>("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [chatLog, setChatLog] = useState<string[]>([]);

  async function handleRun() {
    setRunning(true);
    try {
      const cmd = `python -c ${JSON.stringify(code)}`;
      const response = await runCmd("python", cmd);
      setOutput(response.output ?? "");
      setExitCode(response.exit_code);
    } catch (error) {
      setOutput(String(error));
      setExitCode(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        height: "100vh",
        background: "#1e1e1e",
        color: "#fff",
      }}
    >
      <div style={{ display: "grid", gridTemplateRows: "1fr 200px" }}>
        <Editor value={code} onChange={setCode} />
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", padding: 12, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={handleRun} disabled={running}>
              {running ? "Executando..." : "Run"}
            </button>
            {exitCode !== null && <span>exit: {exitCode}</span>}
          </div>
          <div style={{ border: "1px solid #333", borderRadius: 4, overflow: "hidden" }}>
            <Terminal value={output} />
          </div>
        </div>
      </div>
      <aside style={{ borderLeft: "1px solid #333", padding: 16, display: "grid", gridTemplateRows: "auto 1fr", gap: 12 }}>
        <div>
          <h3>Chat IA</h3>
          <p style={{ color: "#bdbdbd", fontSize: 14 }}>
            Converse com o modelo via Ollama integrado para tirar dúvidas sobre o projeto.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 12 }}>
          <div style={{ border: "1px solid #333", borderRadius: 4, padding: 12, background: "#111", overflowY: "auto" }}>
            {chatLog.length === 0 ? (
              <p style={{ color: "#777", margin: 0 }}>Nenhuma mensagem ainda.</p>
            ) : (
              chatLog.map((entry, index) => (
                <p key={index} style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {entry}
                </p>
              ))
            )}
          </div>
          <Chat
            onMessage={(prompt, response) =>
              setChatLog((prev) => [...prev, `Você: ${prompt}`, `AI: ${response}`])
            }
          />
        </div>
      </aside>
    </div>
  );
}
