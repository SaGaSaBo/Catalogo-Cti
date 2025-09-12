export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="mb-4">Catálogo CTI</h1>
        <p className="text-lg text-slate-600 mb-8">
          Sistema de gestión de catálogo mayorista
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="/ui-preview" 
            className="btn btn-primary"
          >
            Ver Componentes UI
          </a>
          <a 
            href="/productos" 
            className="btn btn-secondary"
          >
            Ver Productos
          </a>
        </div>
      </div>
    </main>
  );
}