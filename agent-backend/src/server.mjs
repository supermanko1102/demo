import { createServer } from "node:http";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { createAgentBackend } from "./agent/build-flow.mjs";

const PORT = Number(process.env.AGENT_BACKEND_PORT ?? 3400);
const DEFAULT_TIMEZONE = "Asia/Taipei";
const MODEL = process.env.GENKIT_MODEL ?? "gemini-2.5-flash";
const UPSTREAM_API_BASE_URL =
  process.env.UPSTREAM_API_BASE_URL ??
  "https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws";

const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(MODEL),
});

const { agentChatFlow, chatInputSchema, getBearerToken } = createAgentBackend({
  ai,
  defaultTimezone: DEFAULT_TIMEZONE,
  upstreamApiBaseUrl: UPSTREAM_API_BASE_URL,
});

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  let totalSize = 0;
  const maxSize = 1024 * 1024;

  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > maxSize) {
      throw new Error("Payload too large");
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    throw new Error("Empty request body");
  }

  return JSON.parse(raw);
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, { error: "Invalid request" });
  }

  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "agent-backend",
      model: MODEL,
      upstreamApiBaseUrl: UPSTREAM_API_BASE_URL,
    });
  }

  if (req.method === "POST" && req.url === "/chat") {
    if (!process.env.GEMINI_API_KEY) {
      return sendJson(res, 500, {
        error: "GEMINI_API_KEY is not set",
      });
    }

    try {
      const body = await readJsonBody(req);
      const parsed = chatInputSchema.safeParse(body);

      if (!parsed.success) {
        return sendJson(res, 400, {
          error: "Invalid input",
          issues: parsed.error.issues,
        });
      }

      const accessToken = getBearerToken(req.headers.authorization);
      const result = await agentChatFlow(parsed.data, {
        context: { accessToken },
      });
      return sendJson(res, 200, result);
    } catch (error) {
      if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
        const message = error instanceof Error ? error.message : "Upstream API error";
        const code = typeof error.code === "string" ? error.code : undefined;
        return sendJson(res, error.status, {
          error: message,
          message,
          ...(code ? { code } : {}),
        });
      }

      const message = error instanceof Error ? error.message : "Unknown server error";
      return sendJson(res, 500, { error: message, message });
    }
  }

  return sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[agent-backend] listening on http://localhost:${PORT}`);
});
