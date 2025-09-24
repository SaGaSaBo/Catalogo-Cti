import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  console.log("[DEBUG] Check Buckets endpoint called");
  const results: any = {
    success: false,
    timestamp: new Date().toISOString(),
    configuredBucket: "product",
    availableBuckets: [] as string[],
    bucketDetails: [] as any[],
    recommendations: [] as string[],
  };

  try {
    // 1. List all available buckets
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    results.availableBuckets = buckets.map((b: any) => b.name);
    
    // 2. Get details for each bucket
    for (const bucket of buckets) {
      const bucketInfo: any = {
        name: bucket.name,
        id: bucket.id,
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types,
        created_at: bucket.created_at,
      };
      
      // Test if bucket is accessible
      try {
        const { data: files, error: testError } = await supabaseAdmin.storage
          .from(bucket.name)
          .list("", { limit: 1 });
        
        bucketInfo.accessible = !testError;
        bucketInfo.testError = testError?.message || null;
      } catch (e: any) {
        bucketInfo.accessible = false;
        bucketInfo.testError = e.message;
      }
      
      results.bucketDetails.push(bucketInfo);
    }

    // 3. Check if our configured bucket exists
    const productBucket = buckets.find(b => b.name === "product");
    if (!productBucket) {
      results.recommendations.push("❌ Bucket 'product' does not exist. You need to create it in Supabase dashboard.");
      results.recommendations.push("💡 Go to Supabase → Storage → Buckets → 'New bucket' → Name: 'product' → Public: Yes");
    } else {
      results.recommendations.push("✅ Bucket 'product' exists.");
      if (!productBucket.public) {
        results.recommendations.push("⚠️ Bucket 'product' is not public. Make it public in Supabase dashboard.");
      }
    }

    // 4. Check for alternative buckets
    const productImagesBucket = buckets.find(b => b.name === "product-images");
    if (productImagesBucket) {
      results.recommendations.push("💡 Found 'product-images' bucket. You could use this instead by updating the code.");
    }

    results.success = true;
    return NextResponse.json(results);
  } catch (e: unknown) {
    results.error = getErrorMessage(e);
    results.recommendations.push(`❌ Error: ${results.error}`);
    console.error("[DEBUG] Error in check-buckets:", results.error);
    return NextResponse.json(results, { status: 500 });
  }
}
