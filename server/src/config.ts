import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),

  // Shared secret the mobile app sends as Bearer / X-API-Key. When unset,
  // local/demo requests are open; production refuses to serve without it.
  apiKey: process.env.THROUGHLINE_API_KEY ?? "",

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX ?? 60) || 60,
  },

  // How many proxies sit in front of the app. A managed host terminates TLS at a
  // load balancer, so every request's socket address is the balancer's and the
  // per-IP rate limit would degrade into one bucket shared by all users. Set this
  // to the hop count (usually "1") in production so `req.ip` resolves to the real
  // client. Off by default on purpose: with nothing in front, X-Forwarded-For is
  // caller-supplied, and trusting it would let one client mint a fresh bucket per
  // request. Also accepts anything Express's "trust proxy" takes (IP/CIDR list).
  trustProxy: (process.env.TRUST_PROXY ?? "").trim(),

  glm: {
    apiKey: process.env.GLM_API_KEY,
    baseUrl:
      process.env.GLM_BASE_URL ??
      "https://api.z.ai/api/paas/v4/chat/completions",
    model: process.env.GLM_MODEL ?? "glm-5.1",
  },

  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  nhsServiceSearchKey: process.env.NHS_SERVICE_SEARCH_KEY,

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};
