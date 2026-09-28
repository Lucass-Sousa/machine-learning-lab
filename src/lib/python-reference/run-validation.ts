import { spawn } from "node:child_process";

import type {
  ValidationReport,
  ValidationRequest,
} from "@/lib/python-reference/compare";

/**
 * Runs the Python validation module when available.
 * Never called automatically on every UI interaction.
 */
export function runPythonValidation(
  request: ValidationRequest,
): Promise<ValidationReport> {
  const projectRoot = process.cwd();
  const payload = JSON.stringify(request);

  return new Promise((resolve) => {
    const child = spawn(
      /* turbopackIgnore: true */ process.env.PYTHON_BIN ?? "python3",
      ["-m", "python.linear_regression.validation"],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          PYTHONPATH: projectRoot,
        },
      },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({
        ok: false,
        available: false,
        error: error.message,
        message:
          "Python não está disponível neste ambiente. Instale as dependências de python/requirements.txt.",
      });
    });

    child.on("close", (code) => {
      if (!stdout.trim()) {
        resolve({
          ok: false,
          available: false,
          error: stderr || `Python exited with code ${code}`,
          message:
            "Não foi possível executar a validação Python. Veja python/README.md.",
        });
        return;
      }

      try {
        const parsed = JSON.parse(stdout) as ValidationReport;
        resolve({ ...parsed, available: true });
      } catch {
        resolve({
          ok: false,
          available: false,
          error: stderr || stdout,
          message: "A saída do validador Python não é JSON válido.",
        });
      }
    });

    child.stdin.write(payload);
    child.stdin.end();
  });
}
