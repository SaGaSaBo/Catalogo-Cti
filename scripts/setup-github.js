#!/usr/bin/env node

/**
 * Script de configuración automática para GitHub - CATALOGO-MTX
 * Inicializa Git, configura el repositorio y prepara para GitHub
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

function createGitignore() {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/
build/

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Backup files
*.backup
backups/

# Test files
test.pdf
`;

  try {
    fs.writeFileSync('.gitignore', gitignoreContent);
    log('✅ Archivo .gitignore creado', 'green');
    return true;
  } catch (error) {
    log(`❌ Error creando .gitignore: ${error.message}`, 'red');
    return false;
  }
}

function createLicense() {
  const licenseContent = `MIT License

Copyright (c) 2024 CATALOGO-MTX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

  try {
    fs.writeFileSync('LICENSE', licenseContent);
    log('✅ Archivo LICENSE creado', 'green');
    return true;
  } catch (error) {
    log(`❌ Error creando LICENSE: ${error.message}`, 'red');
    return false;
  }
}

function createGitHubWorkflow() {
  const workflowDir = '.github/workflows';
  const workflowContent = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Build project
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: \${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        DATA_PROVIDER: supabase
        ADMIN_KEY: \${{ secrets.ADMIN_KEY }}
        NODE_ENV: production
`;

  try {
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
    }
    fs.writeFileSync(path.join(workflowDir, 'ci.yml'), workflowContent);
    log('✅ GitHub Actions workflow creado', 'green');
    return true;
  } catch (error) {
    log(`❌ Error creando workflow: ${error.message}`, 'red');
    return false;
  }
}

function checkGitConfig() {
  try {
    const userName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const userEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    
    if (!userName || !userEmail) {
      log('⚠️  Configuración de Git no encontrada', 'yellow');
      return false;
    }
    
    log(`✅ Git configurado: ${userName} <${userEmail}>`, 'green');
    return true;
  } catch (error) {
    log('❌ Error verificando configuración de Git', 'red');
    return false;
  }
}

function setupGitConfig() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('¿Cuál es tu nombre de usuario de Git? ', (name) => {
      rl.question('¿Cuál es tu email de Git? ', (email) => {
        try {
          execSync(`git config user.name "${name}"`);
          execSync(`git config user.email "${email}"`);
          log(`✅ Git configurado: ${name} <${email}>`, 'green');
          rl.close();
          resolve(true);
        } catch (error) {
          log(`❌ Error configurando Git: ${error.message}`, 'red');
          rl.close();
          resolve(false);
        }
      });
    });
  });
}

function main() {
  log('🐙 CONFIGURACIÓN DE GITHUB - CATALOGO-MTX', 'bright');
  log('=' .repeat(50), 'blue');
  
  // Verificar si ya es un repositorio Git
  const isGitRepo = fs.existsSync('.git');
  if (isGitRepo) {
    log('✅ Repositorio Git ya inicializado', 'green');
  } else {
    log('🔄 Inicializando repositorio Git...', 'yellow');
    if (!execCommand('git init', 'Inicialización de Git')) {
      log('❌ No se pudo inicializar Git', 'red');
      return;
    }
  }
  
  // Verificar configuración de Git
  if (!checkGitConfig()) {
    log('🔧 Configurando Git...', 'yellow');
    // En un entorno automatizado, usar valores por defecto
    execCommand('git config user.name "CATALOGO-MTX"', 'Configuración de nombre');
    execCommand('git config user.email "catalogo-mtx@example.com"', 'Configuración de email');
  }
  
  // Crear archivos necesarios
  log('\n📄 Creando archivos del repositorio...', 'yellow');
  createGitignore();
  createLicense();
  createGitHubWorkflow();
  
  // Agregar archivos al repositorio
  log('\n📦 Preparando archivos para commit...', 'yellow');
  execCommand('git add .', 'Agregar archivos al staging');
  
  // Verificar estado
  const status = execCommand('git status --porcelain', 'Verificar estado');
  if (status && status.trim()) {
    log('📝 Archivos listos para commit:', 'cyan');
    console.log(status);
  }
  
  // Hacer commit inicial
  const commitMessage = `Initial commit: CATALOGO-MTX

- Catálogo mayorista con interfaz de flipbook
- Sistema de pedidos por email
- Panel de administración completo
- Integración con Supabase
- Despliegue en Vercel
- Configuración de GitHub Actions`;

  if (execCommand(`git commit -m "${commitMessage}"`, 'Commit inicial')) {
    log('✅ Commit inicial realizado', 'green');
  }
  
  // Mostrar instrucciones finales
  log('\n🎉 CONFIGURACIÓN COMPLETADA', 'bright');
  log('=' .repeat(50), 'blue');
  log('\n📋 PRÓXIMOS PASOS:', 'yellow');
  log('1. Crear repositorio en GitHub:', 'cyan');
  log('   - Ve a https://github.com/new', 'blue');
  log('   - Nombre: catalogo-mtx', 'blue');
  log('   - Descripción: Catálogo mayorista moderno con flipbook', 'blue');
  log('   - NO inicializar con README, .gitignore o LICENSE', 'blue');
  log('   - Haz clic en "Create repository"', 'blue');
  
  log('\n2. Conectar con GitHub:', 'cyan');
  log('   git remote add origin https://github.com/tu-usuario/catalogo-mtx.git', 'blue');
  log('   git branch -M main', 'blue');
  log('   git push -u origin main', 'blue');
  
  log('\n3. Configurar Vercel:', 'cyan');
  log('   - Ve a https://vercel.com/dashboard', 'blue');
  log('   - Importa el repositorio catalogo-mtx', 'blue');
  log('   - Configura las variables de entorno', 'blue');
  
  log('\n4. Configurar Supabase:', 'cyan');
  log('   - Ve a https://supabase.com/dashboard', 'blue');
  log('   - Crea un nuevo proyecto', 'blue');
  log('   - Ejecuta el script de migración: npm run migrate', 'blue');
  
  log('\n📚 DOCUMENTACIÓN:', 'yellow');
  log('• Guía completa: docs/github-setup.md', 'blue');
  log('• Configuración de proyecto: docs/setup-new-project.md', 'blue');
  log('• Verificación rápida: npm run setup-check', 'blue');
  
  log('\n' + '=' .repeat(50), 'blue');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { 
  createGitignore, 
  createLicense, 
  createGitHubWorkflow, 
  checkGitConfig 
};
