import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
  value: string;
}

export default function Terminal({ value }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    terminalRef.current = new XTerm({ convertEol: true, disableStdin: true });
    fitAddonRef.current = new FitAddon();
    terminalRef.current.loadAddon(fitAddonRef.current);
    terminalRef.current.open(containerRef.current);
    fitAddonRef.current.fit();

    return () => {
      terminalRef.current?.dispose();
      fitAddonRef.current?.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.clear();
    terminalRef.current.write(value || "");
  }, [value]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", backgroundColor: "#000" }} />;
}
