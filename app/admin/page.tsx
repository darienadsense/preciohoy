<form action="/api/logout" method="POST" className="mb-6">
  <button
    type="submit"
    className="rounded-xl border px-4 py-2 font-semibold hover:bg-neutral-900"
  >
    Cerrar sesión
  </button>
</form>
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function createItem(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const unit = String(formData.get("unit") || "").trim();
  const categoryId = Number(formData.get("categoryId"));

  if (!name || !unit || !categoryId) return;

  await prisma.item.create({
    data: {
      name,
      slug: slugify(name),
      unit,
      categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

async function createLocation(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const country = String(formData.get("country") || "Peru").trim();

  if (!name) return;

  await prisma.location.create({
    data: {
      name,
      slug: slugify(name),
      country,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

async function createPrice(formData: FormData) {
  "use server";

  const itemId = Number(formData.get("itemId"));
  const locationId = Number(formData.get("locationId"));
  const priceMin = String(formData.get("priceMin"));
  const priceAvg = String(formData.get("priceAvg"));
  const priceMax = String(formData.get("priceMax"));
  const summary = String(formData.get("summary"));

  if (!itemId || !locationId || !priceMin || !priceAvg || !priceMax || !summary) {
    return;
  }

  const existing = await prisma.price.findFirst({
    where: {
      itemId,
      locationId,
    },
  });

  if (existing) {
    await prisma.price.update({
      where: { id: existing.id },
      data: {
        priceMin,
        priceAvg,
        priceMax,
        summary,
        notes: "Actualizado desde panel",
        lastUpdated: new Date(),
        isPublished: true,
      },
    });
  } else {
    const source = await prisma.source.findFirst();

    await prisma.price.create({
      data: {
        itemId,
        locationId,
        sourceId: source?.id,
        priceMin,
        priceAvg,
        priceMax,
        currency: "PEN",
        lastUpdated: new Date(),
        summary,
        notes: "Creado desde panel",
        isPublished: true,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
}

export default async function AdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const items = await prisma.item.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  const prices = await prisma.price.findMany({
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
      <h1 className="mb-6 text-4xl font-bold">Panel administrativo</h1>

      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">Crear producto</h2>

          <form action={createItem} className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Nombre</label>
              <input
                name="name"
                className="w-full rounded-xl border bg-black p-3"
                placeholder="Ej. GLP"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Unidad</label>
              <input
                name="unit"
                className="w-full rounded-xl border bg-black p-3"
                placeholder="Ej. galón, bolsa, kg, litro"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Categoría</label>
              <select
                name="categoryId"
                className="w-full rounded-xl border bg-black p-3"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-neutral-900"
            >
              Crear producto
            </button>
          </form>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="mb-4 text-2xl font-semibold">Crear ciudad</h2>

          <form action={createLocation} className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Nombre</label>
              <input
                name="name"
                className="w-full rounded-xl border bg-black p-3"
                placeholder="Ej. Cusco"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">País</label>
              <input
                name="country"
                defaultValue="Peru"
                className="w-full rounded-xl border bg-black p-3"
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-neutral-900"
            >
              Crear ciudad
            </button>
          </form>
        </div>
      </section>

      <section className="mb-10 rounded-2xl border p-6">
        <h2 className="mb-4 text-2xl font-semibold">Agregar o actualizar precio</h2>

        <form action={createPrice} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-gray-400">Producto</label>
            <select
              name="itemId"
              className="w-full rounded-xl border bg-black p-3"
              required
            >
              <option value="">Selecciona un producto</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Ciudad</label>
            <select
              name="locationId"
              className="w-full rounded-xl border bg-black p-3"
              required
            >
              <option value="">Selecciona una ciudad</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Precio mínimo</label>
            <input
              name="priceMin"
              type="number"
              step="0.01"
              className="w-full rounded-xl border bg-black p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Precio promedio</label>
            <input
              name="priceAvg"
              type="number"
              step="0.01"
              className="w-full rounded-xl border bg-black p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Precio máximo</label>
            <input
              name="priceMax"
              type="number"
              step="0.01"
              className="w-full rounded-xl border bg-black p-3"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-400">Resumen</label>
            <textarea
              name="summary"
              className="w-full rounded-xl border bg-black p-3"
              rows={4}
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-neutral-900"
            >
              Guardar precio
            </button>
          </div>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Productos actuales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="text-xl font-semibold">{item.name}</div>
              <div className="text-sm text-gray-400">
                {item.category.name} · Unidad: {item.unit}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold">Ciudades actuales</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((location) => (
            <div key={location.id} className="rounded-2xl border p-4">
              <div className="text-xl font-semibold">{location.name}</div>
              <div className="text-sm text-gray-400">{location.country}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Precios actuales</h2>

        <div className="grid gap-4">
          {prices.map((price) => (
            <div key={price.id} className="rounded-2xl border p-4">
              <div className="text-xl font-semibold">
                {price.item.name} en {price.location.name}
              </div>
              <div className="mt-1 text-gray-400">
                Min: S/ {price.priceMin.toString()} | Prom: S/{" "}
                {price.priceAvg.toString()} | Max: S/ {price.priceMax.toString()}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {new Date(price.lastUpdated).toLocaleDateString("es-PE")}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}