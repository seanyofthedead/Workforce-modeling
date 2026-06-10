// Generates a Word .docx demo script with no external dependencies.
// Builds the OOXML parts and packs them into a STORED (uncompressed) zip,
// which Word opens reliably and avoids any zlib/path-separator pitfalls.
import { writeFileSync } from "node:fs";

/* ----------------------------- content ----------------------------- */
// type: title | subtitle | setup | section | do | say | note | spacer
const BLOCKS = [
  { type: "title", text: "Workforce Modeling Command Center — Live Demo Script" },
  { type: "subtitle", text: "Target run time ~5 minutes  ·  Runs from the standalone HTML file (no internet, no install)  ·  All figures are synthetic demonstration data" },

  { type: "setup", text: "BEFORE YOU START:  Double-click Workforce-Modeling-Command-Center.html in Chrome or Edge and go full-screen (F11). Confirm you're on the Executive Dashboard tab and the “Baseline / Current Plan” scenario pill is highlighted near the top. (Optional autopilot: the gold “Start here” button, top-right, walks this same five-step arc — just click “Next” to advance.)" },

  { type: "section", text: "1  ·  The Verdict", time: "0:00 – 0:45" },
  { type: "do", text: "Stay on the Executive Dashboard. Point at the dark “Decision Banner” across the top." },
  { type: "say", text: "Most workforce conversations start with a stack of spreadsheets. This one starts with a verdict. This banner tells leadership — in a single sentence — where we stand on staffing, where we stand on budget, and which divisions are driving the risk." },
  { type: "do", text: "Sweep your hand across the six tiles below the banner." },
  { type: "say", text: "Underneath are the supporting numbers: onboard strength against authorized positions, current and projected vacancies, and annual personnel cost against plan. The whole picture, before a single chart." },

  { type: "section", text: "2  ·  The Cost of Inaction", time: "0:45 – 1:45" },
  { type: "do", text: "In the “Scenario” pill row near the top, click “Hiring Freeze.” Do NOT change tabs — stay on this screen." },
  { type: "say", text: "Now watch what happens if we do nothing. I'm switching to a Hiring Freeze — external hiring paused, attrition keeps eroding the workforce. Notice I didn't change screens." },
  { type: "do", text: "Let it land for a beat. Point to the widening red gap in the “FTE Demand vs. Supply” chart." },
  { type: "say", text: "The verdict rewrites itself. Coverage drops, projected vacancies climb, and the demand-versus-supply chart opens a gap. That gap is the cost of inaction — quantified, live." },

  { type: "section", text: "3  ·  Model It Live", time: "1:45 – 3:00" },
  { type: "do", text: "Click the “Scenario Modeling” tab in the top navigation. Then click the “Accelerated Hiring” scenario pill." },
  { type: "say", text: "But we're not just spectators — we can model the way out. Up top, the “Impact vs. Baseline” ribbon shows the swing on the four things leadership cares about: personnel cost, mission coverage, budget variance, and time to target." },
  { type: "do", text: "Grab the “Hiring Pace” slider and drag it up. Then drag the “Attrition Rate” slider down." },
  { type: "say", text: "And these aren't canned slides — every lever is live. As I push hiring pace up and attrition down, every number on every screen in this tool recomputes instantly. Leadership can ask “what if” and get an answer in seconds, not a tasker that comes back in three weeks." },

  { type: "section", text: "4  ·  Where to Act", time: "3:00 – 4:00" },
  { type: "do", text: "Click the “Division Model” tab. If a “Reset adjustments” link is showing, click it first to return to Baseline." },
  { type: "say", text: "Strategy is fine, but someone has to act. The Division Model breaks the enterprise down division by division. This waterfall reconciles what we have, what's funded, and what the mission needs — so the gap is undeniable. And the risk isn't spread evenly; it concentrates in these flagged divisions." },
  { type: "do", text: "Click any division card — ideally one flagged high-risk — to open its detail panel. Close it with the X when you're done." },
  { type: "say", text: "Click into any one and you get its grade mix, its cost, and its trajectory — the granularity a manager actually needs to make a hiring decision." },

  { type: "section", text: "5  ·  What to Do, and the Leave-Behind", time: "4:00 – 4:45" },
  { type: "do", text: "Click the “Briefing View” tab." },
  { type: "say", text: "And it ends where every good decision-support tool should — with a recommendation. The Briefing View prioritizes the specific hiring actions, in order, and hands you the talking points to defend them." },
  { type: "do", text: "Click the “Print brief” button (top-right). Show the print preview, then close it." },
  { type: "say", text: "One click produces a clean one-pager — the leave-behind that walks out of the room with your leadership. From a live model to a printed decision brief, in under five minutes." },

  { type: "section", text: "Close", time: "4:45 – 5:00" },
  { type: "do", text: "Return to the Executive Dashboard tab." },
  { type: "say", text: "Everything you just saw runs from a single file — no internet, no install — and every figure is synthetic demonstration data. I'm happy to dig into any piece of it." },

  { type: "note", text: "Pacing tip: the spoken lines run about 3½ minutes; the rest is clicks and pauses. If you're running long, drop the Close and the second “SAY” in Section 1 — the arc still holds." },
];

/* --------------------------- OOXML helpers -------------------------- */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const NAVY = "1B2A4A", ORANGE = "B45309", GRAY = "555555", AMBER_BG = "FBEFD9", NOTE_BG = "EEF2F7";

function run(text, { b, i, color, sz, caps } = {}) {
  const rPr = [];
  if (b) rPr.push("<w:b/>");
  if (i) rPr.push("<w:i/>");
  if (caps) rPr.push("<w:caps/>");
  if (color) rPr.push(`<w:color w:val="${color}"/>`);
  if (sz) rPr.push(`<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`);
  const rPrXml = rPr.length ? `<w:rPr>${rPr.join("")}</w:rPr>` : "";
  return `<w:r>${rPrXml}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

function para(runs, { before = 0, after = 120, shd, indent, line = 276, keepNext } = {}) {
  const pPr = [];
  if (keepNext) pPr.push("<w:keepNext/>");
  pPr.push(`<w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>`);
  if (shd) pPr.push(`<w:shd w:val="clear" w:color="auto" w:fill="${shd}"/>`);
  if (indent) pPr.push(`<w:ind w:left="${indent}" w:right="120"/>`);
  return `<w:p><w:pPr>${pPr.join("")}</w:pPr>${runs}</w:p>`;
}

function block(b) {
  switch (b.type) {
    case "title":
      return para(run(b.text, { b: true, color: NAVY, sz: 40 }), { after: 60, line: 264 });
    case "subtitle":
      return para(run(b.text, { i: true, color: GRAY, sz: 19 }), { after: 220 });
    case "setup":
      return para(run(b.text, { color: NAVY, sz: 20 }), { before: 40, after: 240, shd: NOTE_BG, indent: 120 });
    case "section":
      return para(
        run(b.text, { b: true, color: NAVY, sz: 30 }) +
          (b.time ? run("        " + b.time, { b: true, color: ORANGE, sz: 20 }) : ""),
        { before: 260, after: 80, keepNext: true }
      );
    case "do":
      return para(
        run("DO  —  ", { b: true, color: ORANGE, sz: 21, caps: true }) +
          run(b.text, { color: "3A2A10", sz: 21 }),
        { before: 40, after: 60, shd: AMBER_BG, indent: 120 }
      );
    case "say":
      return para(
        run("SAY  —  ", { b: true, color: NAVY, sz: 22 }) + run(b.text, { sz: 24 }),
        { before: 40, after: 160, indent: 120 }
      );
    case "note":
      return para(run(b.text, { i: true, color: GRAY, sz: 19 }), { before: 220, after: 80, shd: NOTE_BG, indent: 120 });
    default:
      return para(run(""));
  }
}

const body = BLOCKS.map(block).join("");
const documentXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
  `<w:body>${body}` +
  `<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>` +
  `<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>` +
  `</w:sectPr></w:body></w:document>`;

const contentTypes =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
  `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
  `<Default Extension="xml" ContentType="application/xml"/>` +
  `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
  `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
  `</Types>`;

const rootRels =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
  `</Relationships>`;

const docRels =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
  `</Relationships>`;

const stylesXml =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
  `<w:docDefaults><w:rPrDefault><w:rPr>` +
  `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/>` +
  `</w:rPr></w:rPrDefault></w:docDefaults>` +
  `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>` +
  `</w:styles>`;

/* --------------------------- minimal zip ---------------------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const files = [
  { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
  { name: "_rels/.rels", data: Buffer.from(rootRels, "utf8") },
  { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") },
  { name: "word/_rels/document.xml.rels", data: Buffer.from(docRels, "utf8") },
  { name: "word/styles.xml", data: Buffer.from(stylesXml, "utf8") },
];

const locals = [];
const central = [];
let offset = 0;
for (const f of files) {
  const nameBuf = Buffer.from(f.name, "utf8");
  const crc = crc32(f.data);
  const size = f.data.length;
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); // local file header sig
  lh.writeUInt16LE(20, 4);         // version needed
  lh.writeUInt16LE(0, 6);          // flags
  lh.writeUInt16LE(0, 8);          // method 0 = stored
  lh.writeUInt16LE(0, 10);         // mod time
  lh.writeUInt16LE(0x21, 12);      // mod date (arbitrary, fixed for determinism)
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(size, 18);      // compressed size
  lh.writeUInt32LE(size, 22);      // uncompressed size
  lh.writeUInt16LE(nameBuf.length, 26);
  lh.writeUInt16LE(0, 28);         // extra len
  locals.push(lh, nameBuf, f.data);

  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0); // central dir sig
  ch.writeUInt16LE(20, 4);         // version made by
  ch.writeUInt16LE(20, 6);         // version needed
  ch.writeUInt16LE(0, 8);
  ch.writeUInt16LE(0, 10);
  ch.writeUInt16LE(0, 12);
  ch.writeUInt16LE(0x21, 14);
  ch.writeUInt32LE(crc, 16);
  ch.writeUInt32LE(size, 20);
  ch.writeUInt32LE(size, 24);
  ch.writeUInt16LE(nameBuf.length, 28);
  ch.writeUInt16LE(0, 30);
  ch.writeUInt16LE(0, 32);
  ch.writeUInt16LE(0, 34);
  ch.writeUInt16LE(0, 36);
  ch.writeUInt32LE(0, 38);         // external attrs
  ch.writeUInt32LE(offset, 42);    // local header offset
  central.push(ch, nameBuf);

  offset += lh.length + nameBuf.length + f.data.length;
}

const localPart = Buffer.concat(locals);
const centralPart = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(files.length, 8);
eocd.writeUInt16LE(files.length, 10);
eocd.writeUInt32LE(centralPart.length, 12);
eocd.writeUInt32LE(localPart.length, 16);
eocd.writeUInt16LE(0, 20);

const zip = Buffer.concat([localPart, centralPart, eocd]);
const outName = "Workforce-Modeling-Demo-Script.docx";
writeFileSync(outName, zip);

const spoken = BLOCKS.filter((b) => b.type === "say").map((b) => b.text).join(" ");
const words = spoken.split(/\s+/).filter(Boolean).length;
console.log(`wrote ${outName} | ${zip.length} bytes | ${files.length} parts`);
console.log(`spoken words: ${words} | est. talk time @140wpm: ${(words / 140).toFixed(1)} min`);
