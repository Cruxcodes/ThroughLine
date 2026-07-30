import request from "supertest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

async function loadApp() {
  const { app } = await import("../src/index");
  return app;
}

test("rejects requests without an API key when THROUGHLINE_API_KEY is set", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  const app = await loadApp();

  const r = await request(app).get("/api/brief/recipients");
  expect(r.status).toBe(401);
  expect(r.body.error).toMatch(/api key/i);
});

test("accepts a matching Bearer token", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  const app = await loadApp();

  const r = await request(app)
    .get("/api/brief/recipients")
    .set("Authorization", "Bearer secret-demo-key");
  expect(r.status).toBe(200);
});

test("accepts a matching X-API-Key header", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  const app = await loadApp();

  const r = await request(app)
    .get("/api/brief/recipients")
    .set("X-API-Key", "secret-demo-key");
  expect(r.status).toBe(200);
});

test("rejects a wrong API key", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  const app = await loadApp();

  const r = await request(app)
    .get("/api/brief/recipients")
    .set("Authorization", "Bearer wrong");
  expect(r.status).toBe(401);
});

test("rate-limits repeated requests from the same client", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX = "3";
  const app = await loadApp();

  const hit = () =>
    request(app)
      .get("/api/brief/recipients")
      .set("X-API-Key", "secret-demo-key");

  expect((await hit()).status).toBe(200);
  expect((await hit()).status).toBe(200);
  expect((await hit()).status).toBe(200);

  const blocked = await hit();
  expect(blocked.status).toBe(429);
  expect(blocked.body.error).toMatch(/rate/i);
});

// Behind a managed host's load balancer every request arrives from the proxy, so
// req.socket.remoteAddress is identical for all clients. Without trust proxy the
// per-IP limit collapses into one global bucket and one busy user 429s everyone.
test("counts forwarded clients separately when TRUST_PROXY is set", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX = "2";
  process.env.TRUST_PROXY = "1";
  const app = await loadApp();

  const hit = (ip: string) =>
    request(app)
      .get("/api/brief/recipients")
      .set("X-API-Key", "secret-demo-key")
      .set("X-Forwarded-For", ip);

  expect((await hit("203.0.113.1")).status).toBe(200);
  expect((await hit("203.0.113.1")).status).toBe(200);
  expect((await hit("203.0.113.1")).status).toBe(429);

  // A different client must still have its full allowance.
  expect((await hit("203.0.113.2")).status).toBe(200);
});

// Without TRUST_PROXY, X-Forwarded-For is attacker-controlled: honouring it would
// let one caller mint a fresh bucket per request and bypass the limit outright.
test("ignores X-Forwarded-For when TRUST_PROXY is unset", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  process.env.RATE_LIMIT_WINDOW_MS = "60000";
  process.env.RATE_LIMIT_MAX = "2";
  delete process.env.TRUST_PROXY;
  const app = await loadApp();

  const hit = (ip: string) =>
    request(app)
      .get("/api/brief/recipients")
      .set("X-API-Key", "secret-demo-key")
      .set("X-Forwarded-For", ip);

  expect((await hit("203.0.113.1")).status).toBe(200);
  expect((await hit("203.0.113.2")).status).toBe(200);
  expect((await hit("203.0.113.3")).status).toBe(429);
});

// The bucket Map held one entry per IP ever seen, for the life of the process.
test("reclaims expired rate-limit buckets instead of growing forever", async () => {
  process.env.THROUGHLINE_API_KEY = "secret-demo-key";
  process.env.RATE_LIMIT_WINDOW_MS = "1000";
  process.env.RATE_LIMIT_MAX = "100";
  process.env.TRUST_PROXY = "1";
  const app = await loadApp();
  const { rateLimitBucketCount } = await import("../src/middleware/guard");

  const hit = (ip: string) =>
    request(app)
      .get("/api/brief/recipients")
      .set("X-API-Key", "secret-demo-key")
      .set("X-Forwarded-For", ip);

  const now = Date.now();
  const clock = jest.spyOn(Date, "now").mockReturnValue(now);

  for (let i = 0; i < 50; i++) await hit(`203.0.113.${i}`);
  expect(rateLimitBucketCount()).toBe(50);

  // Well past the window: the old buckets are dead weight and must be dropped.
  clock.mockReturnValue(now + 60_000);
  await hit("198.51.100.1");
  expect(rateLimitBucketCount()).toBe(1);

  clock.mockRestore();
});
