# 🔧 Configuración de Variables de Entorno en Vercel

## Variables Actuales (✅ Correctas)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATA_PROVIDER` | `supabase` | Proveedor de datos |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iykfzxochppbxdcjtjsf.supabase.co` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Clave pública de Supabase |

## Variables Recomendadas (🚀 Agregar)

### 1. Service Role Key
```
SUPABASE_SERVICE_ROLE_KEY = [tu_service_role_key]
```
**¿Dónde obtenerla?**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia la **service_role** key

**¿Para qué?**
- Operaciones administrativas (crear/eliminar pedidos)
- Acceso completo a la base de datos
- Operaciones que requieren permisos elevados

### 2. Debug Mode
```
DEBUG_ORDERS = 1
```
**¿Para qué?**
- Activar logging detallado en desarrollo
- Mejor debugging de errores
- Información adicional en logs de Vercel

### 3. Environment
```
NODE_ENV = production
```
**¿Para qué?**
- Identificar que la app está en producción
- Optimizaciones específicas del entorno

## 📋 Pasos para Configurar en Vercel

### 1. Acceder a Vercel Dashboard
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto "CATALOGO-MTX"

### 2. Ir a Environment Variables
1. Haz clic en **Settings**
2. Selecciona **Environment Variables** en el menú lateral

### 3. Agregar Variables
Haz clic en **Add New** y agrega cada variable:

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [tu_service_role_key_aquí]
Environment: Production, Preview, Development
```

```
Name: DEBUG_ORDERS
Value: 1
Environment: Production, Preview, Development
```

```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

### 4. Verificar Configuración
Después de agregar las variables, haz un nuevo deployment para que se apliquen.

## 🔍 Verificar Configuración

### Opción 1: Script Local
```bash
node scripts/verify-env.js
```

### Opción 2: API de Verificación
Visita: `https://catalogo-mtx.vercel.app/api/_env-check`

### Opción 3: Logs de Vercel
1. Ve a **Functions** en tu dashboard de Vercel
2. Revisa los logs de las funciones API
3. Busca mensajes de debug o errores de configuración

## ⚠️ Consideraciones de Seguridad

### Variables Públicas (NEXT_PUBLIC_*)
- ✅ Visibles en el cliente
- ✅ Seguras para uso público
- ✅ Incluyen: URL y ANON_KEY

### Variables Privadas
- 🔒 Solo visibles en el servidor
- 🔒 Incluyen: SERVICE_ROLE_KEY
- 🔒 Nunca exponer en el cliente

## 🚨 Troubleshooting

### Error: "supabaseKey is required"
- **Causa:** Falta SUPABASE_SERVICE_ROLE_KEY
- **Solución:** Agregar la variable en Vercel

### Error: "Invalid API key"
- **Causa:** Clave incorrecta o expirada
- **Solución:** Verificar en Supabase Dashboard

### Error: "Database connection failed"
- **Causa:** URL incorrecta o proyecto pausado
- **Solución:** Verificar URL y estado del proyecto

## 📞 Soporte

Si tienes problemas:
1. Ejecuta `node scripts/verify-env.js`
2. Revisa los logs de Vercel
3. Verifica la configuración en Supabase Dashboard
