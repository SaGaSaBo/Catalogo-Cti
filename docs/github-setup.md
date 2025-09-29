# 🐙 Configuración de Repositorio GitHub - CATALOGO-MTX

Guía completa para crear y configurar un nuevo repositorio en GitHub para el proyecto CATALOGO-MTX.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Git instalado localmente
- Proyecto CATALOGO-MTX configurado localmente

## 🎯 Paso 1: Crear Repositorio en GitHub

### 1.1 Crear repositorio desde GitHub Web
1. Ve a [github.com](https://github.com)
2. Inicia sesión en tu cuenta
3. Haz clic en **"New repository"** (botón verde)
4. Configura el repositorio:
   - **Repository name**: `catalogo-mtx`
   - **Description**: `Catálogo mayorista moderno con interfaz de flipbook, sistema de pedidos por email y panel de administración completo`
   - **Visibility**: `Public` (recomendado) o `Private`
   - **Initialize repository**: ❌ **NO marcar** (ya tenemos código local)
   - **Add .gitignore**: ❌ **NO marcar** (ya tenemos uno)
   - **Choose a license**: `MIT License` (recomendado)

### 1.2 Obtener URL del repositorio
Después de crear el repositorio, GitHub te mostrará la URL. Anótala:
```
https://github.com/tu-usuario/catalogo-mtx.git
```

## 🔧 Paso 2: Configurar Git Local

### 2.1 Inicializar repositorio local
```bash
# En la carpeta del proyecto
cd /Users/santiagosaralegui/Catalogo-MTX/Catalogo-Cti

# Inicializar Git (si no está inicializado)
git init

# Configurar usuario (si no está configurado globalmente)
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

### 2.2 Crear archivo .gitignore
Asegúrate de que existe un archivo `.gitignore` con este contenido:

```gitignore
# Dependencies
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
```

### 2.3 Agregar archivos al repositorio
```bash
# Agregar todos los archivos
git add .

# Verificar qué archivos se van a commitear
git status

# Hacer el primer commit
git commit -m "Initial commit: CATALOGO-MTX

- Catálogo mayorista con interfaz de flipbook
- Sistema de pedidos por email
- Panel de administración completo
- Integración con Supabase
- Despliegue en Vercel"
```

### 2.4 Conectar con GitHub
```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/tu-usuario/catalogo-mtx.git

# Verificar la conexión
git remote -v

# Cambiar a rama main
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

## 🚀 Paso 3: Configurar Integración con Vercel

### 3.1 Conectar repositorio en Vercel
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona `catalogo-mtx`
5. Configura:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Configurar variables de entorno en Vercel
En la configuración del proyecto en Vercel:
1. Ve a **Settings** → **Environment Variables**
2. Agrega todas las variables necesarias (ver `env.example`)

## 📝 Paso 4: Configurar Archivos del Repositorio

### 4.1 Crear README.md actualizado
El README.md ya está actualizado con el nombre del proyecto.

### 4.2 Crear LICENSE
```bash
# Crear archivo de licencia MIT
touch LICENSE
```

Contenido del LICENSE:
```
MIT License

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
```

### 4.3 Crear .github/workflows (opcional)
```bash
# Crear directorio para GitHub Actions
mkdir -p .github/workflows
```

## 🔄 Paso 5: Configurar GitHub Actions (Opcional)

### 5.1 Crear workflow de CI/CD
Crear `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

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
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        DATA_PROVIDER: supabase
        ADMIN_KEY: ${{ secrets.ADMIN_KEY }}
        NODE_ENV: production
```

## 📊 Paso 6: Configurar Protecciones de Rama

### 6.1 Configurar branch protection
1. Ve a **Settings** → **Branches** en tu repositorio
2. Haz clic en **"Add rule"**
3. Configura:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**

## 🔐 Paso 7: Configurar Secrets de GitHub

### 7.1 Agregar secrets para CI/CD
1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Agrega los siguientes secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_KEY`

## ✅ Paso 8: Verificar Configuración

### 8.1 Verificar repositorio
```bash
# Verificar estado del repositorio
git status

# Verificar ramas
git branch -a

# Verificar remotos
git remote -v
```

### 8.2 Verificar integración con Vercel
1. Haz un pequeño cambio en el código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Test: verificar integración con Vercel"
   git push
   ```
3. Verifica que Vercel detecte el cambio y haga un nuevo deployment

## 🎉 ¡Repositorio Configurado!

Tu repositorio estará disponible en:
- **GitHub**: `https://github.com/tu-usuario/catalogo-mtx`
- **Vercel**: `https://catalogo-mtx.vercel.app` (después de configurar)

### Estructura del repositorio:
```
catalogo-mtx/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
├── components/
├── docs/
├── lib/
├── scripts/
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── vercel.json
```

## 🚨 Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/tu-usuario/catalogo-mtx.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "authentication failed"
```bash
# Configurar token de GitHub
git remote set-url origin https://tu-usuario:tu-token@github.com/tu-usuario/catalogo-mtx.git
```

## 📞 Soporte

Si tienes problemas:
1. Verifica que tengas permisos de escritura en el repositorio
2. Asegúrate de que el token de GitHub sea válido
3. Revisa la documentación de [GitHub](https://docs.github.com) y [Vercel](https://vercel.com/docs)
