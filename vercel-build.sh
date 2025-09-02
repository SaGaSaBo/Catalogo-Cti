#!/bin/bash
# Script de build para Vercel
echo "Starting Vercel build..."

# Instalar dependencias
npm ci

# Build de la aplicación
npm run build

echo "Build completed successfully!"
