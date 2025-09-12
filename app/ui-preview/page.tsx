export const dynamic = 'force-static';

export default function UIPreview() {
  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2">UI Preview</h1>
        <p className="text-slate-600">
          Componentes y estilos del sistema de diseño
        </p>
      </div>

      <div className="space-y-8">
        {/* Colores */}
        <section className="card">
          <h2 className="mb-4">Paleta de Colores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Slate</p>
              <div className="flex gap-1">
                <div className="h-8 w-8 rounded bg-slate-100 ring-1 ring-slate-200" />
                <div className="h-8 w-8 rounded bg-slate-300" />
                <div className="h-8 w-8 rounded bg-slate-500" />
                <div className="h-8 w-8 rounded bg-slate-900" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Blue</p>
              <div className="flex gap-1">
                <div className="h-8 w-8 rounded bg-blue-100" />
                <div className="h-8 w-8 rounded bg-blue-300" />
                <div className="h-8 w-8 rounded bg-blue-500" />
                <div className="h-8 w-8 rounded bg-blue-900" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Green</p>
              <div className="flex gap-1">
                <div className="h-8 w-8 rounded bg-emerald-100" />
                <div className="h-8 w-8 rounded bg-emerald-300" />
                <div className="h-8 w-8 rounded bg-emerald-500" />
                <div className="h-8 w-8 rounded bg-emerald-900" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Red</p>
              <div className="flex gap-1">
                <div className="h-8 w-8 rounded bg-rose-100" />
                <div className="h-8 w-8 rounded bg-rose-300" />
                <div className="h-8 w-8 rounded bg-rose-500" />
                <div className="h-8 w-8 rounded bg-rose-900" />
              </div>
            </div>
          </div>
        </section>

        {/* Tipografía */}
        <section className="card">
          <h2 className="mb-4">Tipografía</h2>
          <div className="space-y-4">
            <div>
              <h1>Heading 1</h1>
              <h2>Heading 2</h2>
              <h3>Heading 3</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">text-xs: Lorem ipsum dolor sit amet</p>
              <p className="text-sm text-slate-600">text-sm: Lorem ipsum dolor sit amet</p>
              <p className="text-base">text-base: Lorem ipsum dolor sit amet</p>
              <p className="text-lg">text-lg: Lorem ipsum dolor sit amet</p>
              <p className="text-xl">text-xl: Lorem ipsum dolor sit amet</p>
            </div>
          </div>
        </section>

        {/* Botones */}
        <section className="card">
          <h2 className="mb-4">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="mb-4">Cards & Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="mb-2">Card Title</h3>
              <p className="text-slate-600 text-sm mb-4">
                Una descripción del contenido de la card con información relevante.
              </p>
              <button className="btn btn-primary btn-sm">Acción</button>
            </div>
            <div className="card">
              <h3 className="mb-2">Otra Card</h3>
              <p className="text-slate-600 text-sm mb-4">
                Ejemplo de cómo se ve el layout con múltiples cards.
              </p>
              <button className="btn btn-secondary btn-sm">Ver más</button>
            </div>
            <div className="card">
              <h3 className="mb-2">Tercera Card</h3>
              <p className="text-slate-600 text-sm mb-4">
                Grid responsivo que se adapta a diferentes tamaños.
              </p>
              <button className="btn btn-primary btn-sm">Explorar</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}