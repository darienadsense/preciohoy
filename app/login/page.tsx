export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold">Acceso al panel</h1>

      <form action="/api/login" method="POST" className="grid gap-4">
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full rounded-xl border bg-black p-3"
          required
        />

        <button
          type="submit"
          className="rounded-xl border px-5 py-3 font-semibold hover:bg-neutral-900"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}