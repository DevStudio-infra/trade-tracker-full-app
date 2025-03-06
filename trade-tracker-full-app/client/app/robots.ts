import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/sw.js"],
      },
    ],
    sitemap: "https://yourdomain.com/sitemap.xml",
  };
}
