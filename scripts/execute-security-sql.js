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

async function executeSQL() {
  try {
    console.log('🔧 Executing security SQL script...');
    
    // Leer el archivo SQL
    const fs = require('fs');
    const sqlContent = fs.readFileSync('supabase/security/fix_function_search_path.sql', 'utf8');
    
    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔄 Executing statement ${i + 1}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            if (data) {
              console.log('📊 Result:', data);
            }
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 Security SQL script execution completed!');
    
  } catch (error) {
    console.error('❌ Failed to execute security SQL:', error);
    process.exit(1);
  }
}

executeSQL();
