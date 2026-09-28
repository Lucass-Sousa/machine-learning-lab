"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { PythonSnippet } from "@/lib/python-reference/linear-regression/snippets";
import { cn } from "@/lib/utils/cn";

type PythonCodePanelProps = {
  snippets: PythonSnippet[];
  className?: string;
  /** Optional contextual note, e.g. current GD iteration */
  contextNote?: string;
};

export function PythonCodePanel({
  snippets,
  className,
  contextNote,
}: PythonCodePanelProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(snippets[0]?.id);
  const [copied, setCopied] = useState(false);
  const panelId = useId();

  const active =
    snippets.find((snippet) => snippet.id === activeId) ?? snippets[0];

  if (!active) return null;

  async function copyCode() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span>🐍 Ver código Python</span>
        <span className="font-mono text-xs text-muted">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Python
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {active.description}
          </p>
          {contextNote ? (
            <p className="mt-2 text-xs text-foreground">{contextNote}</p>
          ) : null}

          {snippets.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {snippets.map((snippet) => (
                <button
                  key={snippet.id}
                  type="button"
                  onClick={() => setActiveId(snippet.id)}
                  className={cn(
                    "min-h-10 rounded-md border px-3 text-xs font-medium transition-colors",
                    snippet.id === active.id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {snippet.title}
                </button>
              ))}
            </div>
          ) : null}

          <pre className="mt-4 overflow-x-auto rounded-md bg-foreground px-4 py-4 text-xs leading-relaxed text-background sm:text-sm">
            <code>{active.code}</code>
          </pre>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={copyCode}>
              {copied ? "Copiado" : "Copiar código"}
            </Button>
            <span className="text-xs text-muted">linguagem: Python · NumPy</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
