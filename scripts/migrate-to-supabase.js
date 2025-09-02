const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer datos existentes
const productsPath = path.join(__dirname, '../data/products.json');
const categoriesPath = path.join(__dirname, '../data/categories.json');

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración a Supabase...');

    // Leer datos existentes
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    console.log(`📊 Datos encontrados: ${products.length} productos, ${categories.length} categorías`);

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
        console.error(`❌ Error migrando categoría ${category.name}:`, error);
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
        console.error(`❌ Error migrando producto ${product.title}:`, error);
      } else {
        console.log(`✅ Producto migrado: ${product.title}`);
      }
    }

    console.log('🎉 Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrateData();
