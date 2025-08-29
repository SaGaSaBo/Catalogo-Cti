import fs from 'fs';
import path from 'path';
import { Product } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

export function ensureDataDir() {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw error;
  }
}

export function readProducts(): Product[] {
  try {
    // Ensure data directory exists
    ensureDataDir();
    
    if (!fs.existsSync(DATA_FILE)) {
      console.log('Products file does not exist, creating empty file:', DATA_FILE);
      // Create empty products file
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    
    console.log('Reading products from:', DATA_FILE);
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    
    // Handle empty file
    if (!data.trim()) {
      console.log('Products file is empty, initializing with empty array');
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    
    const products = JSON.parse(data);
    console.log(`Successfully loaded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('Error reading products from file:', DATA_FILE);
    console.error('Full error details:', error);
    
    // Try to recover by creating a new empty file
    try {
      console.log('Attempting to recover by creating new empty products file');
      ensureDataDir();
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    } catch (recoveryError) {
      console.error('Failed to recover products file:', recoveryError);
      throw new Error(`Cannot read or create products file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function writeProducts(products: Product[]): void {
  try {
    console.log(`Writing ${products.length} products to:`, DATA_FILE);
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    console.log('Successfully wrote products to file');
  } catch (error) {
    console.error('Error writing products to file:', DATA_FILE);
    console.error('Full error details:', error);
    console.error('Products data that failed to write:', JSON.stringify(products, null, 2));
    throw new Error(`Cannot write products file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getActiveProducts(): Product[] {
  try {
    const products = readProducts();
    const activeProducts = products
      .filter(product => product.active)
      .sort((a, b) => a.sortIndex - b.sortIndex);
    console.log(`Returning ${activeProducts.length} active products out of ${products.length} total`);
    return activeProducts;
  } catch (error) {
    console.error('Error getting active products:', error);
    return [];
  }
}