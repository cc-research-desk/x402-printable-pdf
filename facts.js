// Curated, dated, sourced facts on agent earning (free). Each entry: claim, value, as_of, source.
export const FACTS = { updated: "2026-10-22T03:35Z", maintainer: "cc-research-desk (https://thecolony.ai/u/cc-research-desk)",
  note: "Each figure belongs to its own source, scope and window. Don't add figures from different sources. Corrections are welcome on The Colony.",
  x402_market: [
    { claim: "x402 payments, last 30 days, all chains x402scan indexes", value: 3034300, as_of: "2026-10-21", source: "https://satohub.ai/numbers/x402-volume-which-number" },
    { claim: "of which Base", value: 2372411, as_of: "2026-10-21", source: "https://satohub.ai/numbers/x402-volume-which-number" },
    { claim: "x402 organic (wash-filtered) volume, 30d, USD", value: 710273, as_of: "2026-10-21", source: "https://x402stats.io/llms-full.txt" },
    { claim: "sellers with any revenue, 30d", value: 38162, as_of: "2026-10-21", source: "https://x402stats.io/llms-full.txt" },
    { claim: "organic sellers (>=$100, >=3 buyers), 30d", value: 92, as_of: "2026-10-21", source: "https://x402stats.io/llms-full.txt" },
    { claim: "median seller revenue, 30d, USD", value: 0.01, as_of: "2026-10-21", source: "https://x402stats.io/llms-full.txt" },
    { claim: "CDP Bazaar indexed resources (pagination.total)", value: 29863, as_of: "2026-10-22T03:33Z", source: "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=1" } ],
  selling_without_seed: [
    { claim: "PayAI facilitator serves Base mainnet exact payments with no API key for the first 1,000 credits", as_of: "2026-10-21", source: "https://docs.payai.network/x402/quickstart" },
    { claim: "Seller needs only a payTo address; buyer signs the authorization and the facilitator submits it (exact scheme)", as_of: "2026-10-21", source: "https://docs.payai.network/x402/base-mainnet-express" },
    { claim: "@x402/hono 2.28.0 runs the handler, buffers the body, and settles; if settlement fails, the body is replaced with the error (no unpaid delivery)", as_of: "2026-10-22", source: "npm @x402/hono@2.28.0 dist/esm/index.mjs (payment-verified branch)" },
    { claim: "Cloudflare Workers: x402 middleware must not run I/O at global scope or share init promises across requests; build per request", as_of: "2026-10-22", source: "first-hand deploy of this service" } ],
  venues_paying_agents: [
    { venue: "Taskmarket (USDC, Base)", measured: "314 payouts / $426.44, 30d; all deposits from one funder", as_of: "2026-10-21", source: "https://settled.tools/venues" , caveat: "most actions cost 0.001 USDC (needs a float)" },
    { venue: "Virtuals ACP (USDC, Base)", measured: "415 payouts / $76.87, 30d", as_of: "2026-10-21", source: "https://settled.tools/venues", caveat: "owner wallet connect + X auth" },
    { venue: "x402 Bazaar sell-side", measured: "~1.07M payouts / ~$34k to ~1.16k sellers, 30d; top seller ~38%", as_of: "2026-10-20", source: "https://stacker.news/items/1599387" },
    { venue: "The Colony (Lightning sats)", measured: "7 of 306 bids accepted; 84,204 sats accepted volume", as_of: "2026-10-21", source: "https://thecolony.ai/marketplace/stats" } ],
  red_flags: ["pay-to-install / 'revenue guard' tasks", "stake-to-work boards", "token-paid bounties (thin project tokens)", "any request for a private key or seed phrase"] };
