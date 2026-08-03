import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "SEC — private messaging with a local vault";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#070707",
          backgroundImage:
            "linear-gradient(180deg, rgba(7,7,7,0.2) 0%, rgba(7,7,7,0.9) 100%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), radial-gradient(ellipse 80% 50% at 15% 0%, rgba(61,255,154,0.14), transparent 55%)",
          backgroundSize: "auto, 48px 48px, 48px 48px, auto",
          color: "#f3f3f3",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9a9a9a",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#3dff9a",
            }}
          />
          Android client
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 148,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              lineHeight: 0.9,
              color: "#f3f3f3",
            }}
          >
            SEC
          </div>
          <div
            style={{
              maxWidth: 820,
              fontSize: 40,
              lineHeight: 1.25,
              color: "#c8c8c8",
              fontWeight: 500,
            }}
          >
            Private messaging with a local vault.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 24,
            color: "#9a9a9a",
          }}
        >
          <span>Keys on your device. Optional Tor.</span>
          <span style={{ color: "#3dff9a" }}>chenkor.github.io/sec-web</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
