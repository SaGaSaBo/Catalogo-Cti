import { supabase, SUPABASE_BUCKET_NAME } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Sube una imagen a Supabase Storage y retorna la URL pública
 * @param file - Archivo de imagen a subir
 * @param bucketName - Nombre del bucket (default: 'images')
 * @param folder - Carpeta dentro del bucket (default: 'products')
 * @returns Promise<UploadResult>
 */
export async function uploadImageToSupabase(
  file: File,
  bucketName: string = 'product-images', // ← FORZADO: Usar bucket correcto directamente
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: `${file.name} no es una imagen válida`
      };
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: `${file.name} es demasiado grande (máximo 5MB)`
      };
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

    console.log('📤 Subiendo imagen a Supabase Storage:', {
      fileName,
      bucketName,
      fileSize: file.size,
      fileType: file.type
    });

    // 1. SUBIR LA IMAGEN A SUPABASE STORAGE
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      console.error('❌ Error al subir la imagen:', uploadError);
      return {
        success: false,
        error: `Error al subir ${file.name}: ${uploadError.message}`
      };
    }

    console.log('✅ Imagen subida exitosamente:', uploadData);

    // 2. OBTENER LA URL PÚBLICA
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrl) {
      console.error('❌ No se pudo obtener la URL pública');
      return {
        success: false,
        error: `No se pudo obtener URL para ${file.name}`
      };
    }

    console.log('🔗 URL pública obtenida:', publicUrl);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error) {
    console.error('❌ Error inesperado al subir imagen:', error);
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Sube múltiples imágenes a Supabase Storage
 * @param files - Array de archivos de imagen
 * @param bucketName - Nombre del bucket (default: 'images')
 * @param folder - Carpeta dentro del bucket (default: 'products')
 * @returns Promise<UploadResult[]>
 */
export async function uploadMultipleImagesToSupabase(
  files: File[],
  bucketName: string = 'product-images', // ← FORZADO: Usar bucket correcto directamente
  folder: string = 'products'
): Promise<UploadResult[]> {
  console.log(`📤 Subiendo ${files.length} imágenes a Supabase Storage...`);
  
  const uploadPromises = files.map(file => 
    uploadImageToSupabase(file, bucketName, folder)
  );

  const results = await Promise.all(uploadPromises);
  
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;
  
  console.log(`📊 Resultados de subida: ${successCount} exitosas, ${errorCount} errores`);
  
  return results;
}

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl - URL pública de la imagen
 * @param bucketName - Nombre del bucket (default: 'images')
 * @returns Promise<boolean>
 */
export async function deleteImageFromSupabase(
  imageUrl: string,
  bucketName: string = 'product-images' // ← FORZADO: Usar bucket correcto directamente
): Promise<boolean> {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const folder = pathParts[pathParts.length - 2];
    const filePath = `${folder}/${fileName}`;

    console.log('🗑️ Eliminando imagen de Supabase Storage:', filePath);

    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error al eliminar imagen:', error);
      return false;
    }

    console.log('✅ Imagen eliminada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error inesperado al eliminar imagen:', error);
    return false;
  }
}

/**
 * Valida si una URL es de Supabase Storage
 * @param url - URL a validar
 * @returns boolean
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('supabase') && urlObj.pathname.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
}
