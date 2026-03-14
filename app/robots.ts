import type { MetadataRoute } from "next";

export default function (): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
    ],
    sitemap: "https://preciohoy.vercel.app/sitemap.xml",
  };
}