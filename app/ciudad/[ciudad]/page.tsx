import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

type PageProps = {
  params: Promise<{
    ciudad: string;
  }>;
};

export async function generateStaticParams() {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  return locations.map((location) => ({
    ciudad: location.slug,
  }));
}

export default async function CiudadPage({ params }: PageProps) {
  const { ciudad } = await params;

  const location = await prisma.location.findUnique({
    where: { slug: ciudad },
    include: {
      prices: {
        where: { isPublished: true },
        include: {
          item: true,
        },
        orderBy: {
          item: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!location) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-4 text-4xl font-bold">
        Precios en {location.name}
      </h1>

      <p className="mb-8 text-lg text-gray-400">
        Consulta distintos precios disponibles actualmente en {location.name}.
      </p>

      <div className="grid gap-4">
        {location.prices.map((price) => (
          <Link
            key={price.id}
            href={`/precio/${price.item.slug}/${location.slug}`}
            className="rounded-2xl border p-4 hover:bg-neutral-900"
          >
            <div className="text-xl font-semibold">
              {price.item.name} en {location.name}
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