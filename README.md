# Catálogo Mayorista con Flipbook

Un catálogo mayorista moderno con interfaz de flipbook, sistema de pedidos por email y panel de administración completo.

## 🚀 Características

- **Flipbook interactivo**: 2 productos por página en desktop, 1 en mobile
- **Selección de cantidades por talle**: Interface intuitiva para pedidos mayoristas
- **Sistema de pedidos por email**: Envío automático vía SMTP
- **Panel de administración**: Gestión completa de productos con autenticación
- **Backend robusto**: Validación completa, nunca devuelve 500 por datos inválidos
- **Persistencia**: Productos almacenados en `data/products.json`
- **Responsive**: Optimizado para desktop y mobile

## 📋 Requisitos

- Node.js 18+ (recomendado: 18.17.0 o superior)
- Cuenta de email con SMTP (Gmail recomendado)

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Clave de administrador (requerida)
ADMIN_KEY=admin123

# Sistema de emails con Resend (requerido)
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM=onboarding@resend.dev
ORDER_TO=pedidos@tuempresa.com

# Moneda para mostrar precios (opcional, default: USD)
NEXT_PUBLIC_CURRENCY=USD

# Configuración SMTP (OBSOLETO - ya no se usa)
# SMTP_HOST=smtp.tu-proveedor.com
# SMTP_PORT=587
# SMTP_USER=usuario@dominio.com
# SMTP_PASS=tu-contraseña-smtp
```

3. **Configurar Resend:**
   - Crear cuenta gratuita en [Resend](https://resend.com)
   - Obtener API Key desde el dashboard
   - Usar `onboarding@resend.dev` como `RESEND_FROM` (o tu dominio verificado)
   - Configurar `ORDER_TO` con el email donde quieres recibir los pedidos

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── products/          # CRUD de productos
│   │   ├── admin/products/    # Admin endpoints
│   │   └── order/            # Procesamiento de pedidos
│   ├── admin/                # Panel de administración
│   └── page.tsx              # Catálogo principal
├── components/
│   ├── flipbook-catalog.tsx  # Componente flipbook
│   ├── product-card.tsx      # Tarjeta de producto
│   ├── cart-summary.tsx      # Resumen del carrito
│   └── ui/                   # Componentes UI
├── lib/
│   ├── types.ts              # Tipos TypeScript
│   ├── validation.ts         # Validaciones
│   ├── fs-products.ts        # Persistencia de datos
│   ├── email.ts              # Envío de emails
│   └── currency.ts           # Formato de moneda
├── data/
│   └── products.json         # Base de datos de productos
└── hooks/
    └── use-cart.ts           # Hook del carrito
```

## 🔧 Uso

### Probar el sistema de emails
- Acceder a `http://localhost:3000/api/_email-test`
- Si las variables están configuradas, enviará un email de prueba
- Si faltan variables, mostrará qué falta configurar

### Catálogo Principal
- Acceder a `http://localhost:3000`
- Navegar con controles de flipbook
- Seleccionar cantidades por talle
- Enviar pedido con información del cliente

### Panel de Administración
- Acceder a `http://localhost:3000/admin?key=TU_CLAVE_ADMIN`
- Crear, editar y eliminar productos
- Gestionar estado activo/inactivo
- Subir hasta 4 imágenes por producto

## 🔐 API Endpoints

### Productos Públicos
```
GET /api/products              # Listar productos activos
```

### Productos Admin (requiere Authorization: Bearer <ADMIN_KEY>)
```
GET /api/admin/products        # Listar todos los productos
POST /api/products             # Crear producto
PUT /api/products/[id]         # Actualizar producto
DELETE /api/products/[id]      # Eliminar producto
```

### Pedidos
```
POST /api/order                # Enviar pedido
GET /api/_email-test           # Probar configuración de emails
```

## 📧 Formato de Pedidos

El endpoint `/api/order` acepta dos formatos:

**Formato A (buyer):**
```json
{
  "items": [
    {
      "productId": "1",
      "brand": "Guarnieri",
      "title": "Traje Bolonia",
      "sku": "AC-BOL-001",
      "price": 149,
      "imageUrl": "https://...",
      "quantities": {
        "44": 2,
        "46": 1
      },
      "subtotal": 447
    }
  ],
  "totalUnits": 3,
  "totalAmount": 447.00,
  "buyer": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+54 11 1234-5678"
  },
  "currency": "USD",
  "source": {
    "url": "http://localhost:3000",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Formato B (customerInfo - legacy):**
```json
{
  "items": [...],
  "totalUnits": 3,
  "totalAmount": 447.00,
  "customerInfo": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+54 11 1234-5678"
  }
}
```

## ✅ Validaciones

### Productos
- **Marca**: Obligatoria, máximo 80 caracteres
- **Título**: Obligatorio, no vacío
- **SKU**: Obligatorio, único
- **Precio**: Número positivo
- **Talles**: Array no vacío de strings
- **Imágenes**: Máximo 4 URLs
- **Activo**: Boolean
- **Índice**: Número para ordenamiento

### Pedidos
- **Items**: Array no vacío
- **Cantidades**: Números positivos
- **Totales**: Consistentes con items
- **Cliente**: Nombre y email obligatorios
- **Email**: Formato válido

### Respuestas de Error
- **400**: Datos inválidos (validación fallida)
- **401**: No autorizado (falta auth)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor (solo para errores no previstos)

## 🔧 Configuración Avanzada

### Cambiar dominio de envío (Resend)
1. Verificar tu dominio en el dashboard de Resend
2. Cambiar `RESEND_FROM=pedidos@tudominio.com` en `.env`
3. Reiniciar el servidor de desarrollo

### Cambiar productos por página
Modificar `productsPerPage` en `components/flipbook-catalog.tsx`:
```typescript
const productsPerPage = isMobile ? 1 : 2; // Cambiar valores aquí
```

### Personalizar emails
Editar templates en `lib/email.ts`

### Modificar validaciones
Actualizar schemas en `lib/validation.ts`

### Sistema de emails
- **Resend (actual)**: Configurar `RESEND_API_KEY`, `RESEND_FROM` y `ORDER_TO`
- **SMTP (obsoleto)**: El código anterior con Nodemailer está comentado en `app/api/order/route.ts`

## 📝 Notas Importantes

### Persistencia de Datos
- Los productos se almacenan en `data/products.json`
- El archivo se crea automáticamente si no existe
- Backup recomendado antes de cambios importantes

### Acceso de Administrador
- URL: `/admin?key=TU_CLAVE_ADMIN`
- La clave debe coincidir con `ADMIN_KEY` en `.env.local`
- Sin clave válida, acceso denegado

### Logs y Debugging
- Errores del servidor se logean en la consola
- Para debugging, revisar:
  ```bash
  # En desarrollo
  npm run dev
  # Revisar consola del terminal
  
  # En producción
  npm start
  # Revisar logs del servidor
  ```

### Configuración SMTP
- **Gmail**: Usar contraseña de aplicación, no contraseña personal
- **Otros proveedores**: Verificar configuración SMTP específica
- **Testing**: Verificar que `ORDER_TO` sea un email válido

## 🐛 Troubleshooting

**Error de autenticación:**
- Verificar que `ADMIN_KEY` esté configurado en `.env.local`
- Usar la URL correcta: `/admin?key=TU_CLAVE`

**Error de email:**
- Verificar configuración de Resend en `.env`
- Probar con `/api/_email-test` para diagnosticar
- Verificar que `RESEND_API_KEY`, `RESEND_FROM` y `ORDER_TO` estén configurados
- Para dominios personalizados, verificar el dominio en Resend primero

**Productos no aparecen:**
- Verificar que `data/products.json` exista
- Verificar que productos tengan `active: true`
- Revisar logs del servidor para errores

**Error 400 vs 500:**
- **400**: Datos inválidos enviados por el cliente
- **500**: Error interno del servidor (revisar logs)

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.