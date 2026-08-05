/**
 * Full-bleed 1200×630 OG image for Discord / Twitter.
 * Renders at 2× then downscales for sharp text in embeds.
 * Usage: node scripts/generate-og.mjs
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, ".");
const require = createRequire(import.meta.url);

const W = 1200;
const H = 630;
const SCALE = 2;

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
      alignItems: "center",
      justifyContent: "center",
      background: "#070707",
      color: "#f3f3f3",
      position: "relative",
      overflow: "hidden",
    },
    children: [
      // full-bleed glows so the frame isn’t empty
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: -200,
            top: -220,
            width: 720,
            height: 720,
            background:
              "radial-gradient(circle, rgba(61,255,154,0.20) 0%, rgba(61,255,154,0) 68%)",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            right: -180,
            bottom: -260,
            width: 680,
            height: 680,
            background:
              "radial-gradient(circle, rgba(61,255,154,0.10) 0%, rgba(61,255,154,0) 70%)",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 4,
            background: "#3dff9a",
          },
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 20,
            letterSpacing: 5,
            color: "#9a9a9a",
            fontFamily: "Instrument Sans",
            fontWeight: 600,
            marginBottom: 28,
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  width: 10,
                  height: 10,
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
            fontSize: 168,
            fontWeight: 700,
            letterSpacing: -8,
            lineHeight: 0.85,
            color: "#f3f3f3",
            fontFamily: "Syne",
            textAlign: "center",
          },
          children: "SEC",
        },
      },
      {
        type: "div",
        props: {
          style: {
            marginTop: 28,
            fontSize: 34,
            fontWeight: 600,
            color: "#d0d0d0",
            fontFamily: "Instrument Sans",
            textAlign: "center",
            maxWidth: 900,
          },
          children: "Private messaging with a local vault.",
        },
      },
      {
        type: "div",
        props: {
          style: {
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            fontFamily: "Instrument Sans",
            fontWeight: 600,
          },
          children: [
            {
              type: "div",
              props: {
                style: { color: "#7a7a7a" },
                children: "Keys on your device · Optional Tor",
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
  width: W * SCALE,
  height: H * SCALE,
  fonts: [
    { name: "Syne", data: syne, weight: 700, style: "normal" },
    { name: "Instrument Sans", data: body, weight: 600, style: "normal" },
  ],
});

const hi = Buffer.from(await res.arrayBuffer());
const sharp = require("sharp");

const png = await sharp(hi)
  .resize(W, H, { fit: "fill", kernel: "lanczos3" })
  .png({ compressionLevel: 8 })
  .toBuffer();

const jpg = await sharp(png)
  .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toBuffer();

const outDir = join(root, "public");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "og.png"), png);
writeFileSync(join(outDir, "og.jpg"), jpg);

console.log(`[og] public/og.png ${W}x${H} (${png.length} bytes)`);
console.log(`[og] public/og.jpg (${jpg.length} bytes)`);
