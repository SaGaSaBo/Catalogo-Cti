import { NextResponse } from "next/server";
import { SUPABASE_BUCKET_NAME, supabase } from "@/lib/supabase";

export async function GET() {
  console.log("🧪 Testing bucket configuration...");

  try {
    // Verificar configuración del bucket
    const bucketConfig = {
      bucketName: SUPABASE_BUCKET_NAME,
      envVar: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
      isConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
      fallbackUsed: !process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME
    };

    console.log("🔧 Bucket configuration:", bucketConfig);

    // Verificar si el bucket existe
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error("❌ Error al listar buckets:", bucketsError);
      return NextResponse.json({
        success: false,
        error: "No se pueden listar buckets",
        details: bucketsError.message,
        bucketConfig
      }, { status: 500 });
    }

    const availableBuckets = buckets?.map((b: any) => b.name) || [];
    const bucketExists = availableBuckets.includes(SUPABASE_BUCKET_NAME);

    console.log("📦 Buckets disponibles:", availableBuckets);
    console.log("✅ Bucket configurado existe:", bucketExists);

    return NextResponse.json({
      success: true,
      message: "Configuración del bucket verificada",
      bucketConfig,
      availableBuckets,
      bucketExists,
      recommendations: bucketExists ? [
        "✅ Bucket configurado correctamente",
        "✅ El bucket existe en Supabase",
        "✅ Listo para subir imágenes"
      ] : [
        "⚠️ El bucket configurado no existe",
        "📝 Buckets disponibles: " + availableBuckets.join(", "),
        "🔧 Actualiza NEXT_PUBLIC_SUPABASE_BUCKET_NAME en tu .env.local"
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
