import { Hono } from "hono";
import { cors } from "hono/cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { facilitator } from "@payai/facilitator";
import { renderPdf, LIMITS } from "./pdf.js";
import { FACTS } from "./facts.js";

export const PAY_TO = "0x152cCC3a3DFAFF7E03cA5345d07f0BBA6bFB9646"; // receive-only
export const PRICE = "$0.01";
const NETWORK = "eip155:8453"; // Base mainnet, USDC
const SAMPLE = "## Launch checklist\n- [ ] Write acceptance criteria\n- [ ] Cite every source\n- [ ] Proofread\n\n## Notes\nPlain markdown in, a print-ready PDF out. Headings, paragraphs, bullets, numbered lists, [ ] checkboxes and --- rules are supported.";
const inputSchema = { type: "object", required: ["markdown"], properties: {
  markdown: { type: "string", maxLength: LIMITS.maxChars, description: "Markdown subset: #/##/### headings, paragraphs, - bullets, 1. lists, - [ ] checkboxes, --- rules" },
  title: { type: "string" }, paper: { type: "string", enum: ["letter", "a4"] },
  accent_color: { type: "string", description: "hex like #1f5f8b" }, footer: { type: "string" } } };

export function buildApp() {
  const app = new Hono();
  // CORS first, so browser buyers can read the 402 and send PAYMENT-SIGNATURE.
  app.use(cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "PAYMENT-SIGNATURE", "X-PAYMENT"],
    exposeHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"], maxAge: 86400 }));
  app.use(paymentMiddleware({
    "POST /v1/printable-pdf": {
      accepts: [{ scheme: "exact", price: PRICE, network: NETWORK, payTo: PAY_TO }],
      description: "Markdown to a clean, print-ready PDF (US Letter or A4): one-pagers, checklists with tick boxes, cheat sheets, planner pages. Deterministic, no AI rewriting, up to 4 pages / 12k chars. Returns application/pdf.",
      mimeType: "application/pdf", serviceName: "cc-research-desk Printable PDF", tags: ["pdf", "printable", "markdown", "checklist", "documents"],
      extensions: { ...declareDiscoveryExtension({ bodyType: "json", input: { title: "Launch checklist", markdown: SAMPLE, paper: "letter" }, inputSchema, output: { example: { contentType: "application/pdf", pages: 1, note: "response body is the PDF bytes" } } }) },
    },
  }, new x402ResourceServer(new HTTPFacilitatorClient(facilitator)).register(NETWORK, new ExactEvmScheme())));

  app.get("/", c => c.json({ service: "cc-research-desk Printable PDF (x402)", paid_endpoint: "POST /v1/printable-pdf", price: PRICE + " USDC on Base (x402 exact)", payTo: PAY_TO,
    free_sample: "GET /sample.pdf", body: inputSchema, operator: "cc-research-desk (AI agent with a human operator), https://thecolony.ai/u/cc-research-desk", source: "https://github.com/cc-research-desk/x402-printable-pdf", field_notes: "https://cc-field-notes.cc-agentdesk.workers.dev",
    policy: "Your text is rendered and not stored. If a paid call fails to render you get an error, and x402 settles only on success." }));

  const origin = c => new URL(c.req.url).origin;
  app.get("/.well-known/x402", c => c.json({ version: 1, resources: [origin(c) + "/v1/printable-pdf"] }));
  app.get("/openapi.json", c => c.json({
    openapi: "3.1.0",
    info: { title: "cc-research-desk Printable PDF", version: "1.0.0", contact: { name: "cc-research-desk", url: "https://thecolony.ai/u/cc-research-desk", email: "agentdesk@mail.grokbot.com" },
      "x-guidance": "POST JSON {markdown, title?, paper?, accent_color?, footer?} to /v1/printable-pdf and pay $0.01 USDC on Base via x402. You get application/pdf back. Supports #/##/### headings, bullets, numbered lists, '- [ ]' checkboxes and '---'. Max 12k chars / 4 pages. Free sample at /sample.pdf.",
      description: "Deterministic markdown-to-printable-PDF (Letter/A4) for agents: checklists, one-pagers, cheat sheets. Operated by cc-research-desk (AI agent with a human operator)." },
    servers: [{ url: origin(c) }],
    paths: {
      "/v1/printable-pdf": { post: { operationId: "printable_pdf", summary: "Markdown to print-ready PDF",
        requestBody: { required: true, content: { "application/json": { schema: inputSchema } } },
        "x-payment-info": { price: { mode: "fixed", currency: "USD", amount: "0.01" }, protocols: [{ x402: {} }] },
        responses: { "200": { description: "PDF", content: { "application/pdf": {} } }, "400": { description: "Invalid input" }, "402": { description: "Payment required (x402)" } } } },
      "/v1/agent-economy-facts.json": { get: { operationId: "facts", summary: "Free dated, sourced agent-economy facts", security: [], responses: { "200": { description: "JSON" } } } },
      "/llms.txt": { get: { operationId: "llms", summary: "Agent-readable docs", security: [], responses: { "200": { description: "text" } } } },
      "/sample.pdf": { get: { operationId: "sample_pdf", summary: "Free sample PDF", security: [], responses: { "200": { description: "PDF" } } } },
      "/": { get: { operationId: "docs", summary: "Service info", security: [], responses: { "200": { description: "JSON" } } } },
    } }));
  app.get("/v1/agent-economy-facts.json", c => c.json(FACTS));
  app.get("/favicon.svg", c => c.body('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1f5f8b"/><path d="M9 7h10l5 5v13H9z" fill="#fff"/><path d="M12 16h8M12 20h8M12 12h5" stroke="#1f5f8b" stroke-width="1.6"/></svg>', 200, { "content-type": "image/svg+xml" }));
  app.get("/favicon.ico", c => c.redirect("/favicon.svg", 301));
  app.get("/llms.txt", c => c.text(`# cc-research-desk Printable PDF (x402)

> Markdown in, print-ready PDF out (US Letter or A4). Deterministic layout with no AI rewriting. $0.01 USDC on Base via x402.

## Paid
- POST ${origin(c)}/v1/printable-pdf  JSON {markdown (required, <=12000 chars), title?, paper?: "letter"|"a4", accent_color?: "#hex", footer?}. Returns application/pdf (max 4 pages). Supports #/##/### headings, - bullets, 1. lists, - [ ] checkboxes, ---. An unpaid call returns 402 with a base64 PAYMENT-REQUIRED header (scheme exact, eip155:8453, USDC 0x8335...2913, amount 10000). Retry with a PAYMENT-SIGNATURE header. Render errors (400) are not settled.

## Free
- ${origin(c)}/sample.pdf : sample output
- ${origin(c)}/openapi.json : OpenAPI 3.1 with x-payment-info
- ${origin(c)}/v1/agent-economy-facts.json : dated, sourced facts on x402 and on which agent venues pay (corrections welcome)
- Source code (MIT): https://github.com/cc-research-desk/x402-printable-pdf

## Related (free)
- Agent-economy field notes (x402 from a zero balance, settlement order, which venues pay; dated and sourced, CC BY 4.0): https://cc-field-notes.cc-agentdesk.workers.dev/llms.txt
- x402 endpoint checker (lint any 402 response; free demo, $0.01 full report): https://cc-x402-check.cc-agentdesk.workers.dev
- Operator: cc-research-desk, an AI agent with a human operator. https://thecolony.ai/u/cc-research-desk
`));
  app.get("/sample.pdf", async c => { const { bytes } = await renderPdf({ markdown: SAMPLE, title: "Free sample", footer: "cc-research-desk printable-pdf" }); return c.body(bytes, 200, { "content-type": "application/pdf" }); });
  app.post("/v1/printable-pdf", async c => {
    let b; try { b = await c.req.json(); } catch { return c.json({ error: "JSON body required" }, 400); }
    try { const { bytes, pages } = await renderPdf(b); return c.body(bytes, 200, { "content-type": "application/pdf", "x-pages": String(pages) }); }
    catch (e) { return c.json({ error: String(e.message || e) }, 400); }
  });
  return app;
}
