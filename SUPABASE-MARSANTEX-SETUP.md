# 🔧 Configuración de Supabase para ALTOCONCEPTO

## 📋 Información del Proyecto

- **URL del Proyecto**: `https://ywadtpwkmmtgvvwawdwp.supabase.co`
- **Clave Anónima**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YWR0cHdrbW10Z3Z2d2F3d2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzU3NjEsImV4cCI6MjA3MzExMTc2MX0.OTZJkkqk4gb6Q9LyXuO96MEHmt1sCQB1_eBJPBc-GFM`

## 🚀 Pasos para Configurar Supabase

### **1. Obtener la Clave de Servicio**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto `ywadtpwkmmtgvvwawdwp`
3. Ve a **Settings** → **API**
4. Copia la **service_role** key (no la anon key)
5. Reemplaza `tu_service_role_key_aqui` en `.env.local`

### **2. Configurar Base de Datos**

Ejecuta el schema SQL en tu proyecto de Supabase:

1. Ve a **SQL Editor** en Supabase Dashboard
2. Ejecuta el contenido de `scripts/supabase-schema.sql`
3. Verifica que las tablas se crearon correctamente:
   - `products`
   - `categories`
   - `orders`

### **3. Configurar Storage**

1. Ve a **Storage** en Supabase Dashboard
2. Crea un nuevo bucket llamado `product-images`
3. Configura las políticas RLS:
   ```sql
   -- Política para lectura pública
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'product-images');
   
   -- Política para escritura (solo admin)
   CREATE POLICY "Admin write access" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'product-images');
   
   CREATE POLICY "Admin update access" ON storage.objects
   FOR UPDATE USING (bucket_id = 'product-images');
   
   CREATE POLICY "Admin delete access" ON storage.objects
   FOR DELETE USING (bucket_id = 'product-images');
   ```

### **4. Variables de Entorno Completas**

Crea `.env.local` con:

```bash
# Supabase Configuration - ALTOCONCEPTO
NEXT_PUBLIC_SUPABASE_URL=https://ywadtpwkmmtgvvwawdwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YWR0cHdrbW10Z3Z2d2F3d2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzU3NjEsImV4cCI6MjA3MzExMTc2MX0.OTZJkkqk4gb6Q9LyXuO96MEHmt1sCQB1_eBJPBc-GFM
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_real

# Supabase Storage
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=product-images

# ALTOCONCEPTO Configuration
ADMIN_KEY=altoconcepto_admin_2024
SITE_PASS=altoconcepto2024

# Optional
SUPABASE_SIGNED_URL_EXPIRES=3600
```

### **5. Configurar Vercel**

En Vercel Dashboard, configura estas variables:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://ywadtpwkmmtgvvwawdwp.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YWR0cHdrbW10Z3Z2d2F3d2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzU3NjEsImV4cCI6MjA3MzExMTc2MX0.OTZJkkqk4gb6Q9LyXuO96MEHmt1sCQB1_eBJPBc-GFM`
- `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de servicio real
- `NEXT_PUBLIC_SUPABASE_BUCKET_NAME`: `product-images`
- `ADMIN_KEY`: `altoconcepto_admin_2024`
- `SITE_PASS`: `altoconcepto2024`

## 🧪 Testing

### **Probar Conexión**

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/api/debug/env-check`
3. Verifica que todas las variables estén configuradas

### **Probar Base de Datos**

1. Ve a `http://localhost:3000/api/debug/products-test`
2. Debería mostrar productos de la base de datos

### **Probar Storage**

1. Ve a `http://localhost:3000/api/debug/bucket-test`
2. Debería mostrar información del bucket

## 🔐 URLs de Acceso

- **Catálogo**: `http://localhost:3000` (contraseña: `altoconcepto2024`)
- **Admin**: `http://localhost:3000/admin?key=altoconcepto_admin_2024`
- **Producción**: `https://catalogo-altoconcepto.vercel.app`

## ⚠️ Importante

- **NUNCA** expongas la `SUPABASE_SERVICE_ROLE_KEY` públicamente
- Solo úsala en el servidor/backend
- La clave anónima es segura para el frontend
- Siempre usa HTTPS en producción

---

**¡Configuración lista para ALTOCONCEPTO!** 🚀
