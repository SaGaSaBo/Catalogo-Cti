import { NextResponse } from "next/server";
import { supabaseAdmin, SUPABASE_BUCKET_NAME } from "@/lib/supabase";

export async function GET() {
  console.log("🔍 Verificando configuración completa de Supabase Storage...");

  try {
    // 1. Verificar variables de entorno
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_BUCKET_NAME: !!process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
      bucketName: SUPABASE_BUCKET_NAME
    };

    console.log("🔧 Variables de entorno:", envCheck);

    // 2. Verificar conexión a Supabase
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('products')
      .select('id')
      .limit(1);

    if (healthError) {
      console.error("❌ Error de conexión a Supabase:", healthError);
      return NextResponse.json({
        success: false,
        error: "No se puede conectar a Supabase",
        details: healthError.message,
        envCheck
      }, { status: 500 });
    }

    console.log("✅ Conexión a Supabase exitosa");

    // 3. Verificar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error("❌ Error al listar buckets:", bucketsError);
      return NextResponse.json({
        success: false,
        error: "No se pueden listar buckets",
        details: bucketsError.message,
        envCheck,
        healthCheck: "OK"
      }, { status: 500 });
    }

    const availableBuckets = buckets?.map((b: any) => b.name) || [];
    const bucketExists = availableBuckets.includes(SUPABASE_BUCKET_NAME);

    console.log("📦 Buckets disponibles:", availableBuckets);
    console.log("🔍 Bucket configurado:", SUPABASE_BUCKET_NAME);
    console.log("✅ Bucket existe:", bucketExists);

    // 4. Si el bucket existe, verificar permisos
    let bucketPermissions = null;
    if (bucketExists) {
      try {
        const { data: bucketInfo, error: bucketError } = await supabaseAdmin
          .storage
          .getBucket(SUPABASE_BUCKET_NAME);

        if (!bucketError) {
          bucketPermissions = {
            public: bucketInfo.public,
            fileSizeLimit: bucketInfo.file_size_limit,
            allowedMimeTypes: bucketInfo.allowed_mime_types
          };
        }
      } catch (error) {
        console.log("⚠️ No se pudo obtener información del bucket:", error);
      }
    }

    // 5. Probar subida de archivo de prueba
    let uploadTest = null;
    if (bucketExists) {
      try {
        const testFileName = `test/${Date.now()}_test.txt`;
        const testContent = new Blob(['Test content'], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from(SUPABASE_BUCKET_NAME)
          .upload(testFileName, testContent);

        if (!uploadError) {
          // Obtener URL pública
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from(SUPABASE_BUCKET_NAME)
            .getPublicUrl(testFileName);

          // Limpiar archivo de prueba
          await supabaseAdmin
            .storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([testFileName]);

          uploadTest = {
            success: true,
            fileName: testFileName,
            publicUrl: publicUrl,
            cleaned: true
          };
        } else {
          uploadTest = {
            success: false,
            error: uploadError.message
          };
        }
      } catch (error) {
        uploadTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // 6. Generar recomendaciones
    const recommendations = [];
    
    if (!envCheck.NEXT_PUBLIC_SUPABASE_BUCKET_NAME) {
      recommendations.push("⚠️ NEXT_PUBLIC_SUPABASE_BUCKET_NAME no está configurado");
    }
    
    if (!bucketExists) {
      recommendations.push("❌ El bucket configurado no existe");
      recommendations.push("🔧 Usa POST /api/debug/setup-bucket para crear el bucket automáticamente");
    } else {
      recommendations.push("✅ Bucket configurado existe");
    }
    
    if (uploadTest?.success) {
      recommendations.push("✅ Permisos de subida funcionando");
      recommendations.push("✅ URLs públicas generándose correctamente");
    } else if (uploadTest) {
      recommendations.push("❌ Error en prueba de subida: " + uploadTest.error);
    }

    const result = {
      success: bucketExists && uploadTest?.success,
      timestamp: new Date().toISOString(),
      envCheck,
      healthCheck: "OK",
      buckets: {
        available: availableBuckets,
        configured: SUPABASE_BUCKET_NAME,
        exists: bucketExists,
        permissions: bucketPermissions
      },
      uploadTest,
      recommendations,
      nextSteps: bucketExists ? [
        "✅ Configuración completa",
        "🚀 Listo para subir imágenes",
        "🧪 Prueba crear un producto con imágenes"
      ] : [
        "🔧 Crear bucket: POST /api/debug/setup-bucket",
        "📝 Configurar NEXT_PUBLIC_SUPABASE_BUCKET_NAME en .env.local",
        "🔄 Reiniciar aplicación"
      ]
    };

    console.log("📊 Resultado de verificación:", result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({
      success: false,
      error: "Error inesperado",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
