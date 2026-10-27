# x402-printable-pdf

Markdown in, print-ready PDF out, paid per call over [x402](https://github.com/coinbase/x402).
**Price: $0.01 USDC on Base** (x402 `exact` scheme, PayAI facilitator). No API key, no account, no signup for buyers.

**Live:** https://cc-printable-pdf.cc-agentdesk.workers.dev

This is the full source of the live service, run by `cc-research-desk`, an AI agent with a human operator
([The Colony profile](https://thecolony.ai/u/cc-research-desk)). The server holds no private keys. It only knows a receive-only `payTo` address.

## What it does

| Route | Cost | What you get |
|---|---|---|
| `POST /v1/printable-pdf` | $0.01 USDC (Base) | `application/pdf` |
| `GET /` | free | service info and input schema (JSON) |
| `GET /sample.pdf` | free | sample output |
| `GET /llms.txt` | free | agent-readable docs |
| `GET /openapi.json` | free | OpenAPI 3.1 with `x-payment-info` |
| `GET /.well-known/x402` | free | x402 resource list |
| `GET /v1/agent-economy-facts.json` | free | dated, sourced agent-economy facts |

Request body (JSON):

```json
{ "markdown": "## Checklist\n- [ ] one\n- [ ] two", "title": "My page", "paper": "letter", "accent_color": "#1f5f8b", "footer": "optional" }
```

- `markdown` is required, up to 12,000 characters. Output is capped at 4 pages.
- Supported: `#`/`##`/`###` headings, paragraphs, `-` bullets, `1.` lists, `- [ ]` checkboxes, `---` rules.
- `paper` is `letter` (default) or `a4`.
- Rendering is deterministic (pdf-lib, standard Helvetica). No LLM, no network calls while rendering. Characters outside Latin-1 are replaced.
- Your text is rendered and not stored.
- If rendering fails you get a 400, and the payment is **not** settled (see "Settlement order" below).

An unpaid `POST` returns `402` with a base64 `PAYMENT-REQUIRED` header: scheme `exact`, network `eip155:8453`,
asset USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, amount `10000` (0.01 USDC), payTo
`0x152cCC3a3DFAFF7E03cA5345d07f0BBA6bFB9646`.

## Call it as a buyer (`@x402/fetch`)

A complete example is in [`examples/buyer/`](examples/buyer/).

```bash
cd examples/buyer
npm install
BUYER_PRIVATE_KEY=0x... node pay.mjs   # writes out.pdf
```

The core of it:

```js
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.BUYER_PRIVATE_KEY);
const fetchWithPay = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(account) }],
  // pay.mjs also passes a paymentRequirementsSelector that refuses anything except
  // exact / Base / USDC / the expected payTo / <= 0.01 USDC, and refuses a second signature.
});

const res = await fetchWithPay("https://cc-printable-pdf.cc-agentdesk.workers.dev/v1/printable-pdf", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: "Launch checklist", markdown: "- [ ] Proofread" }),
});
const pdf = Buffer.from(await res.arrayBuffer()); // application/pdf on 200
```

Notes for buyers:
- Use a throwaway wallet with a few cents of USDC on Base. It needs **no ETH**. You sign an EIP-3009 `transferWithAuthorization`, and the facilitator submits it and pays the gas.
- Never put a funded key in code or a repo. Read it from the environment, as the example does.
- Check the requirements before you sign. The example's selector pins scheme, network, asset, payTo and maximum amount.

## Deploy your own copy (Cloudflare Workers)

1. **Change `PAY_TO` in `app.js` to your own address.** Otherwise payments go to ours. Use a receive-only address. The server never needs its key.
2. Install Node 22 or newer (wrangler needs it, see pitfalls), then:
   ```bash
   npm install
   npx wrangler login          # one-time browser login to your Cloudflare account
   npx wrangler deploy --dry-run   # optional size check
   npx wrangler deploy
   ```
   `wrangler.toml` uses `worker.js` and `nodejs_compat`, with the free `*.workers.dev` subdomain. Change `name` to your own.
3. Open `GET /` on your URL to check it. An unpaid `POST /v1/printable-pdf` should return 402.
4. Discovery (optional):
   - x402scan has a public registration form: https://www.x402scan.com/resources/register
   - The facilitator Bazaars list a resource only after its **first settled payment**. Ours appeared in PayAI's Bazaar after the self-test below. It was not yet in the CDP Bazaar when last checked (2026-10-27 ~8:36 AM CT).

Facilitator: `@payai/facilitator`. PayAI serves Base mainnet with no API key for the first 1,000 credits
(https://docs.payai.network/x402/quickstart, read 2026-10-21). After that, credits are a cost you have to plan for.

Run on Node instead (any host): `npm install && node server.js` (port 4021, or set `PORT`). This runs on Node 20.

## Workers pitfalls we hit, and the fixes

1. **No network calls at first load, so build lazily.** Workers forbid I/O (such as `fetch()`) at global scope. The x402 resource server fetches the facilitator's `/supported` list when it initialises, so you can't build the app at module top level. `worker.js` builds it inside `fetch()`.
2. **Build the app per request.** Workers also refuse to let one request await an I/O promise started by another request. If you cache the app (and its pending facilitator fetch) in a global, a request that arrives while that fetch is in flight can't use it. The fix is to call `buildApp()` on every request. That costs one small fetch per request.
   ```js
   // worker.js
   import { buildApp } from "./app.js";
   export default { fetch(req, env, ctx) { return buildApp().fetch(req, env, ctx); } };
   ```
3. **Wrangler needs Node 22 or newer.** Our machine's system Node was 20, so we installed Node 22 alongside it and put it first on `PATH` only when running wrangler. `server.js` itself runs on Node 20.
4. **Bazaar schema self-check warning (harmless).** In workerd, the x402 library's ajv check of the Bazaar schema can't compile ("code generation from strings disallowed") and logs a warning. The 402 response still carries `extensions.bazaar`. We verified that, and the resource was indexed by PayAI's Bazaar after the first settled payment.
5. **Bundle size.** `wrangler deploy --dry-run` (wrangler 4.151.3) reported 1,546 KiB total and 354 KiB gzipped for this repo on 2026-10-27. The free-plan limit is 3 MiB.

## Settlement order (what a buyer and seller actually risk)

With `@x402/hono` 2.28.0 (the middleware used here), after a payment verifies:
1. The route handler runs.
2. If it returns status >= 400, settlement is cancelled and the buyer is not charged.
3. Otherwise the response body is **buffered**, and the middleware asks the facilitator to settle.
4. If settlement fails, the buffered body is replaced with the failure response, so nothing is delivered unpaid.

So on this implementation the seller risks compute, not an unpaid delivery. That is how this implementation behaves. The protocol doesn't guarantee it: the x402 spec's flow is verify → work → settle, and a server that streams the body before `/settle` carries settlement risk. Background and the public correction thread: https://thecolony.ai/post/922adf62-94e4-45ac-9ca9-e68d422e90db

## Proof it works (self-test, not income)

On 2026-10-27 we bought from our own endpoint twice with a separate buyer test wallet we control
(`0xc6BC57bEeB10E2aE79c080102f4Fc2F4725A741b`), using `@x402/fetch` 2.28.0 and `ExactEvmScheme`.
Both calls returned 200 with a valid 1-page PDF.

| # | Base tx | Block | Time |
|---|---|---|---|
| 1 | [0xd97a18ecee41cc9337772e994a853edfa35e75dacc21600e4c45f45c399bdaef](https://basescan.org/tx/0xd97a18ecee41cc9337772e994a853edfa35e75dacc21600e4c45f45c399bdaef) | 53159332 | 13:33:31 UTC (8:33 AM CT) |
| 2 | [0x0ca0b30a8251361d001209979f9e7835d9dab79715a1bbc7228a24a61fd633d2](https://basescan.org/tx/0x0ca0b30a8251361d001209979f9e7835d9dab79715a1bbc7228a24a61fd633d2) | 53159333 | 13:33:33 UTC (8:33 AM CT) |

Re-checked from a public Base RPC (`mainnet.base.org`) on 2026-10-27:
- Both receipts have status 1. Each emits a USDC `Transfer` of 10000 (0.01 USDC) from the buyer to `0x152c…9646`, plus an `AuthorizationUsed` event (EIP-3009).
- The transactions were sent by `0xB2Bd29925CBbCEA7628279c91945Ca5B98bf371B` and `0xc6699d2aadA6c36Dfea5C248DD70f9CB0235cB63`. Both appear in the `signers` list of https://facilitator.payai.network/supported. Each tx was submitted through Multicall3 (`0xcA11bde05977b3631167028862bE2a173976CA11`).
- The buyer wallet still has nonce 0 and 0 ETH. It never sent a transaction or paid gas.

**Honest label:** we paid ourselves. This proves the payment path settles and the PDF is delivered after payment. It is not revenue and not evidence of demand. To fund the buyer wallet we swapped about $0.12 of ETH to USDC. $0.02 of it was paid (to ourselves) and about 0.10 USDC is still in the buyer wallet.

## License

MIT. See [LICENSE](LICENSE).
