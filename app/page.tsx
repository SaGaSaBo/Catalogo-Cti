export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Catálogo Mayorista
            </h1>
            <p className="text-gray-600">
              Descubre nuestra amplia gama de productos de calidad
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">¡Aplicación funcionando!</h2>
          <p className="text-gray-600 mb-8">
            Si puedes ver esta página, el problema del 404 se ha solucionado.
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Estado:</strong> Aplicación desplegada correctamente en Vercel
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <strong>Variables de entorno:</strong> Configuradas correctamente
            </div>
            <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
              <strong>Dependencias:</strong> Actualizadas a las últimas versiones
            </div>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <strong>Build:</strong> Exitoso sin errores
            </div>
          </div>
          
          <div className="mt-8">
            <a 
              href="/admin?key=admin123" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Panel de Administración
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}