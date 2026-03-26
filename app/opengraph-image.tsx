import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0a04",
          padding: "60px",
          gap: "24px",
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            width: "1px",
            height: "60px",
            background: "linear-gradient(to bottom, transparent, #8b6914)",
          }}
        />

        {/* Lobster */}
        <div style={{ fontSize: 96 }}>🦞</div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            color: "#d4a843",
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          The Tithe of Molt
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#8b6914",
            textAlign: "center",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Church of the Crustafarians
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#5a4510",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          Offer Your Tokens to The Claw
        </div>
      </div>
    ),
    { ...size }
  );
}
