import { prisma } from "../lib/prisma";

export default async function sitemap() {
  const prices = await prisma.price.findMany({
    where: { isPublished: true },
    include: {
      item: true,
      location: true,
    },
  });

  const urls = prices.map((price) => ({
    url: `https://preciohoy.vercel.app/precio/${price.item.slug}/${price.location.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://preciohoy.vercel.app",
      lastModified: new Date(),
    },
    ...urls,
  ];
}