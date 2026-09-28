"use client";

import { PythonCodePanel } from "@/components/learn/python/PythonCodePanel";
import { PythonValidationPanel } from "@/components/learn/python/PythonValidationPanel";
import type { ValidationRequest } from "@/lib/python-reference/compare";
import {
  LINEAR_REGRESSION_SNIPPETS,
  STEP_PYTHON_SNIPPETS,
  type PythonSnippetId,
} from "@/lib/python-reference/linear-regression/snippets";

type PythonDepthSectionProps = {
  stepId: string;
  buildRequest: () => ValidationRequest | null;
  contextNote?: string;
  snippetIds?: PythonSnippetId[];
};

/**
 * Levels 2.5–3 of depth: educational Python + optional numeric validation.
 */
export function PythonDepthSection({
  stepId,
  buildRequest,
  contextNote,
  snippetIds,
}: PythonDepthSectionProps) {
  const ids =
    snippetIds ??
    (STEP_PYTHON_SNIPPETS[stepId] as PythonSnippetId[] | undefined) ??
    [];

  const snippets = ids
    .map((id) => LINEAR_REGRESSION_SNIPPETS[id])
    .filter(Boolean);

  if (snippets.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <PythonCodePanel snippets={snippets} contextNote={contextNote} />
      <PythonValidationPanel buildRequest={buildRequest} />
    </div>
  );
}
