#!/usr/bin/env node

/**
 * Script de configuración rápida para nuevo proyecto CATALOGO-MTX
 * Verifica la configuración y proporciona instrucciones
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkEnvVar(varName, description) {
  const value = process.env[varName];
  const exists = !!value;
  log(`${exists ? '✅' : '❌'} ${description}: ${varName}`, exists ? 'green' : 'red');
  if (exists && varName.includes('KEY') && value.length > 20) {
    log(`   Valor: ${value.substring(0, 20)}...`, 'cyan');
  }
  return exists;
}

function main() {
  log('🚀 VERIFICACIÓN DE CONFIGURACIÓN - CATALOGO-MTX', 'bright');
  log('=' .repeat(60), 'blue');
  
  // Verificar archivos del proyecto
  log('\n📁 ARCHIVOS DEL PROYECTO:', 'yellow');
  const files = [
    ['package.json', 'Configuración del proyecto'],
    ['next.config.js', 'Configuración de Next.js'],
    ['vercel.json', 'Configuración de Vercel'],
    ['lib/supabase.ts', 'Cliente de Supabase'],
    ['scripts/supabase-schema.sql', 'Esquema de base de datos'],
    ['scripts/migrate-to-new-project.js', 'Script de migración'],
    ['env.example', 'Ejemplo de variables de entorno']
  ];
  
  let filesOk = 0;
  files.forEach(([file, desc]) => {
    if (checkFile(file, desc)) filesOk++;
  });
  
  // Verificar variables de entorno
  log('\n🔧 VARIABLES DE ENTORNO:', 'yellow');
  const envVars = [
    ['NEXT_PUBLIC_SUPABASE_URL', 'URL de Supabase'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Clave pública de Supabase'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'Clave de servicio de Supabase'],
    ['DATA_PROVIDER', 'Proveedor de datos'],
    ['ADMIN_KEY', 'Clave de administrador'],
    ['NODE_ENV', 'Entorno de ejecución']
  ];
  
  let envVarsOk = 0;
  envVars.forEach(([varName, desc]) => {
    if (checkEnvVar(varName, desc)) envVarsOk++;
  });
  
  // Verificar archivo .env.local
  log('\n📄 ARCHIVO DE CONFIGURACIÓN LOCAL:', 'yellow');
  const envLocalExists = checkFile('.env.local', 'Archivo .env.local');
  
  // Resumen
  log('\n📊 RESUMEN:', 'bright');
  log(`Archivos del proyecto: ${filesOk}/${files.length}`, filesOk === files.length ? 'green' : 'yellow');
  log(`Variables de entorno: ${envVarsOk}/${envVars.length}`, envVarsOk === envVars.length ? 'green' : 'yellow');
  log(`Configuración local: ${envLocalExists ? 'Configurada' : 'Faltante'}`, envLocalExists ? 'green' : 'red');
  
  // Instrucciones
  log('\n📋 PRÓXIMOS PASOS:', 'bright');
  
  if (!envLocalExists) {
    log('1. Copia el archivo de ejemplo:', 'yellow');
    log('   cp env.example .env.local', 'cyan');
  }
  
  if (envVarsOk < envVars.length) {
    log('2. Configura las variables de entorno en .env.local:', 'yellow');
    log('   - Ve a https://supabase.com/dashboard', 'cyan');
    log('   - Crea un nuevo proyecto', 'cyan');
    log('   - Copia las credenciales a .env.local', 'cyan');
  }
  
  if (filesOk === files.length && envVarsOk === envVars.length) {
    log('3. Ejecuta la migración de datos:', 'yellow');
    log('   npm run migrate', 'cyan');
    log('4. Inicia el servidor de desarrollo:', 'yellow');
    log('   npm run dev', 'cyan');
  }
  
  // Enlaces útiles
  log('\n🔗 ENLACES ÚTILES:', 'bright');
  log('• Supabase Dashboard: https://supabase.com/dashboard', 'blue');
  log('• Vercel Dashboard: https://vercel.com/dashboard', 'blue');
  log('• Resend (emails): https://resend.com', 'blue');
  log('• Documentación: docs/setup-new-project.md', 'blue');
  
  // Estado final
  const allOk = filesOk === files.length && envVarsOk === envVars.length && envLocalExists;
  
  log('\n' + '=' .repeat(60), 'blue');
  if (allOk) {
    log('🎉 ¡CONFIGURACIÓN COMPLETA! El proyecto está listo para usar.', 'green');
  } else {
    log('⚠️  Configuración incompleta. Sigue los pasos indicados arriba.', 'yellow');
  }
  log('=' .repeat(60), 'blue');
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, checkEnvVar };
