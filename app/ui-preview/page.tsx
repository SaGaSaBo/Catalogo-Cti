export const dynamic = 'force-static';

export default function UIPreview() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">UI Preview</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Colores</p>
          <div className="mt-2 flex gap-2">
            <span className="inline-block h-6 w-6 rounded bg-blue-500" />
            <span className="inline-block h-6 w-6 rounded bg-emerald-500" />
            <span className="inline-block h-6 w-6 rounded bg-rose-500" />
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Tipografía</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">xs</p>
            <p className="text-sm">sm</p>
            <p className="text-base">base</p>
            <p className="text-lg">lg</p>
            <p className="text-xl">xl</p>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Grid & Cards</p>
          <article className="rounded-lg border p-3 hover:shadow-sm">
            <h3 className="font-medium">Card</h3>
            <p className="text-gray-500 text-sm">Deberías ver bordes redondeados, padding y hover suave.</p>
          </article>
        </div>
      </section>
    </main>
  );
}