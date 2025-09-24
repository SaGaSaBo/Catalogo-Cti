import { NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/lib/image-upload";

export async function POST(req: Request) {
  console.log("🧪 Testing image upload to Supabase Storage...");

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No se proporcionó archivo"
      }, { status: 400 });
    }

    console.log("📤 Archivo recibido:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Subir imagen a Supabase Storage
    const result = await uploadImageToSupabase(file);

    if (result.success) {
      console.log("✅ Imagen subida exitosamente:", result.url);
      return NextResponse.json({
        success: true,
        message: "Imagen subida exitosamente",
        url: result.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
    } else {
      console.error("❌ Error al subir imagen:", result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return NextResponse.json({
      success: false,
      error: "Error inesperado",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
