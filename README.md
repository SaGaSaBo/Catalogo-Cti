# 🛍️ Catálogo CTI - Catálogo Mayorista Interactivo

Un catálogo digital interactivo para empresas mayoristas, construido con Next.js y React.

## ✨ Características

- **Catálogo interactivo** con flipbook
- **Sistema de carrito** para seleccionar productos
- **Generación de PDF** de pedidos
- **Panel de administración** para gestionar productos y categorías
- **Interfaz responsive** para desktop y mobile
- **Sistema de filtros** por categorías

## 🚀 Tecnologías

- **Frontend:** Next.js 13, React, TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **PDF Generation:** @react-pdf/renderer
- **State Management:** React Context

## 📦 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/catalogo-cti.git
cd catalogo-cti
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

## 🌐 Despliegue

Este proyecto está optimizado para desplegarse en [Vercel](https://vercel.com).

## 📱 Uso

- **Catálogo principal:** `/`
- **Panel de administración:** `/admin?key=tu-clave`

## 📄 Licencia

MIT