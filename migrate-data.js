const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://iykfzxochppbxdcjtjsf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2Z6eG9jaHBwYnhkY2p0anNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMzc3MzMsImV4cCI6MjA3MTgxMzczM30.uoRTkkyx4aDlvvUcRQNjokqhCRUJGY5WPBkf5fJZSNw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer datos existentes
const productsPath = path.join(__dirname, 'data/products.json');
const categoriesPath = path.join(__dirname, 'data/categories.json');

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración a Supabase...');
    console.log('📊 Proyecto: https://iykfzxochppbxdcjtjsf.supabase.co');

    // Leer datos existentes
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    console.log(`📊 Datos encontrados: ${products.length} productos, ${categories.length} categorías`);

    // Limpiar tablas existentes (opcional)
    console.log('🧹 Limpiando tablas existentes...');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Migrar categorías primero
    console.log('📁 Migrando categorías...');
    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          id: category.id,
          name: category.name,
          description: category.description || '',
          sort_index: category.sortIndex || 1
        }]);

      if (error) {
        console.error(`❌ Error migrando categoría ${category.name}:`, error.message);
      } else {
        console.log(`✅ Categoría migrada: ${category.name}`);
      }
    }

    // Migrar productos
    console.log('📦 Migrando productos...');
    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          id: product.id,
          brand: product.brand,
          title: product.title,
          description: product.description || '',
          sku: product.sku,
          price: product.price,
          sizes: product.sizes,
          image_urls: product.imageUrls,
          active: product.active,
          category_id: product.categoryId,
          sort_index: product.sortIndex || 1
        }]);

      if (error) {
        console.error(`❌ Error migrando producto ${product.title}:`, error.message);
      } else {
        console.log(`✅ Producto migrado: ${product.title}`);
      }
    }

    console.log('🎉 Migración completada exitosamente!');
    console.log('🔗 Ve a tu proyecto en Supabase para verificar los datos');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

migrateData();
