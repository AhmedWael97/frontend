import { ImageResponse } from "next/og";

export const alt = "EYE Analytics — see who visits your site and what they do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic, branded social/OG card — no static asset to maintain. Applies to all
// marketing routes under /[locale] (landing, pricing, docs, help).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b1020 0%, #171f33 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, #818cf8, #a78bfa)" }} />
          <div style={{ display: "flex", fontSize: "44px", fontWeight: 800, letterSpacing: "-1px" }}>
            <span>EYE</span>
            <span style={{ color: "#a78bfa" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "62px", fontWeight: 800, lineHeight: 1.1, maxWidth: "920px" }}>
          See who visits your site and what they do
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "#c7c4d7", marginTop: "26px", maxWidth: "940px" }}>
          Live tracking, heatmaps, session replay, funnels & campaign revenue — privacy-first.
        </div>
      </div>
    ),
    { ...size }
  );
}
