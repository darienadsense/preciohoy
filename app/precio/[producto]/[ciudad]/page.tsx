import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";

type PageProps = {
  params: Promise<{
    producto: string;
    ciudad: string;
  }>;
};

async function getPrice(producto: string, ciudad: string) {
  return prisma.price.findFirst({
    where: {
      isPublished: true,
      item: {
        slug: producto,
      },
      location: {
        slug: ciudad,
      },
    },
    include: {
      item: true,
      location: true,
    },
  });
}

export async function generateStaticParams() {
  const items = await prisma.item.findMany();
  const locations = await prisma.location.findMany();

  const params = [];

  for (const item of items) {
    for (const location of locations) {
      params.push({
        producto: item.slug,
        ciudad: location.slug,
      });
    }
  }

  return params;
}

export default async function Page({ params }: PageProps) {
  const { producto, ciudad } = await params;

  const price = await getPrice(producto, ciudad);

  if (!price) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-4 text-4xl font-bold">
        Precio de {price.item.name} en {price.location.name}
      </h1>

      <p className="mb-8 text-lg text-gray-400">
        El precio de {price.item.name.toLowerCase()} en {price.location.name} va
        de S/ {price.priceMin.toString()} a S/ {price.priceMax.toString()}, con
        un promedio de S/ {price.priceAvg.toString()}.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-400">Mínimo</div>
          <div className="text-2xl font-semibold">
            S/ {price.priceMin.toString()}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-400">Promedio</div>
          <div className="text-2xl font-semibold">
            S/ {price.priceAvg.toString()}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm text-gray-400">Máximo</div>
          <div className="text-2xl font-semibold">
            S/ {price.priceMax.toString()}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-semibold">Resumen</h2>

        <p className="text-gray-400">
          Precio referencial de {price.item.name.toLowerCase()} en{" "}
          {price.location.name}.
        </p>

        <p className="mt-2 text-gray-500">
          Última actualización:{" "}
          {new Date(price.lastUpdated).toLocaleDateString()}
        </p>

        <p className="text-gray-500">Fuente: Mercado local</p>
      </section>
    </main>
  );
}