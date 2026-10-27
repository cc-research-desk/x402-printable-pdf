// Markdown-subset -> printable PDF (Letter/A4). Pure JS (pdf-lib), no network, no LLM.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
const SIZES = { letter: [612, 792], a4: [595.28, 841.89] };
const clean = s => String(s).replace(/[^\x20-\x7E\u00A0-\u00FF]/g, c => ({ "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-", "\u2022": "*", "\u2026": "..." }[c] ?? "?"));
function hex(h) { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return rgb(0.12, 0.33, 0.55); const n = parseInt(m[1], 16); return rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); }
export const LIMITS = { maxChars: 12000, maxPages: 4 };
export async function renderPdf({ markdown, title, paper = "letter", accent_color, footer }) {
  if (typeof markdown !== "string" || !markdown.trim()) throw new Error("markdown is required");
  if (markdown.length > LIMITS.maxChars) throw new Error(`markdown too long (max ${LIMITS.maxChars} chars)`);
  const [W, H] = SIZES[paper] || SIZES.letter; const M = 54; const accent = hex(accent_color);
  const doc = await PDFDocument.create(); doc.setProducer("cc-research-desk printable-pdf"); if (title) doc.setTitle(clean(title));
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page, y; const pages = [];
  const newPage = () => { if (pages.length >= LIMITS.maxPages) throw new Error(`content exceeds ${LIMITS.maxPages} pages`); page = doc.addPage([W, H]); pages.push(page); y = H - M; };
  newPage();
  const wrap = (text, font, size, width) => { const words = clean(text).split(/\s+/).filter(Boolean); const lines = []; let line = ""; for (const w of words) { const t = line ? line + " " + w : w; if (font.widthOfTextAtSize(t, size) > width && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines.length ? lines : [""]; };
  const draw = (text, { font = reg, size = 11, indent = 0, color = rgb(0.1, 0.1, 0.1), gap = 4, box = false } = {}) => {
    const lh = size * 1.35; const lines = wrap(text, font, size, W - 2 * M - indent - (box ? 18 : 0));
    lines.forEach((ln, i) => { if (y - lh < M + 20) newPage(); y -= lh;
      if (box && i === 0) page.drawRectangle({ x: M + indent, y: y - 1, width: 10, height: 10, borderColor: accent, borderWidth: 1 });
      page.drawText(ln, { x: M + indent + (box ? 18 : 0), y, size, font, color }); });
    y -= gap; };
  if (title) { draw(title, { font: bold, size: 22, color: accent, gap: 6 }); page.drawLine({ start: { x: M, y: y }, end: { x: W - M, y: y }, thickness: 1.5, color: accent }); y -= 12; }
  for (const raw of markdown.replace(/\r/g, "").split("\n")) {
    const l = raw.trimEnd(); let m;
    if (!l.trim()) { y -= 6; continue; }
    if ((m = /^#\s+(.*)/.exec(l))) draw(m[1], { font: bold, size: 18, color: accent, gap: 6 });
    else if ((m = /^##\s+(.*)/.exec(l))) { y -= 4; draw(m[1], { font: bold, size: 14, color: accent, gap: 4 }); }
    else if ((m = /^###\s+(.*)/.exec(l))) draw(m[1], { font: bold, size: 12, gap: 3 });
    else if ((m = /^\s*[-*]\s+\[[ xX]?\]\s+(.*)/.exec(l))) draw(m[1], { box: true, indent: 4, gap: 5 });
    else if ((m = /^(\s*)[-*]\s+(.*)/.exec(l))) draw("\u2022 ".replace("\u2022", "-") + " " + m[2], { indent: 8 + Math.min(m[1].length, 8) * 4, gap: 2 });
    else if ((m = /^\s*(\d+)[.)]\s+(.*)/.exec(l))) draw(`${m[1]}. ${m[2]}`, { indent: 8, gap: 2 });
    else if (/^---+$/.test(l.trim())) { page.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) }); y -= 12; }
    else draw(l.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1"));
  }
  const f = clean(footer || "");
  pages.forEach((p, i) => p.drawText(`${f ? f + "  |  " : ""}${i + 1} / ${pages.length}`, { x: M, y: 30, size: 8, font: reg, color: rgb(0.45, 0.45, 0.45) }));
  return { bytes: await doc.save(), pages: pages.length };
}
