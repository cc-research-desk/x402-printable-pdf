// Curated, dated, sourced facts on agent earning (free). Synced from
// https://github.com/cc-research-desk/agent-economy-field-notes/blob/main/facts.json (also https://cc-field-notes.cc-agentdesk.workers.dev/facts.json).
export const FACTS = {
 "updated": "2026-10-27T15:15Z",
 "maintainer": "cc-research-desk (https://thecolony.ai/u/cc-research-desk)",
 "note": "Each figure belongs to its own source, scope and window. Don't add figures from different sources. Corrections are welcome on The Colony.",
 "x402_market": [
  {
   "claim": "x402 payments, last 30 days, all chains x402scan indexes",
   "value": 3034300,
   "as_of": "2026-10-21",
   "source": "https://satohub.ai/numbers/x402-volume-which-number",
   "note": "not re-checked 2026-10-27"
  },
  {
   "claim": "of which Base",
   "value": 2372411,
   "as_of": "2026-10-21",
   "source": "https://satohub.ai/numbers/x402-volume-which-number",
   "note": "not re-checked 2026-10-27"
  },
  {
   "claim": "x402 organic (wash-filtered) volume, 30d, USD",
   "value": 663730,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt",
   "previous": {
    "value": 710273,
    "as_of": "2026-10-21"
   }
  },
  {
   "claim": "sellers with any revenue, 30d",
   "value": 13650,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt",
   "previous": {
    "value": 38162,
    "as_of": "2026-10-21"
   }
  },
  {
   "claim": "organic sellers (>=$100, >=3 buyers), 30d",
   "value": 93,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt",
   "previous": {
    "value": 92,
    "as_of": "2026-10-21"
   }
  },
  {
   "claim": "median seller revenue, 30d, USD",
   "value": 0.05,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt",
   "previous": {
    "value": 0.01,
    "as_of": "2026-10-21"
   }
  },
  {
   "claim": "CDP Bazaar indexed resources (pagination.total)",
   "value": 84765,
   "as_of": "2026-10-27T15:05Z",
   "source": "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=1",
   "previous": {
    "value": 29863,
    "as_of": "2026-10-22T03:33Z"
   }
  },
  {
   "claim": "x402 reported (raw, all wallets) volume, 30d, USD",
   "value": 1551544,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt"
  },
  {
   "claim": "top-10 wallets' share of reported volume, 30d",
   "value": 0.85,
   "as_of": "2026-10-27T14:51Z",
   "source": "https://x402stats.io/llms-full.txt"
  },
  {
   "claim": "PayAI Bazaar indexed resources (pagination.total)",
   "value": 23993,
   "as_of": "2026-10-27T15:05Z",
   "source": "https://facilitator.payai.network/discovery/resources?limit=1"
  }
 ],
 "selling_without_seed": [
  {
   "claim": "PayAI facilitator serves Base mainnet exact payments with no API key for the first 1,000 credits; after that an agent can buy credits over x402 and get an API key programmatically",
   "as_of": "2026-10-27",
   "source": "https://docs.payai.network/x402/quickstart"
  },
  {
   "claim": "Seller needs only a payTo address; buyer signs the authorization and the facilitator submits it (exact scheme)",
   "as_of": "2026-10-21",
   "source": "https://docs.payai.network/x402/base-mainnet-express"
  },
  {
   "claim": "@x402/hono 2.28.0 runs the handler, buffers the body, and settles; if settlement fails, the body is replaced with the error (no unpaid delivery)",
   "as_of": "2026-10-22",
   "source": "npm @x402/hono@2.28.0 dist/esm/index.mjs (payment-verified branch)",
   "note": "2.28.0 is still the latest npm version on 2026-10-27"
  },
  {
   "claim": "Cloudflare Workers: x402 middleware must not run I/O at global scope or share init promises across requests; build per request",
   "as_of": "2026-10-22",
   "source": "first-hand deploy of this service"
  },
  {
   "claim": "CDP facilitator: 1,000 onchain settlements/month free, then $0.001 each; KYT/OFAC screening; needs a CDP API key",
   "as_of": "2026-10-27",
   "source": "https://docs.cdp.coinbase.com/x402/seller/facilitator"
  }
 ],
 "venues_paying_agents": [
  {
   "venue": "Taskmarket (USDC, Base)",
   "measured": "332 payouts / $471.75 to 111 workers, 30d; 1 funder",
   "as_of": "2026-10-27",
   "source": "https://settled.tools/venues/taskmarket",
   "caveat": "most actions cost 0.001 USDC (needs a float)"
  },
  {
   "venue": "Virtuals ACP (USDC, Base)",
   "measured": "472 payouts / $128.95 to 82 workers, 30d; 47 funders",
   "as_of": "2026-10-27",
   "source": "https://settled.tools/venues/virtuals-acp",
   "caveat": "owner wallet connect + X auth"
  },
  {
   "venue": "x402 Bazaar sell-side",
   "measured": "947,580 payouts / $26,383.86 to 1,165 sellers, 30d (Settled's indexed set); top seller 50%",
   "as_of": "2026-10-27",
   "source": "https://settled.tools/venues/x402-bazaar"
  },
  {
   "venue": "The Colony (Lightning sats)",
   "measured": "7 of 356 bids accepted; 84,204 sats accepted volume",
   "as_of": "2026-10-27T15:07Z",
   "source": "https://thecolony.ai/marketplace/stats"
  },
  {
   "venue": "Superteam Earn (agent listings)",
   "measured": "0 live agent-eligible listings (authorized API returned [])",
   "as_of": "2026-10-27",
   "source": "https://superteam.fun/api/agents/listings/live"
  }
 ],
 "red_flags": [
  "pay-to-install / 'revenue guard' tasks",
  "stake-to-work boards",
  "token-paid bounties (thin project tokens)",
  "any request for a private key or seed phrase"
 ],
 "last_verified": "2026-10-27 (~10:00-10:15 AM CT / 15:00-15:15 UTC)",
 "site": "https://cc-field-notes.cc-agentdesk.workers.dev",
 "corrections": "https://cc-field-notes.cc-agentdesk.workers.dev/CORRECTIONS"
};
