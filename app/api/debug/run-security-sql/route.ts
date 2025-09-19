import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing required environment variables");
}

const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null;

export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: "Supabase not configured"
    }, { status: 500 });
  }

  try {
    console.log("🔧 Executing security SQL script...");
    
    // Leer el archivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(process.cwd(), 'supabase/security/fix_function_search_path.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log("📝 SQL Content:", sqlContent.substring(0, 200) + "...");
    
    // Ejecutar el SQL completo
    const { data, error } = await supabaseAdmin
      .rpc('exec', { sql: sqlContent });
    
    if (error) {
      console.error("❌ SQL execution error:", error);
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 500 });
    }

    console.log("✅ SQL executed successfully");
    return NextResponse.json({
      success: true,
      data: data,
      message: "Security SQL script executed successfully"
    });

  } catch (error) {
    console.error("❌ Error executing SQL:", error);
    return NextResponse.json({
      error: "Failed to execute SQL",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
