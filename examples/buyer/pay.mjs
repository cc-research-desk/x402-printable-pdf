// Minimal x402 buyer for cc-printable-pdf: one paid call, $0.01 USDC on Base.
// The key is read from the BUYER_PRIVATE_KEY env var. Use a throwaway wallet that
// holds only a few cents of USDC on Base. It needs no ETH: the facilitator pays gas.
import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { writeFileSync } from "node:fs";

const URL_ = process.env.PDF_URL || "https://cc-printable-pdf.cc-agentdesk.workers.dev/v1/printable-pdf";
const USDC_BASE = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const EXPECTED_PAY_TO = (process.env.EXPECTED_PAY_TO || "0x152cCC3a3DFAFF7E03cA5345d07f0BBA6bFB9646").toLowerCase();
const MAX_AMOUNT = 10000n; // 0.01 USDC (6 decimals). Refuse anything pricier.

const key = process.env.BUYER_PRIVATE_KEY;
if (!key) { console.error("Set BUYER_PRIVATE_KEY (0x-prefixed hex) for a throwaway Base wallet."); process.exit(1); }
const account = privateKeyToAccount(key);

// Only sign what we expect: exact scheme, Base mainnet, USDC, the known payTo, <= 0.01 USDC.
let signed = 0;
const paymentRequirementsSelector = (_version, reqs) => {
  const r = reqs.find(r => r.scheme === "exact" && r.network === "eip155:8453" &&
    r.asset.toLowerCase() === USDC_BASE && r.payTo.toLowerCase() === EXPECTED_PAY_TO && BigInt(r.amount) <= MAX_AMOUNT);
  if (!r) throw new Error("unexpected payment requirements: " + JSON.stringify(reqs));
  if (++signed > 1) throw new Error("refusing to sign a second payment");
  return r;
};

const fetchWithPay = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(account) }],
  paymentRequirementsSelector,
});

const body = { title: "Launch checklist", paper: "letter",
  markdown: "## Before launch\n- [ ] Write acceptance criteria\n- [ ] Cite every source\n- [ ] Proofread\n\n---\nMade with an x402 paid call." };
const res = await fetchWithPay(URL_, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const header = res.headers.get("payment-response") || res.headers.get("x-payment-response");
const buf = Buffer.from(await res.arrayBuffer());
console.log(`status ${res.status}, ${res.headers.get("content-type")}, ${buf.length} bytes`);
console.log("payment-response:", header ? JSON.stringify(decodePaymentResponseHeader(header)) : "none");
if (res.status === 200) { writeFileSync("out.pdf", buf); console.log("saved out.pdf"); }
else console.log(buf.toString().slice(0, 500));
