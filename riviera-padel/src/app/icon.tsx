import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a09",
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#c9ff4e",
            fontFamily: "sans-serif",
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  );
}
