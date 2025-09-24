import { NextResponse } from "next/server";
import { supabaseAdmin, SUPABASE_BUCKET_NAME } from "@/lib/supabase";

export async function POST() {
  console.log("🔧 Setting up Supabase Storage bucket...");

  try {
    // Verificar buckets existentes
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
    const bucketExists = availableBuckets.includes(SUPABASE_BUCKET_NAME);

    console.log("📦 Buckets disponibles:", availableBuckets);
    console.log("🔍 Bucket configurado:", SUPABASE_BUCKET_NAME);
    console.log("✅ Bucket existe:", bucketExists);

    if (bucketExists) {
      return NextResponse.json({
        success: true,
        message: "Bucket ya existe",
        bucketName: SUPABASE_BUCKET_NAME,
        availableBuckets,
        bucketExists: true
      });
    }

    // Crear el bucket si no existe
    console.log("🔨 Creando bucket:", SUPABASE_BUCKET_NAME);
    
    const { data: newBucket, error: createError } = await supabaseAdmin
      .storage
      .createBucket(SUPABASE_BUCKET_NAME, {
        public: true, // Hacer el bucket público para acceso directo a imágenes
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (createError) {
      console.error("❌ Error al crear bucket:", createError);
      return NextResponse.json({
        success: false,
        error: "No se pudo crear el bucket",
        details: createError.message,
        availableBuckets
      }, { status: 500 });
    }

    console.log("✅ Bucket creado exitosamente:", newBucket);

    // Crear políticas básicas para el bucket
    console.log("🔒 Configurando políticas de acceso...");
    
    // Política para permitir lectura pública
    const { error: selectPolicyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: SUPABASE_BUCKET_NAME,
      policy_name: 'Public read access',
      operation: 'SELECT',
      expression: 'true'
    });

    // Política para permitir inserción (subida de archivos)
    const { error: insertPolicyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_name: SUPABASE_BUCKET_NAME,
      policy_name: 'Public insert access',
      operation: 'INSERT',
      expression: 'true'
    });

    if (selectPolicyError || insertPolicyError) {
      console.log("⚠️ No se pudieron crear políticas automáticamente:", {
        selectPolicyError: selectPolicyError?.message,
        insertPolicyError: insertPolicyError?.message
      });
    }

    return NextResponse.json({
      success: true,
      message: "Bucket creado exitosamente",
      bucketName: SUPABASE_BUCKET_NAME,
      bucketData: newBucket,
      availableBuckets: [...availableBuckets, SUPABASE_BUCKET_NAME],
      bucketExists: true,
      policiesCreated: !selectPolicyError && !insertPolicyError,
      recommendations: [
        "✅ Bucket creado exitosamente",
        "✅ Configurado como público",
        "✅ Límite de tamaño: 5MB",
        "✅ Tipos permitidos: JPEG, PNG, GIF, WebP",
        "🔧 Si las políticas no se crearon automáticamente, créalas manualmente en Supabase"
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
