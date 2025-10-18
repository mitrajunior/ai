import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";

interface TerminalProps {
  value: string;
}

export default function Terminal({ value }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new XTerm({ convertEol: true, disableStdin: true });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    return () => {
      terminal.dispose();
      fitAddon.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.clear();
    const text = value ? value.replace(/\r?\n/g, "\r\n") : "";
    terminalRef.current.write(text);
    fitAddonRef.current?.fit();
  }, [value]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", backgroundColor: "#000" }} />;
}
