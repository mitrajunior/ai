import { FormEvent, useState } from "react";
import { askAI } from "@/lib/api";

interface ChatProps {
  onMessage: (userPrompt: string, response: string) => void;
}

export default function Chat({ onMessage }: ChatProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt) return;

    setLoading(true);
    try {
      const response = await askAI(prompt);
      const text = response.response || response.output || JSON.stringify(response);
      onMessage(prompt, text);
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={6}
        style={{ width: "100%" }}
        placeholder="Pergunte algo ao assistente"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Perguntando..." : "Perguntar"}
      </button>
    </form>
  );
}
