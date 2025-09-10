# 🚀 Configuración de Nuevo Proyecto CATALOGO-MTX

Guía completa para configurar un nuevo proyecto en Vercel y Supabase para el catálogo mayorista.

## 📋 Prerrequisitos

- Cuenta de GitHub
- Cuenta de Vercel (gratuita)
- Cuenta de Supabase (gratuita)
- Node.js 18+ instalado localmente
- Git instalado localmente

## 🎯 Paso 1: Configurar Repositorio en GitHub

### 1.1 Configuración automática con script
```bash
# Ejecutar script de configuración de GitHub
npm run setup-github
```

### 1.2 Configuración manual
```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: CATALOGO-MTX"
git branch -M main
git remote add origin https://github.com/tu-usuario/catalogo-mtx.git
git push -u origin main
```

### 1.3 Crear repositorio en GitHub
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `catalogo-mtx`
3. Descripción: `Catálogo mayorista moderno con flipbook`
4. **NO** inicializar con README, .gitignore o LICENSE
5. Haz clic en "Create repository"

### 1.4 Verificar estructura del proyecto
Asegúrate de que estos archivos estén presentes:
- `package.json` (con nombre "catalogo-mtx")
- `next.config.js`
- `vercel.json`
- `lib/supabase.ts`
- `scripts/supabase-schema.sql`

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear nuevo proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"New Project"**
4. Configura:
   - **Name**: `catalogo-mtx`
   - **Database Password**: Genera una contraseña segura
   - **Region**: Selecciona la más cercana a tu ubicación
   - **Pricing Plan**: Free (suficiente para empezar)

### 2.2 Configurar la base de datos
1. Ve a **SQL Editor** en el dashboard de Supabase
2. Ejecuta el script de esquema:

```sql
-- Ejecutar el contenido de scripts/supabase-schema.sql
-- (Se proporcionará el script completo)
```

### 2.3 Obtener credenciales
1. Ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 Paso 3: Configurar Vercel

### 3.1 Conectar repositorio
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta de GitHub
3. Haz clic en **"New Project"**
4. Selecciona el repositorio `catalogo-mtx`
5. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Configurar variables de entorno
En la configuración del proyecto en Vercel, ve a **Settings** → **Environment Variables** y agrega:

#### Variables de Supabase
```
NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Variables del sistema
```
DATA_PROVIDER = supabase
NODE_ENV = production
DEBUG_ORDERS = 1
```

#### Variables de autenticación
```
ADMIN_KEY = tu_clave_admin_segura
```

#### Variables de email (opcional)
```
RESEND_API_KEY = tu_api_key_de_resend
RESEND_FROM = onboarding@resend.dev
ORDER_TO = pedidos@tuempresa.com
NEXT_PUBLIC_CURRENCY = USD
```

### 3.3 Desplegar
1. Haz clic en **"Deploy"**
2. Espera a que se complete el despliegue
3. Anota la URL del proyecto: `https://catalogo-mtx.vercel.app`

## 🔧 Paso 4: Configurar el proyecto local

### 4.1 Crear archivo de variables de entorno
Crea `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sistema
DATA_PROVIDER=supabase
NODE_ENV=development
DEBUG_ORDERS=1

# Autenticación
ADMIN_KEY=tu_clave_admin_segura

# Email (opcional)
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM=onboarding@resend.dev
ORDER_TO=pedidos@tuempresa.com
NEXT_PUBLIC_CURRENCY=USD
```

### 4.2 Instalar dependencias y probar
```bash
npm install
npm run dev
```

## 📊 Paso 5: Migrar datos existentes (si aplica)

Si tienes datos en `data/products.json` y `data/categories.json`, ejecuta:

```bash
node scripts/migrate-to-supabase.js
```

## ✅ Paso 6: Verificar configuración

### 6.1 Verificar Supabase
1. Ve a `https://tu-proyecto.vercel.app/api/_env-check`
2. Debe mostrar todas las variables configuradas correctamente

### 6.2 Verificar funcionalidad
1. **Catálogo**: `https://tu-proyecto.vercel.app`
2. **Admin**: `https://tu-proyecto.vercel.app/admin?key=tu_clave_admin`
3. **API de productos**: `https://tu-proyecto.vercel.app/api/products`

## 🔐 Paso 7: Configuración de seguridad

### 7.1 Configurar RLS en Supabase
1. Ve a **Authentication** → **Policies**
2. Configura políticas de Row Level Security para las tablas
3. Asegúrate de que solo usuarios autenticados puedan modificar datos

### 7.2 Configurar CORS
1. En Supabase, ve a **Settings** → **API**
2. Configura los dominios permitidos:
   - `https://tu-proyecto.vercel.app`
   - `http://localhost:3000` (para desarrollo)

## 📱 Paso 8: Configuración de dominio personalizado (opcional)

### 8.1 En Vercel
1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### 8.2 En Supabase
1. Actualiza la configuración de CORS con el nuevo dominio
2. Actualiza las variables de entorno en Vercel

## 🚨 Troubleshooting

### Error: "supabaseKey is required"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Asegúrate de que la clave sea correcta

### Error: "Invalid API key"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea correcta
- Asegúrate de que el proyecto de Supabase esté activo

### Error: "Database connection failed"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` sea correcta
- Asegúrate de que el proyecto de Supabase no esté pausado

### Error 404 en rutas
- Verifica que el build se haya completado correctamente
- Revisa los logs de Vercel para errores de compilación

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Vercel en el dashboard
2. Verifica la configuración de Supabase
3. Ejecuta `node scripts/verify-env.js` localmente
4. Revisa la documentación de [Next.js](https://nextjs.org/docs) y [Supabase](https://supabase.com/docs)

## 🎉 ¡Listo!

Tu proyecto CATALOGO-MTX estará funcionando en:
- **Producción**: `https://tu-proyecto.vercel.app`
- **Base de datos**: Supabase Cloud
- **Repositorio**: GitHub
- **Despliegues automáticos**: Cada push a main

### Próximos pasos recomendados:
1. Configurar un dominio personalizado
2. Implementar analytics
3. Configurar monitoreo de errores
4. Optimizar imágenes con Vercel Image Optimization
5. Configurar backup automático de la base de datos
