import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trade Tracker - AI Trading Analysis Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#030711",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_APP_URL}/_static/favicons/t2white.png`}
            alt="Trade Tracker Logo"
            width="120"
            height="120"
            style={{ margin: "0 30px" }}
          />
        </div>
        <h1
          style={{
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#fff",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Trade Tracker
        </h1>
        <p
          style={{
            fontSize: 30,
            color: "#a1a1aa",
            textAlign: "center",
            marginTop: 0,
            marginBottom: 40,
          }}
        >
          Your AI Co-pilot for Trading
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
