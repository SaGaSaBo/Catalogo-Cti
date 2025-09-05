#!/usr/bin/env node

/**
 * Script para verificar variables de entorno de Supabase
 * Ejecutar con: node scripts/verify-env.js
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATA_PROVIDER'
];

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'DEBUG_ORDERS',
  'NODE_ENV'
];

console.log('🔍 Verificando variables de entorno...\n');

// Verificar variables requeridas
let allRequired = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allRequired = false;
  } else {
    const displayValue = varName.includes('KEY') ? `${value.slice(0, 20)}...` : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

console.log('\n📋 Variables opcionales:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes('KEY') ? `${value.slice(0, 20)}...` : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`⚠️  ${varName}: No configurada (opcional)`);
  }
});

console.log('\n🔧 Configuración recomendada para Vercel:');
console.log(`
Variables requeridas:
- NEXT_PUBLIC_SUPABASE_URL = https://iykfzxochppbxdcjtjsf.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY = [tu_anon_key]
- DATA_PROVIDER = supabase

Variables recomendadas:
- SUPABASE_SERVICE_ROLE_KEY = [tu_service_role_key]
- DEBUG_ORDERS = 1
- NODE_ENV = production
`);

if (allRequired) {
  console.log('\n✅ Todas las variables requeridas están configuradas');
} else {
  console.log('\n❌ Faltan variables requeridas');
  process.exit(1);
}
