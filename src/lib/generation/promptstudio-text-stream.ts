import type { ChatMessageResult, ChatParams } from "@/lib/chat-types";

export type PromptStudioTextStreamCallbacks = {
  onText?: (text: string) => void;
  onGenerationId?: (generationId: string) => void;
};

type OpenAIStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

export async function generatePromptStudioTextStream(
  prompt: string,
  params: ChatParams,
  callbacks: PromptStudioTextStreamCallbacks = {},
  signal?: AbortSignal,
): Promise<{ result?: ChatMessageResult; error?: string }> {
  try {
    const response = await fetch("/api/ai/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...(params.systemInstruction
            ? [{ role: "system", content: params.systemInstruction }]
            : []),
          { role: "user", content: prompt },
        ],
        maxTokens: maxTokensForThinking(params.thinkingLevel),
        temperature: 0.7,
        stream: true,
      }),
      signal,
    });

    const generationId = response.headers.get("X-Generation-Id");
    if (generationId) callbacks.onGenerationId?.(generationId);

    if (!response.ok) {
      return { error: await publicErrorMessage(response) };
    }

    if (!response.body) {
      return { error: "El servidor no devolvió un stream de texto." };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        for (const line of event.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const chunk = JSON.parse(data) as OpenAIStreamChunk;
            const text = chunk.choices?.[0]?.delta?.content;
            if (!text) continue;
            output += text;
            callbacks.onText?.(output);
          } catch {
            // Ignore malformed/unknown SSE metadata without exposing it to UI.
          }
        }
      }
    }

    if (!output.trim()) {
      return { error: "PromptStudio AI no devolvió contenido." };
    }

    return {
      result: {
        text: output,
        provider: "PromptStudio AI",
      },
    };
  } catch (error) {
    if (signal?.aborted) {
      return { error: "Generación cancelada." };
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al conectar con PromptStudio AI.",
    };
  }
}

export function isPromptStudioTextStreamingEnabled(
  envValue = process.env.NEXT_PUBLIC_PROMPTSTUDIO_TEXT_STREAMING,
): boolean {
  return envValue === "true";
}

function maxTokensForThinking(level: string | undefined): number {
  switch (level) {
    case "high":
      return 2_048;
    case "minimal":
      return 768;
    default:
      return 1_024;
  }
}

async function publicErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      error?: { code?: string; message?: string } | string;
    };
    if (typeof payload.error === "string") return payload.error;
    if (payload.error?.message) return payload.error.message;
  } catch {
    // Fall through to stable user-facing message.
  }

  if (response.status === 401) return "Inicia sesión para generar texto.";
  if (response.status === 429) {
    return "Has realizado demasiadas generaciones. Inténtalo de nuevo en unos segundos.";
  }
  if (response.status === 504) {
    return "PromptStudio AI tardó demasiado. Puedes volver a intentarlo.";
  }
  return "PromptStudio AI no está disponible temporalmente.";
}
