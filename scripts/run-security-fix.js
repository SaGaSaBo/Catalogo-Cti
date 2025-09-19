const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing required environment variables');
  console.log('URL:', !!url);
  console.log('Service Key:', !!serviceKey);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { 
  auth: { persistSession: false } 
});

async function runSecurityFix() {
  try {
    console.log('🔧 Running security fix for function search_path...');
    
    // Primero, verificar si las funciones existen
    console.log('\n📋 Checking existing functions...');
    
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, proargtypes, proconfig')
      .eq('pronamespace', 'public')
      .in('proname', ['update_updated_at_column', 'set_updated_at']);
    
    if (funcError) {
      console.error('❌ Error checking functions:', funcError);
    } else {
      console.log('📊 Functions found:', functions);
    }
    
    // Ejecutar el script SQL paso a paso
    console.log('\n🔄 Executing security SQL...');
    
    // Paso 1: Fijar search_path para update_updated_at_column
    const sql1 = `
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
    `;
    
    console.log('🔄 Step 1: Fixing update_updated_at_column...');
    const { data: result1, error: error1 } = await supabase
      .rpc('exec', { sql: sql1 });
    
    if (error1) {
      console.error('❌ Error in step 1:', error1);
    } else {
      console.log('✅ Step 1 completed:', result1);
    }
    
    // Paso 2: Fijar search_path para set_updated_at
    const sql2 = `
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
    `;
    
    console.log('🔄 Step 2: Fixing set_updated_at...');
    const { data: result2, error: error2 } = await supabase
      .rpc('exec', { sql: sql2 });
    
    if (error2) {
      console.error('❌ Error in step 2:', error2);
    } else {
      console.log('✅ Step 2 completed:', result2);
    }
    
    // Paso 3: Verificación
    const sql3 = `
      SELECT 
        n.nspname as schema, 
        p.proname as function, 
        p.proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname='public'
        AND p.proname IN ('update_updated_at_column','set_updated_at');
    `;
    
    console.log('🔄 Step 3: Verifying results...');
    const { data: result3, error: error3 } = await supabase
      .rpc('exec', { sql: sql3 });
    
    if (error3) {
      console.error('❌ Error in verification:', error3);
    } else {
      console.log('✅ Verification completed:', result3);
    }
    
    console.log('\n🎉 Security fix completed!');
    
  } catch (error) {
    console.error('❌ Failed to run security fix:', error);
  }
}

runSecurityFix();
