import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data-provider";
import { sbRender } from "@/lib/img";

export async function GET() {
  try {
    // Obtener algunos productos de ejemplo
    const products = await getProducts();
    const sampleProducts = products.slice(0, 3);
    
    // Verificar configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Generar URLs de ejemplo
    const imageTests = sampleProducts.map((product: any) => {
      const imageUrls = product.imageUrls || [];
      const firstImage = imageUrls[0];
      
      return {
        productId: product.id,
        productTitle: product.title,
        imageUrls: imageUrls,
        firstImage: firstImage,
        optimizedUrl: firstImage ? sbRender(firstImage, { w: 400, q: 70, format: "webp" }) : null,
        publicUrl: firstImage ? `${supabaseUrl}/storage/v1/object/public/products/${firstImage}` : null
      };
    });
    
    return NextResponse.json({
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 50) + "..." : null,
        dataProvider: process.env.DATA_PROVIDER || 'mock'
      },
      productsCount: products.length,
      sampleProducts: imageTests,
      imageConfiguration: {
        remotePatterns: [
          { protocol: "https", hostname: "**.supabase.co" },
          { protocol: "https", hostname: "images.unsplash.com" }
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to debug images",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
