import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  console.log("[DEBUG] Create Product Bucket endpoint called");
  const results: any = {
    success: false,
    timestamp: new Date().toISOString(),
    bucketName: "product",
    bucketStatus: "PENDING",
    policyStatus: "PENDING",
    error: null,
    recommendations: [] as string[],
  };

  try {
    // 1. Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const existingBucket = buckets.find(b => b.name === "product");

    if (!existingBucket) {
      console.log("[DEBUG] Bucket 'product' not found. Creating...");
      
      // Create the bucket
      const { data: createData, error: createError } = await supabaseAdmin.storage.createBucket("product", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/*"],
      });

      if (createError) throw createError;
      
      results.bucketStatus = "✅ Bucket 'product' created successfully.";
      console.log(results.bucketStatus);
    } else {
      results.bucketStatus = "✅ Bucket 'product' already exists.";
      console.log(results.bucketStatus);
    }

    // 2. Verify bucket is accessible
    const { data: testFiles, error: testError } = await supabaseAdmin.storage
      .from("product")
      .list("", { limit: 1 });

    if (testError) {
      results.policyStatus = "⚠️ Bucket created but may have permission issues.";
      results.recommendations.push("Verifica las políticas de RLS en tu dashboard de Supabase para el bucket 'product'.");
    } else {
      results.policyStatus = "✅ Bucket is accessible and ready to use.";
    }

    results.success = true;
    return NextResponse.json(results);
  } catch (e: unknown) {
    results.error = getErrorMessage(e);
    results.bucketStatus = "❌ Failed to create bucket.";
    results.recommendations.push(`Error: ${results.error}`);
    console.error("[DEBUG] Error in create-product-bucket:", results.error);
    return NextResponse.json(results, { status: 500 });
  }
}
