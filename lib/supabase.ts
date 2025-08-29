// Supabase deshabilitado - usando funciones mock
// Este archivo ha sido modificado para simplificar la aplicación

// Función mock para subir imagen
export async function uploadImage(file: File, bucket: string = 'product-images'): Promise<string> {
  // Simular subida de imagen - devolver una URL placeholder
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
  return `/images/${fileName}`;
}

// Función mock para eliminar imagen
export async function deleteImage(url: string, bucket: string = 'product-images'): Promise<void> {
  // Simular eliminación - no hacer nada
  console.log('Mock: Eliminando imagen', url);
}