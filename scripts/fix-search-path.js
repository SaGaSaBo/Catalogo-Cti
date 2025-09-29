const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { 
  auth: { persistSession: false } 
});

async function fixSearchPath() {
  try {
    console.log('🔧 Fixing function search_path...');
    
    // 1. Verificar funciones existentes
    console.log('\n📋 Checking existing functions...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, proargtypes')
      .eq('pronamespace', 'public'::regclass)
      .in('proname', ['update_updated_at_column', 'set_updated_at']);
    
    if (funcError) {
      console.error('❌ Error checking functions:', funcError);
      return;
    }
    
    console.log('Found functions:', functions);
    
    // 2. Ejecutar el script SQL completo
    const sqlScript = `
-- A) Fijar search_path de update_updated_at_column si existe
DO $$
DECLARE
  sig text;
BEGIN
  SELECT '(' || pg_catalog.oidvectortypes(p.proargtypes) || ')'
    INTO sig
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'update_updated_at_column'
  LIMIT 1;

  IF sig IS NOT NULL THEN
    EXECUTE format(
      'ALTER FUNCTION public.update_updated_at_column%s SET search_path = '''';',
      sig
    );
    RAISE NOTICE 'Fixed search_path for update_updated_at_column%', sig;
  ELSE
    RAISE NOTICE 'Function update_updated_at_column not found';
  END IF;
END $$;

-- B) Fijar search_path de set_updated_at si existe
DO $$
DECLARE
  sig text;
BEGIN
  SELECT '(' || pg_catalog.oidvectortypes(p.proargtypes) || ')'
    INTO sig
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'set_updated_at'
  LIMIT 1;

  IF sig IS NOT NULL THEN
    EXECUTE format(
      'ALTER FUNCTION public.set_updated_at%s SET search_path = '''';',
      sig
    );
    RAISE NOTICE 'Fixed search_path for set_updated_at%', sig;
  ELSE
    RAISE NOTICE 'Function set_updated_at not found';
  END IF;
END $$;

-- C) Verificación
SELECT 
  n.nspname as schema, 
  p.proname as function, 
  p.proconfig
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public'
  AND p.proname IN ('update_updated_at_column','set_updated_at');
    `;
    
    console.log('\n🔄 Executing SQL script...');
    
    // Usar una query directa para ejecutar el script
    const { data, error } = await supabase
      .rpc('exec', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Intentar ejecutar por partes
      console.log('\n🔄 Trying alternative approach...');
      
      // Verificar si las funciones existen
      const { data: checkData, error: checkError } = await supabase
        .from('pg_proc')
        .select('proname, proargtypes, proconfig')
        .eq('pronamespace', 'public'::regclass)
        .in('proname', ['update_updated_at_column', 'set_updated_at']);
      
      if (checkError) {
        console.error('❌ Error checking functions:', checkError);
      } else {
        console.log('📊 Current function status:', checkData);
      }
      
    } else {
      console.log('✅ SQL script executed successfully');
      console.log('📊 Result:', data);
    }
    
  } catch (error) {
    console.error('❌ Failed to fix search_path:', error);
  }
}

fixSearchPath();

