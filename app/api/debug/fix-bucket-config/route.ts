import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  console.log("🔧 Fixing bucket configuration...");

  try {
    // 1. Verificar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error("❌ Error al listar buckets:", bucketsError);
      return NextResponse.json({
        success: false,
        error: "No se pueden listar buckets",
        details: bucketsError.message
      }, { status: 500 });
    }

    const availableBuckets = buckets?.map((b: any) => b.name) || [];
    console.log("📦 Buckets disponibles:", availableBuckets);

    // 2. Si existe 'product-images', usarlo; si no, crear 'images'
    const targetBucket = availableBuckets.includes('product-images') ? 'product-images' : 'images';
    
    console.log("🎯 Bucket objetivo:", targetBucket);

    // 3. Verificar si el bucket objetivo existe
    const bucketExists = availableBuckets.includes(targetBucket);

    if (bucketExists) {
      console.log("✅ Bucket objetivo ya existe:", targetBucket);
      
      // Verificar permisos del bucket existente
      const { data: bucketInfo, error: bucketError } = await supabaseAdmin
        .storage
        .getBucket(targetBucket);

      if (bucketError) {
        console.error("❌ Error al obtener información del bucket:", bucketError);
        return NextResponse.json({
          success: false,
          error: "No se puede acceder al bucket",
          details: bucketError.message,
          availableBuckets,
          targetBucket
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Bucket configurado correctamente",
        bucketName: targetBucket,
        bucketInfo: {
          public: bucketInfo.public,
          fileSizeLimit: bucketInfo.file_size_limit,
          allowedMimeTypes: bucketInfo.allowed_mime_types
        },
        availableBuckets,
        configuration: {
          envVar: `NEXT_PUBLIC_SUPABASE_BUCKET_NAME=${targetBucket}`,
          instruction: "Agrega esta línea a tu archivo .env.local"
        },
        recommendations: [
          "✅ Bucket encontrado y configurado",
          "📝 Agrega NEXT_PUBLIC_SUPABASE_BUCKET_NAME=" + targetBucket + " a tu .env.local",
          "🔄 Reinicia tu aplicación",
          "🧪 Prueba subir una imagen"
        ]
      });
    }

    // 4. Crear el bucket si no existe
    console.log("🔨 Creando bucket:", targetBucket);
    
    const { data: newBucket, error: createError } = await supabaseAdmin
      .storage
      .createBucket(targetBucket, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (createError) {
      console.error("❌ Error al crear bucket:", createError);
      return NextResponse.json({
        success: false,
        error: "No se pudo crear el bucket",
        details: createError.message,
        availableBuckets,
        targetBucket
      }, { status: 500 });
    }

    console.log("✅ Bucket creado exitosamente:", newBucket);

    return NextResponse.json({
      success: true,
      message: "Bucket creado y configurado correctamente",
      bucketName: targetBucket,
      bucketData: newBucket,
      availableBuckets: [...availableBuckets, targetBucket],
      configuration: {
        envVar: `NEXT_PUBLIC_SUPABASE_BUCKET_NAME=${targetBucket}`,
        instruction: "Agrega esta línea a tu archivo .env.local"
      },
      recommendations: [
        "✅ Bucket creado exitosamente",
        "✅ Configurado como público",
        "✅ Límite de tamaño: 5MB",
        "✅ Tipos permitidos: JPEG, PNG, GIF, WebP",
        "📝 Agrega NEXT_PUBLIC_SUPABASE_BUCKET_NAME=" + targetBucket + " a tu .env.local",
        "🔄 Reinicia tu aplicación",
        "🧪 Prueba subir una imagen"
      ]
    });

  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({
      success: false,
      error: "Error inesperado",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
