import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — simplified Pal Hub mark. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2F8F82",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 999,
            background: "#F4FAF9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: -6 }}>
            <div
              style={{
                width: 22,
                height: 28,
                borderRadius: 999,
                background: "#1E3F3C",
              }}
            />
            <div
              style={{
                width: 22,
                height: 28,
                borderRadius: 999,
                background: "#1E3F3C",
              }}
            />
          </div>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 999,
              background: "#1E3F3C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#F4FAF9",
              }}
            />
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#F4FAF9",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#5EC4B6",
              }}
            />
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#2F8F82",
                marginTop: -6,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#5EC4B6",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
