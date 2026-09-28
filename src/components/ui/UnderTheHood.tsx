"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";

type UnderTheHoodProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

export function UnderTheHood({
  title = "Under the Hood",
  children,
  className,
  defaultOpen = false,
}: UnderTheHoodProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span>{title}</span>
        <span className="font-mono text-xs text-muted">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
