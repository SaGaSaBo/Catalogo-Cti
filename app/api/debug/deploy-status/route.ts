import { NextResponse } from "next/server";
import { SUPABASE_BUCKET_NAME } from "@/lib/supabase";

export async function GET() {
  console.log("🚀 Checking deploy status...");

  try {
    const deployInfo = {
      timestamp: new Date().toISOString(),
      bucketName: SUPABASE_BUCKET_NAME,
      envVar: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'NOT_SET',
      usingFallback: !process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
      vercel: !!process.env.VERCEL
    };

    console.log("📊 Deploy status:", deployInfo);

    return NextResponse.json({
      success: true,
      message: "Deploy status check",
      deployInfo,
      bucketConfiguration: {
        configured: SUPABASE_BUCKET_NAME,
        expected: "product-images",
        correct: SUPABASE_BUCKET_NAME === "product-images",
        status: SUPABASE_BUCKET_NAME === "product-images" ? "✅ CORRECT" : "❌ INCORRECT"
      },
      recommendations: SUPABASE_BUCKET_NAME === "product-images" ? [
        "✅ Bucket configuration is correct",
        "🚀 Ready to test image upload",
        "🧪 Try uploading an image in the admin panel"
      ] : [
        "❌ Bucket configuration is incorrect",
        "🔧 Expected: product-images",
        "🔧 Actual: " + SUPABASE_BUCKET_NAME,
        "🔄 Redeploy may be needed"
      ]
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({
      success: false,
      error: "Error inesperado",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
