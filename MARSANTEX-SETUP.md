# 🏢 Configuración para "Catalogo ALTOCONCEPTO Mayorista"

## 📋 Pasos Completados

✅ **Rama creada**: `altoconcepto-catalog`  
✅ **package.json actualizado**: Nombre y descripción cambiados a ALTOCONCEPTO  
✅ **README.md actualizado**: Información de ALTOCONCEPTO  
✅ **Archivos de configuración**: Admin keys y contraseñas actualizadas  
✅ **Metadatos actualizados**: Títulos y branding cambiados  
✅ **Página de login**: Branding actualizado  

## 🚀 Próximos Pasos para Deploy

### **1. Crear Nuevo Repositorio**
```bash
# Crear nuevo repositorio en GitHub llamado "catalogo-altoconcepto-mayorista"
# Cambiar el remote
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/catalogo-altoconcepto-mayorista.git
```

### **2. Configurar Nueva Base de Datos Supabase**

1. **Crear nuevo proyecto en Supabase**:
   - Nombre: "ALTOCONCEPTO Catalog"
   - Región: La más cercana a tu ubicación

2. **Ejecutar el schema SQL**:
   ```sql
   -- Usar el archivo scripts/supabase-schema.sql del proyecto original
   ```

3. **Configurar Storage**:
   - Crear bucket `product-images`
   - Configurar políticas RLS

### **3. Variables de Entorno**

Crear `.env.local` con:
```bash
# Autenticación
SITE_PASS=altoconcepto2024

# Supabase (nuevas credenciales)
NEXT_PUBLIC_SUPABASE_URL=tu_nueva_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_nueva_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_nueva_service_role_key

# Admin Key
ADMIN_KEY=altoconcepto_admin_2024

# Supabase Storage
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=product-images

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

### **4. Configurar Vercel**

1. Conectar el nuevo repositorio
2. Configurar variables de entorno:
   - `SITE_PASS=altoconcepto2024`
   - `NEXT_PUBLIC_SUPABASE_URL` (nueva)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (nueva)
   - `SUPABASE_SERVICE_ROLE_KEY` (nueva)
   - `ADMIN_KEY=altoconcepto_admin_2024`
   - `NEXT_PUBLIC_SUPABASE_BUCKET_NAME=product-images`

### **5. Deploy**
```bash
git add .
git commit -m "🏢 Initial setup for ALTOCONCEPTO catalog"
git push origin main
```

## 🎯 URLs Finales

- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://catalogo-altoconcepto-mayorista.vercel.app`
- **Admin**: `https://catalogo-altoconcepto-mayorista.vercel.app/admin?key=altoconcepto_admin_2024`

## 🔐 Credenciales de Acceso

- **Contraseña del sitio**: `altoconcepto2024`
- **Clave de administrador**: `altoconcepto_admin_2024`

## 📊 Migración de Datos (Opcional)

Si quieres migrar productos existentes:

1. **Exportar datos de Supabase original**:
   ```sql
   -- Exportar productos y categorías
   ```

2. **Importar a nueva base de datos**:
   ```sql
   -- Importar datos modificados
   ```

## ✅ Checklist de Configuración

- [x] Crear nueva rama altoconcepto-catalog
- [x] Modificar package.json
- [x] Actualizar README.md
- [x] Modificar archivos de configuración
- [x] Crear archivo .env.example
- [x] Actualizar metadatos y branding
- [ ] Crear nuevo repositorio GitHub
- [ ] Cambiar remote origin
- [ ] Crear nuevo proyecto Supabase
- [ ] Configurar variables de entorno
- [ ] Ejecutar schema SQL
- [ ] Configurar Storage bucket
- [ ] Deploy en Vercel
- [ ] Probar funcionalidad completa

## 🎨 Personalización Adicional

### **Colores y Branding**
Modificar `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Colores de ALTOCONCEPTO
      }
    }
  }
}
```

### **Logo y Assets**
- Reemplazar imágenes en `public/images/`
- Actualizar favicon
- Modificar metadatos en `app/layout.tsx`

---

**¡El proyecto está listo para ser clonado y configurado para ALTOCONCEPTO!** 🚀
