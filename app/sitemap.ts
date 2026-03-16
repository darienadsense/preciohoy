import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://preciohoy.vercel.app";

  const prices = await prisma.price.findMany({
    where: { isPublished: true },
    include: {
      item: true,
      location: true,
    },
  });

  const items = await prisma.item.findMany();
  const locations = await prisma.location.findMany();
  const marketAssets = await prisma.marketAsset.findMany();

  const priceUrls = prices.map((price) => ({
    url: `${baseUrl}/precio/${price.item.slug}/${price.location.slug}`,
    lastModified: price.lastUpdated ?? new Date(),
  }));

  const productUrls = items.map((item) => ({
    url: `${baseUrl}/producto/${item.slug}`,
    lastModified: new Date(),
  }));

  const cityUrls = locations.map((location) => ({
    url: `${baseUrl}/ciudad/${location.slug}`,
    lastModified: new Date(),
  }));

  const marketUrls = marketAssets.map((asset) => ({
    url: `${baseUrl}/mercado/${asset.slug}`,
    lastModified: asset.lastUpdated ?? new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...priceUrls,
    ...productUrls,
    ...cityUrls,
    ...marketUrls,
  ];
}