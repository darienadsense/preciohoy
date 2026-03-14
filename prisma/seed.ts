import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Categories
  const combustibles = await prisma.category.upsert({
    where: { slug: "combustibles" },
    update: {},
    create: { name: "Combustibles", slug: "combustibles" },
  });

  const construccion = await prisma.category.upsert({
    where: { slug: "construccion" },
    update: {},
    create: { name: "Construcción", slug: "construccion" },
  });

  const agua = await prisma.category.upsert({
    where: { slug: "agua" },
    update: {},
    create: { name: "Agua", slug: "agua" },
  });

  // Items
  const gasolina = await prisma.item.upsert({
    where: { slug: "gasolina" },
    update: {},
    create: {
      name: "Gasolina",
      slug: "gasolina",
      unit: "galón",
      categoryId: combustibles.id,
    },
  });

  const diesel = await prisma.item.upsert({
    where: { slug: "diesel" },
    update: {},
    create: {
      name: "Diésel",
      slug: "diesel",
      unit: "galón",
      categoryId: combustibles.id,
    },
  });

  const cemento = await prisma.item.upsert({
    where: { slug: "cemento" },
    update: {},
    create: {
      name: "Cemento",
      slug: "cemento",
      unit: "bolsa",
      categoryId: construccion.id,
    },
  });

  const bidonAgua = await prisma.item.upsert({
    where: { slug: "bidon-agua-20l" },
    update: {},
    create: {
      name: "Bidón de agua 20L",
      slug: "bidon-agua-20l",
      unit: "unidad",
      categoryId: agua.id,
    },
  });

  // Locations
  const lima = await prisma.location.upsert({
    where: { slug: "lima" },
    update: {},
    create: { name: "Lima", slug: "lima", country: "Peru" },
  });

  const trujillo = await prisma.location.upsert({
    where: { slug: "trujillo" },
    update: {},
    create: { name: "Trujillo", slug: "trujillo", country: "Peru" },
  });

  const arequipa = await prisma.location.upsert({
    where: { slug: "arequipa" },
    update: {},
    create: { name: "Arequipa", slug: "arequipa", country: "Peru" },
  });

  // Source
  const mercadoLocal = await prisma.source.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Mercado local",
      url: null,
    },
  });

  // Prices
  const prices = [
    {
      itemId: gasolina.id,
      locationId: lima.id,
      priceMin: "17.50",
      priceMax: "18.90",
      priceAvg: "18.20",
      summary: "Precio referencial de gasolina en Lima.",
    },
    {
      itemId: gasolina.id,
      locationId: trujillo.id,
      priceMin: "17.20",
      priceMax: "19.10",
      priceAvg: "18.10",
      summary: "Precio referencial de gasolina en Trujillo.",
    },
    {
      itemId: gasolina.id,
      locationId: arequipa.id,
      priceMin: "17.80",
      priceMax: "19.30",
      priceAvg: "18.50",
      summary: "Precio referencial de gasolina en Arequipa.",
    },
    {
      itemId: diesel.id,
      locationId: lima.id,
      priceMin: "16.20",
      priceMax: "17.40",
      priceAvg: "16.80",
      summary: "Precio referencial de diésel en Lima.",
    },
    {
      itemId: diesel.id,
      locationId: trujillo.id,
      priceMin: "16.00",
      priceMax: "17.20",
      priceAvg: "16.60",
      summary: "Precio referencial de diésel en Trujillo.",
    },
    {
      itemId: diesel.id,
      locationId: arequipa.id,
      priceMin: "16.30",
      priceMax: "17.50",
      priceAvg: "16.90",
      summary: "Precio referencial de diésel en Arequipa.",
    },
    {
      itemId: cemento.id,
      locationId: lima.id,
      priceMin: "28.00",
      priceMax: "32.00",
      priceAvg: "30.00",
      summary: "Precio referencial de cemento en Lima.",
    },
    {
      itemId: cemento.id,
      locationId: trujillo.id,
      priceMin: "27.50",
      priceMax: "31.50",
      priceAvg: "29.50",
      summary: "Precio referencial de cemento en Trujillo.",
    },
    {
      itemId: cemento.id,
      locationId: arequipa.id,
      priceMin: "28.50",
      priceMax: "32.50",
      priceAvg: "30.50",
      summary: "Precio referencial de cemento en Arequipa.",
    },
    {
      itemId: bidonAgua.id,
      locationId: lima.id,
      priceMin: "7.00",
      priceMax: "10.00",
      priceAvg: "8.50",
      summary: "Precio referencial de bidón de agua 20L en Lima.",
    },
    {
      itemId: bidonAgua.id,
      locationId: trujillo.id,
      priceMin: "6.50",
      priceMax: "9.50",
      priceAvg: "8.00",
      summary: "Precio referencial de bidón de agua 20L en Trujillo.",
    },
    {
      itemId: bidonAgua.id,
      locationId: arequipa.id,
      priceMin: "7.20",
      priceMax: "10.20",
      priceAvg: "8.70",
      summary: "Precio referencial de bidón de agua 20L en Arequipa.",
    },
  ];

  for (const price of prices) {
    await prisma.price.upsert({
      where: {
        itemId_locationId: {
          itemId: price.itemId,
          locationId: price.locationId,
        },
      },
      update: {
        priceMin: price.priceMin,
        priceMax: price.priceMax,
        priceAvg: price.priceAvg,
        currency: "PEN",
        lastUpdated: new Date(),
        summary: price.summary,
        notes: "Rango referencial",
        isPublished: true,
        sourceId: mercadoLocal.id,
      },
      create: {
        itemId: price.itemId,
        locationId: price.locationId,
        priceMin: price.priceMin,
        priceMax: price.priceMax,
        priceAvg: price.priceAvg,
        currency: "PEN",
        lastUpdated: new Date(),
        summary: price.summary,
        notes: "Rango referencial",
        isPublished: true,
        sourceId: mercadoLocal.id,
      },
    });
  }

  console.log("Seed completado.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });