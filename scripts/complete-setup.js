#!/usr/bin/env node

/**
 * Script de configuración completa para CATALOGO-MTX
 * Configura GitHub, Supabase y Vercel en un solo comando
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function execCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'yellow');
    const result = execSync(command, { 
      cwd: process.cwd(), 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    log(`✅ ${description} completado`, 'green');
    return result;
  } catch (error) {
    log(`❌ Error en ${description}: ${error.message}`, 'red');
    return null;
  }
}

function checkFile(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function main() {
  log('🚀 CONFIGURACIÓN COMPLETA - CATALOGO-MTX', 'bright');
  log('=' .repeat(60), 'blue');
  
  // Verificar archivos necesarios
  log('\n📁 VERIFICANDO ARCHIVOS DEL PROYECTO...', 'yellow');
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'vercel.json',
    'lib/supabase.ts',
    'scripts/supabase-schema.sql'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const exists = checkFile(file);
    log(`${exists ? '✅' : '❌'} ${file}`, exists ? 'green' : 'red');
    if (!exists) allFilesExist = false;
  });
  
  if (!allFilesExist) {
    log('\n❌ Faltan archivos necesarios. Verifica la estructura del proyecto.', 'red');
    return;
  }
  
  // Configurar GitHub
  log('\n🐙 CONFIGURANDO GITHUB...', 'yellow');
  if (execCommand('npm run setup-github', 'Configuración de GitHub')) {
    log('✅ GitHub configurado exitosamente', 'green');
  } else {
    log('⚠️  Error configurando GitHub, continuando...', 'yellow');
  }
  
  // Verificar configuración
  log('\n🔍 VERIFICANDO CONFIGURACIÓN...', 'yellow');
  if (execCommand('npm run setup-check', 'Verificación de configuración')) {
    log('✅ Verificación completada', 'green');
  } else {
    log('⚠️  Algunas verificaciones fallaron', 'yellow');
  }
  
  // Mostrar resumen final
  log('\n🎉 CONFIGURACIÓN COMPLETADA', 'bright');
  log('=' .repeat(60), 'blue');
  
  log('\n📋 PRÓXIMOS PASOS MANUALES:', 'yellow');
  log('1. Crear repositorio en GitHub:', 'cyan');
  log('   - Ve a https://github.com/new', 'blue');
  log('   - Nombre: catalogo-mtx', 'blue');
  log('   - NO inicializar con archivos', 'blue');
  log('   - Crear repositorio', 'blue');
  
  log('\n2. Conectar repositorio local:', 'cyan');
  log('   git remote add origin https://github.com/tu-usuario/catalogo-mtx.git', 'blue');
  log('   git push -u origin main', 'blue');
  
  log('\n3. Configurar Supabase:', 'cyan');
  log('   - Ve a https://supabase.com/dashboard', 'blue');
  log('   - Crear nuevo proyecto', 'blue');
  log('   - Ejecutar: npm run migrate', 'blue');
  
  log('\n4. Configurar Vercel:', 'cyan');
  log('   - Ve a https://vercel.com/dashboard', 'blue');
  log('   - Importar repositorio catalogo-mtx', 'blue');
  log('   - Configurar variables de entorno', 'blue');
  
  log('\n📚 DOCUMENTACIÓN:', 'yellow');
  log('• GitHub: docs/github-setup.md', 'blue');
  log('• Proyecto completo: docs/setup-new-project.md', 'blue');
  log('• Variables de entorno: env.example', 'blue');
  
  log('\n🔧 COMANDOS ÚTILES:', 'yellow');
  log('• Verificar configuración: npm run setup-check', 'cyan');
  log('• Migrar datos: npm run migrate', 'cyan');
  log('• Desarrollo: npm run dev', 'cyan');
  log('• Build: npm run build', 'cyan');
  
  log('\n' + '=' .repeat(60), 'blue');
  log('¡El proyecto CATALOGO-MTX está listo para configurar!', 'green');
  log('=' .repeat(60), 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };
