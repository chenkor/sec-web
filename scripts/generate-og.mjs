/**
 * Crisp 1200×630 OG image via next/og (Satori + resvg).
 * Usage: node scripts/generate-og.mjs
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

const W = 1200;
const H = 630;

const ogPkg = join(root, "node_modules", "next", "dist", "compiled", "@vercel", "og");
const { ImageResponse } = await import(pathToFileURL(join(ogPkg, "index.node.js")).href);
const fontDir = join(root, "public", "fonts");

async function ensureFont(file, url) {
  mkdirSync(fontDir, { recursive: true });
  const dest = join(fontDir, file);
  if (existsSync(dest) && readFileSync(dest).length > 1000) return dest;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font download failed ${file}: ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`[og] downloaded ${file}`);
  return dest;
}

const synePath = await ensureFont(
  "Syne-Bold.ttf",
  "https://cdn.jsdelivr.net/fontsource/fonts/syne@latest/latin-700-normal.ttf"
);
const bodyPath = await ensureFont(
  "InstrumentSans-SemiBold.ttf",
  "https://cdn.jsdelivr.net/fontsource/fonts/instrument-sans@latest/latin-600-normal.ttf"
);

const syne = readFileSync(synePath);
const body = readFileSync(bodyPath);

const element = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "#070707",
      color: "#f3f3f3",
      padding: "56px 64px",
      position: "relative",
    },
    children: [
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: "#3dff9a",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: -80,
            top: -120,
            width: 520,
            height: 420,
            background:
              "radial-gradient(circle, rgba(61,255,154,0.18) 0%, rgba(61,255,154,0) 70%)",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            color: "#9a9a9a",
            fontFamily: "Instrument Sans",
            fontWeight: 600,
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#3dff9a",
                },
              },
            },
            "ANDROID CLIENT",
          ],
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 24,
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  fontSize: 148,
                  fontWeight: 700,
                  letterSpacing: -6,
                  lineHeight: 0.9,
                  color: "#f3f3f3",
                  fontFamily: "Syne",
                },
                children: "SEC",
              },
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: 34,
                  fontWeight: 600,
                  color: "#c8c8c8",
                  letterSpacing: -0.3,
                  fontFamily: "Instrument Sans",
                },
                children: "Private messaging with a local vault.",
              },
            },
          ],
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            fontSize: 24,
            fontFamily: "Instrument Sans",
            fontWeight: 600,
          },
          children: [
            {
              type: "div",
              props: {
                style: { color: "#7a7a7a" },
                children: "Keys on your device. Optional Tor.",
              },
            },
            {
              type: "div",
              props: {
                style: { color: "#3dff9a" },
                children: "chenkor.github.io/sec-web",
              },
            },
          ],
        },
      },
    ],
  },
};

const res = new ImageResponse(element, {
  width: W,
  height: H,
  fonts: [
    { name: "Syne", data: syne, weight: 700, style: "normal" },
    { name: "Instrument Sans", data: body, weight: 600, style: "normal" },
  ],
});

const png = Buffer.from(await res.arrayBuffer());
const outDir = join(root, "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "og.png"), png);

const sharp = require("sharp");
const jpg = await sharp(png)
  .jpeg({ quality: 95, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toBuffer();
writeFileSync(join(outDir, "og.jpg"), jpg);

console.log(`[og] public/og.png (${png.length} bytes) ${W}x${H}`);
console.log(`[og] public/og.jpg (${jpg.length} bytes)`);
