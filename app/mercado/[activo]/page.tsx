import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";

type PageProps = {
  params: Promise<{
    activo: string;
  }>;
};

export async function generateStaticParams() {
  const assets = await prisma.marketAsset.findMany();

  return assets.map((asset) => ({
    activo: asset.slug,
  }));
}

export default async function Page({ params }: PageProps) {
  const { activo } = await params;

  const asset = await prisma.marketAsset.findUnique({
    where: { slug: activo },
  });

  if (!asset) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-4xl font-bold">
        Precio del {asset.name} hoy
      </h1>

      <div className="rounded-2xl border p-6">
        <div className="text-sm text-gray-400">Precio actual</div>

        <div className="mt-2 text-3xl font-semibold">
          {asset.currency} {asset.price.toString()}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          Tipo: {asset.type}
        </div>

        <div className="text-sm text-gray-500">
          Símbolo: {asset.symbol}
        </div>

        <div className="text-sm text-gray-500">
          Última actualización:{" "}
          {new Date(asset.lastUpdated).toLocaleDateString("es-PE")}
        </div>

        <div className="text-sm text-gray-500">
          Fuente: {asset.source}
        </div>
      </div>

      <p className="mt-6 text-gray-400">{asset.summary}</p>
    </main>
  );
}