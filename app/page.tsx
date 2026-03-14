import Link from "next/link";
import { prisma } from "../lib/prisma";

export default async function HomePage() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  const prices = await prisma.price.findMany({
    where: { isPublished: true },
    include: {
      item: true,
      location: true,
    },
    orderBy: [
      { item: { name: "asc" } },
      { location: { name: "asc" } },
    ],
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-4 text-4xl font-bold">PrecioHoy</h1>
      <p className="mb-10 text-lg text-gray-400">
        Consulta precios de productos en distintas ciudades del Perú.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Productos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/producto/${item.slug}`}
              className="rounded-2xl border p-4 hover:bg-neutral-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Ciudades</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/ciudad/${location.slug}`}
              className="rounded-2xl border p-4 hover:bg-neutral-900"
            >
              {location.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Precios destacados</h2>
        <div className="grid gap-4">
          {prices.map((price) => (
            <Link
              key={price.id}
              href={`/precio/${price.item.slug}/${price.location.slug}`}
              className="rounded-2xl border p-4 hover:bg-neutral-900"
            >
              <div className="text-xl font-semibold">
                {price.item.name} en {price.location.name}
              </div>
              <div className="mt-1 text-gray-400">
                Promedio: S/ {price.priceAvg.toString()}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}