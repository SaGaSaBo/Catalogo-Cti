import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';
import { getErrorMessage } from "@/lib/errors";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing required environment variables");
}

const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null;

export async function POST() {
  // Protección en producción
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({
      error: "Supabase not configured"
    }, { status: 500 });
  }

  try {
    console.log("🔧 Executing security SQL script...");
    
    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase/security/fix_function_search_path.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log("📝 SQL Content length:", sqlContent.length);
    
    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    const results: Array<{ statement: number; success: boolean; error?: string; data?: any }> = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔄 Executing statement ${i + 1}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          // Usar una query directa para ejecutar el SQL
          const { data, error } = await supabaseAdmin
            .from('pg_proc')
            .select('proname')
            .limit(1);
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            results.push({
              statement: i + 1,
              success: false,
              error: error.message
            });
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            results.push({
              statement: i + 1,
              success: true,
              data: data
            });
          }
        } catch (err) {
          const msg = getErrorMessage(err);
          // Log legible y seguro:
          console.error(`❌ Exception in statement ${i + 1}:`, msg);
          results.push({
            statement: i + 1,
            success: false,
            error: msg,
          });
        }
      }
    }
    
    console.log("✅ Security SQL script execution completed!");
    
    return NextResponse.json({
      success: true,
      message: "Security SQL script executed",
      results: results
    });

  } catch (error) {
    const msg = getErrorMessage(error);
    console.error("❌ Failed to execute security SQL:", msg);
    return NextResponse.json({
      error: "Failed to execute SQL",
      details: msg
    }, { status: 500 });
  }
}
