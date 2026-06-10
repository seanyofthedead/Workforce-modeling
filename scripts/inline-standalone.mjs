import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const OUT = "out";
let html = readFileSync(join(OUT, "index.html"), "utf8");
const mime = (p) => p.endsWith(".css") ? "text/css"
: p.endsWith(".js") ? "text/javascript" : "application/octet-stream";
const dataUri = (p) => `data:${mime(p)};base64,` +
readFileSync(join(OUT, p.replace(/^\//, "").split("?")[0])).toString("base64");
// Drop preload hints + legacy polyfills (modern-browser demo).
html = html.replace(/<link[^>]*rel="(?:preload|modulepreload)"[^>]*>/g, "");
html = html.replace(/<script\b[^>]*\bnoModule[^>]*><\/script>/g, "");
// Embed every /_next asset (JS + CSS) as a data: URI, replacing the path
// everywhere it appears — in tags AND the inlined RSC/Flight payload.
const assets = new Set([...html.matchAll(/(?:src|href)="(\/_next\/[^"?]+)/g)].map(m => m[1]));
for (const p of [...assets].sort((a, b) => b.length - a.length)) html = html.split(p).join(dataUri(p));
writeFileSync(join(OUT, "standalone.html"), html);
const leftover = [...html.matchAll(/(?:src|href)="(?!data:)([^"#]+)"/g)].map(m => m[1]);
console.log("assets embedded:", assets.size, "| bytes:", html.length,
"| external src/href left:", leftover.length ? leftover : "none");
