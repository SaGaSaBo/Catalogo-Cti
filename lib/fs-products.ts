import fs from 'fs';
import path from 'path';
import { Product } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function ensureDataDir(): void {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw new Error('Failed to create data directory');
  }
}

export function getAllProducts(): Product[] {
  try {
    ensureDataDir();
    
    if (!fs.existsSync(DATA_FILE)) {
      // Si el archivo no existe, devolver array vacío
      return [];
    }
    
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    
    // Manejar archivo vacío
    if (!data.trim()) {
      return [];
    }
    
    const products = JSON.parse(data);
    
    // Verificar que sea un array
    if (!Array.isArray(products)) {
      console.warn('Products file does not contain an array, returning empty array');
      return [];
    }
    
    return products;
  } catch (error) {
    console.error('Error reading products from file:', error);
    // En caso de error, devolver array vacío en lugar de lanzar
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array');
    }
    
    ensureDataDir();
    
    const data = JSON.stringify(products, null, 2);
    fs.writeFileSync(DATA_FILE, data, 'utf-8');
  } catch (error) {
    console.error('Error writing products to file:', error);
    throw new Error('Failed to save products');
  }
}