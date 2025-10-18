import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8188";

type RunResponse = {
  exit_code: number;
  output: string;
};

type ChatResponse = {
  response?: string;
  output?: string;
};

export async function runCmd(lang: string, cmd: string): Promise<RunResponse> {
  const response = await axios.post(`${API}/run`, { lang, cmd, proj_id: "demo" });
  return response.data;
}

export async function askAI(prompt: string): Promise<ChatResponse> {
  const response = await axios.post(`${API}/chat`, { prompt });
  return response.data;
}
