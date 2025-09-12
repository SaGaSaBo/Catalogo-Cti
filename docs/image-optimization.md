# 🖼️ Optimización de Imágenes para Supabase

## 📋 Resumen

Este sistema optimiza las imágenes para reducir el egress en Supabase mediante:
- Bucket privado con signed URLs
- Formato AVIF/WebP automático
- Múltiples tamaños responsive
- Caché agresivo en CDN

## 🚀 Configuración

### 1. Variables de Entorno

Agregar a `.env.local` y Vercel:

```bash
# Supabase Storage
SUPABASE_BUCKET=catalogo-imagenes
SUPABASE_SIGNED_URL_EXPIRES=3600
```

### 2. Crear Bucket Privado en Supabase

1. Ir a Supabase Dashboard → Storage
2. Crear bucket `catalogo-imagenes`
3. Configurar como **Private**
4. Configurar RLS policies para `createSignedUrl`

### 3. Subir Imágenes Optimizadas

```bash
# Optimizar imágenes locales
npm run optimize-images

# Subir a Supabase Storage (usar Supabase CLI o Dashboard)
# Estructura recomendada: productos/sku-123/main-800.webp
```

## 🔧 Uso

### SmartImage Component

```tsx
import SmartImage from '@/components/SmartImage';

<SmartImage
  storagePath="productos/sku-123/main-800.webp"
  alt="Producto"
  width={400}
  height={400}
  sizes="(max-width: 768px) 50vw, 25vw"
  placeholderSrc="/placeholder-image.svg"
/>
```

### ProductCard con SmartImage

```tsx
<ProductCard
  storagePath="productos/sku-123/main-800.webp"
  title="Producto"
  brand="Marca"
  price={1000}
  sizes={['S', 'M', 'L']}
/>
```

## 📊 Beneficios

- **Reducción de egress**: 60-80% menos tráfico
- **Mejor rendimiento**: AVIF/WebP + caché
- **Seguridad**: URLs temporales, no hotlinking
- **Responsive**: Múltiples tamaños automáticos

## 🛠️ Scripts Disponibles

```bash
npm run optimize-images  # Optimizar imágenes locales
npm run dev             # Desarrollo
npm run build           # Producción
```

## 📁 Estructura de Archivos

```
scripts/
  optimize-images.ts    # Script de optimización
components/
  SmartImage.tsx        # Componente optimizado
lib/
  supabase.server.ts    # Helper para signed URLs
app/api/storage/
  signed-url/route.ts   # API para firmar URLs
```

## 🔒 Seguridad

- Bucket privado en Supabase
- URLs firmadas con expiración
- RLS policies configuradas
- Prevención de hotlinking

## 📈 Monitoreo

- Revisar métricas de egress en Supabase
- Monitorear caché hit rate
- Verificar tiempos de carga
