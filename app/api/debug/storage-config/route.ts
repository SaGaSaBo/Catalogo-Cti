import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  console.log("🔍 Verificando configuración de Supabase Storage...");

  try {
    // Verificar variables de entorno
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    console.log("🔧 Variables de entorno:", envCheck);

    // Verificar conexión a Supabase
    const { data: healthCheck, error: healthError } = await supabase
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

    // Verificar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabase
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

    console.log("📦 Buckets disponibles:", buckets);

    // Verificar si existe el bucket 'images'
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      console.log("⚠️ Bucket 'images' no encontrado");
      return NextResponse.json({
        success: false,
        error: "Bucket 'images' no encontrado",
        availableBuckets: buckets?.map(b => b.name) || [],
        envCheck,
        healthCheck: "OK"
      }, { status: 404 });
    }

    console.log("✅ Bucket 'images' encontrado:", imagesBucket);

    // Verificar políticas del bucket
    const { data: policies, error: policiesError } = await supabase
      .storage
      .getBucket('images');

    if (policiesError) {
      console.error("❌ Error al obtener políticas del bucket:", policiesError);
      return NextResponse.json({
        success: false,
        error: "No se pueden obtener políticas del bucket",
        details: policiesError.message,
        envCheck,
        healthCheck: "OK",
        bucket: imagesBucket
      }, { status: 500 });
    }

    console.log("🔒 Políticas del bucket:", policies);

    // Intentar subir un archivo de prueba (texto)
    const testFileName = `test/${Date.now()}_test.txt`;
    const testContent = new Blob(['Test content'], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(testFileName, testContent);

    if (uploadError) {
      console.error("❌ Error al subir archivo de prueba:", uploadError);
      return NextResponse.json({
        success: false,
        error: "No se puede subir archivos al bucket",
        details: uploadError.message,
        envCheck,
        healthCheck: "OK",
        bucket: imagesBucket,
        policies
      }, { status: 500 });
    }

    console.log("✅ Archivo de prueba subido exitosamente:", uploadData);

    // Obtener URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(testFileName);

    console.log("🔗 URL pública generada:", publicUrl);

    // Limpiar archivo de prueba
    const { error: deleteError } = await supabase
      .storage
      .from('images')
      .remove([testFileName]);

    if (deleteError) {
      console.log("⚠️ No se pudo eliminar archivo de prueba:", deleteError);
    } else {
      console.log("✅ Archivo de prueba eliminado");
    }

    return NextResponse.json({
      success: true,
      message: "Configuración de Supabase Storage verificada exitosamente",
      envCheck,
      healthCheck: "OK",
      bucket: imagesBucket,
      policies,
      testUpload: {
        fileName: testFileName,
        uploaded: !!uploadData,
        publicUrl: publicUrl,
        cleaned: !deleteError
      },
      recommendations: [
        "✅ Bucket 'images' configurado correctamente",
        "✅ Permisos de subida funcionando",
        "✅ URLs públicas generándose correctamente",
        "✅ Políticas de acceso configuradas"
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
