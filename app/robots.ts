import { MetadataRoute } from "next";
import type { MetadataRoute } from "next";
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
    ],
    sitemap: "http://localhost:3000/sitemap.xml",
  };
}
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "http://localhost:3000/sitemap.xml",
  };
}