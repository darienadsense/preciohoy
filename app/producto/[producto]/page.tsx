import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

type PageProps = {
  params: Promise<{
    producto: string;
  }>;
};

export async function generateStaticParams() {
  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    producto: item.slug,
  }));
}

export default async function ProductoPage({ params }: PageProps) {
  const { producto } = await params;

  const item = await prisma.item.findUnique({
    where: { slug: producto },
    include: {
      prices: {
        where: { isPublished: true },
        include: {
          location: true,
        },
        orderBy: {
          location: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-4 text-4xl font-bold">
        Precio de {item.name} en distintas ciudades
      </h1>

      <p className="mb-8 text-lg text-gray-400">
        Consulta el precio de {item.name.toLowerCase()} en diferentes ciudades del Perú.
      </p>

      <div className="grid gap-4">
        {item.prices.map((price) => (
          <Link
            key={price.id}
            href={`/precio/${item.slug}/${price.location.slug}`}
            className="rounded-2xl border p-4 hover:bg-neutral-900"
          >
            <div className="text-xl font-semibold">
              {item.name} en {price.location.name}
            </div>
            <div className="mt-1 text-gray-400">
              Promedio: S/ {price.priceAvg.toString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}