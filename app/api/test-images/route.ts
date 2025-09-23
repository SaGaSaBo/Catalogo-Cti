import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test básico para verificar que las APIs funcionan
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        baseUrl
      },
      tests: [] as Array<{
        name: string;
        status: string;
        details: any;
      }>
    };

    // Test 1: Verificar que GET /api/products funciona
    try {
      const response = await fetch(`${baseUrl}/api/products`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin123'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.tests.push({
          name: 'GET /api/products (admin)',
          status: 'PASS',
          details: {
            status: response.status,
            productsCount: data.items?.length || data.length || 0,
            hasImageUrls: data.items?.some((p: any) => p.imageUrls?.length > 0) || 
                         data.some((p: any) => p.imageUrls?.length > 0) || false
          }
        });
      } else {
        testResults.tests.push({
          name: 'GET /api/products (admin)',
          status: 'FAIL',
          details: { status: response.status, error: await response.text() }
        });
      }
    } catch (error) {
      testResults.tests.push({
        name: 'GET /api/products (admin)',
        status: 'ERROR',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    // Test 2: Verificar que GET /api/products (público) funciona
    try {
      const response = await fetch(`${baseUrl}/api/products`);
      
      if (response.ok) {
        const data = await response.json();
        testResults.tests.push({
          name: 'GET /api/products (public)',
          status: 'PASS',
          details: {
            status: response.status,
            productsCount: data.items?.length || data.length || 0
          }
        });
      } else {
        testResults.tests.push({
          name: 'GET /api/products (public)',
          status: 'FAIL',
          details: { status: response.status, error: await response.text() }
        });
      }
    } catch (error) {
      testResults.tests.push({
        name: 'GET /api/products (public)',
        status: 'ERROR',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    return NextResponse.json(testResults);
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
