import { ImageResponse } from "@vercel/og";

import { ogImageSchema } from "@/lib/validations/og";

export const runtime = "edge";

const interRegular = fetch(
  new URL("../../../assets/fonts/Inter-Regular.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

const interBold = fetch(
  new URL("../../../assets/fonts/CalSans-SemiBold.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

export async function GET(req: Request) {
  try {
    const fontRegular = await interRegular;
    const fontBold = await interBold;

    const url = new URL(req.url);
    const values = ogImageSchema.parse(Object.fromEntries(url.searchParams));
    const heading =
      values.heading.length > 80
        ? `${values.heading.substring(0, 100)}...`
        : values.heading;

    const { mode } = values;
    const paint = mode === "dark" ? "#fff" : "#000";

    const fontSize = heading.length > 80 ? "60px" : "80px";

    return new ImageResponse(
      (
        <div
          tw="flex relative flex-col p-12 w-full h-full items-start"
          style={{
            color: paint,
            background:
              mode === "dark"
                ? "linear-gradient(90deg, #000 0%, #111 100%)"
                : "white",
          }}
        >
          {/* App Title */}
          <div
            tw="text-5xl"
            style={{
              fontFamily: "Cal Sans",
              fontWeight: "normal",
              position: "relative",
              background: "linear-gradient(90deg, #2563eb, #3b82f6 80%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Trade Tracker
          </div>

          <div tw="flex flex-col flex-1 py-16">
            {/* Content Type */}
            <div
              tw="flex text-xl uppercase font-bold tracking-tight"
              style={{ fontFamily: "Inter", fontWeight: "normal" }}
            >
              {values.type}
            </div>
            {/* Main Heading */}
            <div
              tw="flex leading-[1.15] text-[80px] font-bold"
              style={{
                fontFamily: "Cal Sans",
                fontWeight: "bold",
                marginLeft: "-3px",
                fontSize,
              }}
            >
              {heading}
            </div>
          </div>

          <div tw="flex items-center w-full justify-between">
            {/* Left side - App info */}
            <div
              tw="flex items-center text-xl"
              style={{ fontFamily: "Inter", fontWeight: "normal" }}
            >
              {/* App Logo */}
              <div
                tw="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: mode === "dark" ? "#fff" : "#000",
                }}
              >
                <span
                  tw="text-2xl font-bold"
                  style={{
                    color: mode === "dark" ? "#000" : "#fff",
                    fontFamily: "Cal Sans",
                  }}
                >
                  T2
                </span>
              </div>

              <div tw="flex flex-col" style={{ marginLeft: "15px" }}>
                <div tw="text-[22px]" style={{ fontFamily: "Cal Sans" }}>
                  Trade Tracker
                </div>
                <div>Smart Trading Analytics</div>
              </div>
            </div>

            {/* Right side - Features */}
            <div
              tw="flex items-center text-xl gap-6"
              style={{ fontFamily: "Inter", fontWeight: "normal" }}
            >
              <div tw="flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 6h-4c0-2.76-2.24-5-5-5S7 3.24 7 6H3v16h18V6zm-9-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"
                    fill={paint}
                  />
                </svg>
                <span tw="ml-2">Portfolio Tracking</span>
              </div>
              <div tw="flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"
                    fill={paint}
                  />
                </svg>
                <span tw="ml-2">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Cal Sans",
            data: fontBold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );
  } catch (error) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
