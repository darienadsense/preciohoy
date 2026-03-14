import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "http://localhost:3000";

  const prices = await prisma.price.findMany({
    where: { isPublished: true },
    include: {
      item: true,
      location: true,
    },
  });

  const dynamicUrls = prices.map((p) => ({
    url: `${baseUrl}/precio/${p.item.slug}/${p.location.slug}`,
    lastModified: p.lastUpdated,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...dynamicUrls,
  ];
}