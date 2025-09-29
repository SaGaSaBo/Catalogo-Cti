#!/usr/bin/env node

/**
 * Script de migración para nuevo proyecto CATALOGO-MTX
 * Migra datos de archivos JSON locales a Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('Asegúrate de tener:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Función para leer archivos JSON
function readJsonFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return null;
    }
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

// Función para migrar categorías
async function migrateCategories() {
  console.log('📂 Migrando categorías...');
  
  const categories = readJsonFile('data/categories.json');
  if (!categories || !Array.isArray(categories)) {
    console.log('⚠️  No hay categorías para migrar');
    return;
  }

  try {
    // Limpiar categorías existentes
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  No se pudieron limpiar categorías existentes:', deleteError.message);
    }

    // Insertar nuevas categorías
    const { data, error } = await supabase
      .from('categories')
      .insert(categories.map(cat => ({
        name: cat.name,
        description: cat.description || null,
        sort_index: cat.sort_index || 1
      })))
      .select();

    if (error) {
      console.error('❌ Error migrando categorías:', error.message);
      return false;
    }

    console.log(`✅ ${data.length} categorías migradas exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error inesperado migrando categorías:', error.message);
    return false;
  }
}

// Función para migrar productos
async function migrateProducts() {
  console.log('📦 Migrando productos...');
  
  const products = readJsonFile('data/products.json');
  if (!products || !Array.isArray(products)) {
    console.log('⚠️  No hay productos para migrar');
    return;
  }

  try {
    // Limpiar productos existentes
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  No se pudieron limpiar productos existentes:', deleteError.message);
    }

    // Obtener categorías para mapear IDs
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    const categoryMap = {};
    if (categories) {
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });
    }

    // Insertar productos
    const productsToInsert = products.map(product => ({
      brand: product.brand,
      title: product.title,
      description: product.description || null,
      sku: product.sku,
      price: parseFloat(product.price),
      sizes: product.sizes || [],
      image_urls: product.imageUrls || product.image_urls || [],
      active: product.active !== false, // Default to true
      category_id: product.category ? categoryMap[product.category] : null,
      sort_index: product.sort_index || product.index || 1
    }));

    const { data, error } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();

    if (error) {
      console.error('❌ Error migrando productos:', error.message);
      return false;
    }

    console.log(`✅ ${data.length} productos migrados exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error inesperado migrando productos:', error.message);
    return false;
  }
}

// Función para verificar la conexión
async function verifyConnection() {
  console.log('🔍 Verificando conexión a Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }

    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Función para crear backup
function createBackup() {
  console.log('💾 Creando backup de datos locales...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', timestamp);
  
  try {
    if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
      fs.mkdirSync(path.join(process.cwd(), 'backups'));
    }
    fs.mkdirSync(backupDir);

    // Backup de categorías
    const categories = readJsonFile('data/categories.json');
    if (categories) {
      fs.writeFileSync(
        path.join(backupDir, 'categories.json'),
        JSON.stringify(categories, null, 2)
      );
    }

    // Backup de productos
    const products = readJsonFile('data/products.json');
    if (products) {
      fs.writeFileSync(
        path.join(backupDir, 'products.json'),
        JSON.stringify(products, null, 2)
      );
    }

    console.log(`✅ Backup creado en: ${backupDir}`);
    return true;
  } catch (error) {
    console.error('❌ Error creando backup:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando migración a nuevo proyecto CATALOGO-MTX');
  console.log('=' .repeat(50));

  // Verificar conexión
  const connectionOk = await verifyConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  // Crear backup
  const backupOk = createBackup();
  if (!backupOk) {
    console.log('⚠️  Continuando sin backup...');
  }

  // Migrar categorías
  const categoriesOk = await migrateCategories();
  if (!categoriesOk) {
    console.log('⚠️  Error migrando categorías, continuando...');
  }

  // Migrar productos
  const productsOk = await migrateProducts();
  if (!productsOk) {
    console.log('❌ Error migrando productos');
    process.exit(1);
  }

  console.log('=' .repeat(50));
  console.log('🎉 Migración completada exitosamente!');
  console.log('');
  console.log('Próximos pasos:');
  console.log('1. Verificar datos en Supabase Dashboard');
  console.log('2. Probar la aplicación en Vercel');
  console.log('3. Configurar variables de entorno en producción');
  console.log('4. Eliminar archivos JSON locales si todo funciona correctamente');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { migrateCategories, migrateProducts, verifyConnection };
