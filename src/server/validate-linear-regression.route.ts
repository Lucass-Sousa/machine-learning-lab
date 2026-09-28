/**
 * Reference handler for optional Python validation.
 *
 * Not mounted as a Next.js Route Handler — static export (GitHub Pages)
 * does not support API routes. Local CLI validation remains available via:
 *   npm run validate:ml
 *   npm run validate:ml:example
 *
 * To re-enable an HTTP endpoint, host on a Node server (e.g. Vercel) and
 * restore `src/app/api/validate/linear-regression/route.ts`.
 */

import type { ValidationRequest } from "@/lib/python-reference/compare";
import { runPythonValidation } from "@/lib/python-reference/run-validation";

export async function handleLinearRegressionValidation(
  body: ValidationRequest,
) {
  if (!body?.algorithm || !Array.isArray(body.points)) {
    return {
      ok: false as const,
      available: false as const,
      error: "Payload inválido",
      message: "Envie algorithm, points e lab.",
    };
  }

  return runPythonValidation(body);
}
