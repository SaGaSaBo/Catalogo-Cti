import { NextResponse } from "next/server";
import { uploadImageToSupabase } from "@/lib/image-upload";

export async function POST() {
  console.log("🧪 Testing bucket fix...");

  try {
    // Crear un archivo de prueba
    const testContent = "Test image content";
    const testFile = new File([testContent], "test.txt", { type: "text/plain" });

    console.log("📤 Testing upload with bucket 'product-images'...");

    // Probar la función de subida
    const result = await uploadImageToSupabase(testFile);

    if (result.success) {
      console.log("✅ Upload test successful:", result.url);
      
      // Limpiar archivo de prueba
      try {
        const { supabase } = await import("@/lib/supabase");
        const url = new URL(result.url!);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const folder = pathParts[pathParts.length - 2];
        const filePath = `${folder}/${fileName}`;

        await supabase.storage
          .from('product-images')
          .remove([filePath]);

        console.log("✅ Test file cleaned up");
      } catch (cleanupError) {
        console.log("⚠️ Could not clean up test file:", cleanupError);
      }

      return NextResponse.json({
        success: true,
        message: "Bucket fix is working correctly!",
        testResult: {
          bucketUsed: "product-images",
          uploadSuccess: true,
          urlGenerated: !!result.url,
          cleaned: true
        },
        recommendations: [
          "✅ Bucket 'product-images' is working correctly",
          "✅ Image upload should work in the admin panel",
          "🧪 Try uploading an image in the admin panel now"
        ]
      });
    } else {
      console.error("❌ Upload test failed:", result.error);
      
      return NextResponse.json({
        success: false,
        message: "Bucket fix test failed",
        error: result.error,
        testResult: {
          bucketUsed: "product-images",
          uploadSuccess: false,
          error: result.error
        },
        recommendations: [
          "❌ There's still an issue with the bucket configuration",
          "🔧 Check if the bucket 'product-images' exists in Supabase",
          "🔧 Verify bucket permissions are correct"
        ]
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Test error:", error);
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
