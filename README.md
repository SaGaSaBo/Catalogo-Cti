# 🏢 ALTOCONCEPTO Mayorista

**Catálogo mayorista moderno con sistema de autenticación, generación de PDFs y panel de administración completo.**

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- Autenticación por contraseña con middleware
- Protección de rutas automática
- Cookies seguras con httpOnly
- Redirección automática a `/entrar`

### 📱 **Modal de Productos Avanzado**
- Accesibilidad completa (ARIA, focus trap, Esc)
- Scroll lock avanzado sin layout shift
- Optimizado para mobile con scroll natural
- Stepper accesible con navegación por teclado

### 📄 **Generación de PDFs**
- PDFs con `pdf-lib` (compatible con serverless)
- Streaming para mejor rendimiento
- Optimizado para Vercel
- Incluye todos los detalles del producto

### 🗄️ **Base de Datos**
- Integración completa con Supabase
- Gestión de productos y categorías
- Sistema de órdenes persistente
- Panel de administración

### 🎨 **UI/UX**
- Diseño responsive optimizado
- Sistema de diseño ALTOCONCEPTO
- Componentes accesibles
- Optimizado para mobile

## 🚀 Instalación y Configuración

### **1. Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd altoconcepto-mayorista
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus valores:
```bash
# Autenticación
SITE_PASS=contexi

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
```

### **4. Ejecutar en desarrollo**
```bash
npm run dev
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run start        # Producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
npm run clean        # Limpiar build
npm run analyze      # Análisis de bundle
```

## 🏗️ Arquitectura

### **Estructura de Carpetas**
```
├── app/                 # App Router de Next.js
│   ├── api/            # API Routes
│   ├── admin/          # Panel de administración
│   ├── entrar/         # Página de login
│   └── pdf/            # Componentes PDF
├── components/         # Componentes React
│   ├── ui/            # Componentes de UI
│   └── admin-*.tsx    # Componentes de admin
├── lib/               # Utilidades y configuraciones
├── context/           # Contextos React
├── hooks/             # Custom hooks
├── data/              # Datos estáticos
└── tests/             # Tests E2E
```

### **Tecnologías Principales**
- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Base de datos
- **pdf-lib** - Generación de PDFs
- **Playwright** - Testing E2E

## 🔧 Configuración de Producción

### **Vercel**
1. Conectar repositorio en Vercel
2. Configurar variables de entorno:
   - `SITE_PASS=contexi`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático

### **Variables de Entorno Requeridas**
```bash
SITE_PASS=contexi                                    # Contraseña de acceso
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co    # URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                 # Clave anónima
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # Clave de servicio
```

## 🧪 Testing

### **Tests E2E con Playwright**
```bash
npm run test          # Ejecutar tests
npm run test:ui       # Interfaz visual
npm run test:debug    # Modo debug
```

### **Tests Incluidos**
- Modal de productos (scroll lock, accesibilidad)
- Sistema de autenticación
- Generación de PDFs
- Responsive design

## 📱 Características Mobile

### **Optimizaciones Implementadas**
- Modal fullscreen en mobile
- Scroll natural de imágenes
- Touch-friendly steppers
- Optimización de imágenes
- PWA ready

### **Accesibilidad**
- ARIA attributes completos
- Focus trap en modales
- Navegación por teclado
- Screen reader support
- Contraste optimizado

## 🔒 Seguridad

### **Implementado**
- Middleware de autenticación
- Cookies httpOnly
- Headers de seguridad
- Validación de entrada
- Sanitización de datos

### **Headers de Seguridad**
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
X-DNS-Prefetch-Control: on
```

## 📊 Rendimiento

### **Optimizaciones**
- SWC minification
- Image optimization
- Bundle analysis
- Lazy loading
- Code splitting

### **Métricas Objetivo**
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
# Deploy automático desde GitHub
git push origin main
```

### **Variables de Entorno en Vercel**
1. Ir a Project Settings > Environment Variables
2. Agregar todas las variables de `.env.example`
3. Redeploy

## 📞 Soporte

Para soporte técnico o consultas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar documentación de Supabase
- Consultar logs de Vercel

## 📄 Licencia

Proyecto privado - ALTOCONCEPTO Mayorista

---

**Desarrollado con ❤️ para ALTOCONCEPTO Mayorista**