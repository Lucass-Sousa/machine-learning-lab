import { NextResponse } from "next/server";

import type { ValidationRequest } from "@/lib/python-reference/compare";
import { runPythonValidation } from "@/lib/python-reference/run-validation";

export const runtime = "nodejs";

/**
 * Optional on-demand validation. The lab UI never depends on this for
 * interactive recalculation — only when the user asks to validate.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidationRequest;

    if (!body?.algorithm || !Array.isArray(body.points)) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          error: "Payload inválido",
          message: "Envie algorithm, points e lab.",
        },
        { status: 400 },
      );
    }

    const report = await runPythonValidation(body);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Falha ao executar a validação Python.",
      },
      { status: 500 },
    );
  }
}
