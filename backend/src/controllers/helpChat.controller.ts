// backend/src/controllers/helpChat.controller.ts
import type { Request, Response } from "express";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL || "claude-haiku-4-5-20251001";

export const HELP_CHAT_MAX_MESSAGE_LENGTH = 1000;
const MAX_OUTPUT_TOKENS = 400;

const PROMPT_INSTRUCTIONS = `
Eres el asistente de ayuda de ASCALEdin. Tu tarea es orientar al usuario dentro de la plataforma de forma breve, clara y segura.

Responde solo sobre el uso de la plataforma: empleos, postulaciones, servicios profesionales, perfil, empresas, roles CLIENTE, PRO y EMPRESA, busqueda y navegacion general.

Si el usuario pregunta algo fuera del sistema, responde que solo puedes ayudar con dudas sobre la plataforma.

No inventes funcionalidades que no existen. Si no sabes algo, indica que debe revisar el menu o contactar soporte.

Responde en el idioma del usuario.

REGLAS DE FORMATO:
- Responde en texto plano, como una conversacion de chat normal. No uses encabezados markdown, negritas ni emojis.
- Maximo 2 a 4 oraciones por respuesta. Si necesitas listar opciones, usa como maximo 3 vinetas cortas con guion simple.
- No agregues saludos largos ni cierres genericos salvo que la pregunta sea ambigua y necesites pedir una aclaracion.
- Se directo: contesta exactamente lo que se pregunto, sin explicar todo el sistema de roles si el usuario no lo pidio.

Informacion funcional disponible:
- CLIENTE puede explorar empleos, postular a empleos y revisar servicios/profesionales.
- PRO puede crear perfil profesional, crear/listar/editar/desactivar servicios, explorar empresas y enviar solicitudes.
- EMPRESA puede crear/listar/editar/desactivar empleos, ver postulantes y aceptar o rechazar postulaciones.
- La plataforma tiene busqueda en el Navbar.
- La plataforma usa perfil, menu de navegacion, empleos, profesionales, empresas y servicios.
- Algunas funcionalidades pueden depender del rol del usuario.
`.trim();

type AnthropicContentBlock = {
  type?: string;
  text?: string;
};

type AnthropicResponseBody = {
  content?: AnthropicContentBlock[];
  stop_reason?: string | null;
  error?: {
    type?: string;
    message?: string;
  };
};

type HelpChatValidationResult =
  | { ok: true; message: string }
  | { ok: false; status: number; error: string };

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateHelpChatMessage(
  message: unknown
): HelpChatValidationResult {
  if (message === undefined) {
    return {
      ok: false,
      status: 400,
      error: "El mensaje es requerido",
    };
  }

  if (typeof message !== "string") {
    return {
      ok: false,
      status: 400,
      error: "El mensaje debe ser texto",
    };
  }

  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return {
      ok: false,
      status: 400,
      error: "El mensaje no puede estar vacio",
    };
  }

  if (normalizedMessage.length > HELP_CHAT_MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `El mensaje no puede superar ${HELP_CHAT_MAX_MESSAGE_LENGTH} caracteres`,
    };
  }

  return {
    ok: true,
    message: normalizedMessage,
  };
}

function extractReply(data: AnthropicResponseBody): string | null {
  const textBlock = data.content?.find(
    (block) => block.type === "text" && isNonEmptyString(block.text)
  );

  return textBlock?.text ? textBlock.text.trim() : null;
}

function logAnthropicResponseShape(
  responseStatus: number,
  data: AnthropicResponseBody | null
) {
  if (!isDevelopment()) {
    return;
  }

  const contentTypes = (data?.content ?? []).map(
    (block) => block.type ?? "unknown"
  );

  console.info("helpChat Anthropic response shape:", {
    status: responseStatus,
    stopReason: data?.stop_reason ?? null,
    contentTypes,
  });
}

function logAnthropicErrorShape(
  responseStatus: number,
  data: AnthropicResponseBody | null
) {
  if (!isDevelopment()) {
    return;
  }

  console.info("helpChat Anthropic error shape:", {
    status: responseStatus,
    errorType: data?.error?.type ?? null,
    errorMessage: data?.error?.message ?? null,
  });
}

function getAnthropicErrorResponse(status: number) {
  if (status === 400 || status === 413) {
    return {
      status: 502,
      error: "No se pudo procesar la solicitud del asistente.",
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: 503,
      error: "El asistente no esta autorizado correctamente.",
    };
  }

  if (status === 404) {
    return {
      status: 503,
      error: "El modelo configurado para el asistente no esta disponible.",
    };
  }

  if (status === 429) {
    return {
      status: 429,
      error: "El asistente alcanzo el limite de uso.",
    };
  }

  if (status === 504) {
    return {
      status: 504,
      error: "El asistente tardo demasiado en responder.",
    };
  }

  if (status === 529 || status >= 500) {
    return {
      status: 503,
      error: "El asistente no esta disponible temporalmente.",
    };
  }

  return {
    status: 502,
    error: "No se pudo obtener respuesta del asistente.",
  };
}

export async function sendHelpChatMessage(req: Request, res: Response) {
  try {
    const validation = validateHelpChatMessage(req.body?.message);

    if (!validation.ok) {
      return res.status(validation.status).json({
        error: validation.error,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "El asistente no esta configurado",
      });
    }

    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        system: PROMPT_INSTRUCTIONS,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: "user", content: validation.message }],
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | AnthropicResponseBody
      | null;

    logAnthropicResponseShape(response.status, data);

    if (!response.ok) {
      const controlledError = getAnthropicErrorResponse(response.status);

      logAnthropicErrorShape(response.status, data);

      return res.status(controlledError.status).json({
        error: controlledError.error,
      });
    }

    if (data?.stop_reason === "refusal") {
      return res.json({
        reply:
          "No puedo responder esa consulta. Tienes alguna otra duda sobre el uso de la plataforma?",
      });
    }

    const reply = data ? extractReply(data) : null;

    if (!reply) {
      return res.status(502).json({
        error: "El asistente no devolvio una respuesta valida",
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error(
      "sendHelpChatMessage error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}
