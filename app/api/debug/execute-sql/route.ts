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

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: "Supabase not configured"
    }, { status: 500 });
  }

  try {
    const { sql } = await req.json();
    
    if (!sql) {
      return NextResponse.json({
        error: "SQL query is required"
      }, { status: 400 });
    }

    console.log("Executing SQL:", sql);
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error("SQL execution error:", error);
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error executing SQL:", error);
    return NextResponse.json({
      error: "Failed to execute SQL",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
