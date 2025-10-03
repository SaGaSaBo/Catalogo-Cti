const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getAllOrders() {
  try {
    ensureDataDir();
    
    if (!fs.existsSync(ORDERS_FILE)) {
      console.log('Orders file does not exist, creating empty file:', ORDERS_FILE);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    
    if (!data.trim()) {
      console.log('Orders file is empty, initializing with empty array');
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    
    const orders = JSON.parse(data);
    console.log(`Successfully loaded ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error('Error reading orders from file:', ORDERS_FILE);
    console.error('Full error details:', error);
    
    try {
      console.log('Attempting to recover by creating new empty orders file');
      ensureDataDir();
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    } catch (recoveryError) {
      console.error('Failed to recover orders file:', recoveryError);
      throw new Error(`Cannot read or create orders file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

function saveOrders(orders) {
  try {
    console.log(`Writing ${orders.length} orders to:`, ORDERS_FILE);
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    console.log('Successfully wrote orders to file');
  } catch (error) {
    console.error('Error writing orders to file:', ORDERS_FILE);
    console.error('Full error details:', error);
    throw new Error(`Cannot write orders file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createOrder(orderPayload) {
  const now = new Date().toISOString();
  const order = {
    ...orderPayload,
    id: `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  const orders = getAllOrders();
  orders.push(order);
  saveOrders(orders);
  
  return order;
}

// Script para generar datos de prueba para el dashboard
function generateSampleOrders() {
  const sampleOrders = [
    // Órdenes del mes actual
    {
      buyer: { name: 'Juan Pérez', email: 'juan@email.com', phone: '+56912345678' },
      items: [
        {
          productId: '1',
          brand: 'Florenzi',
          title: 'Camisa Basic Blanca',
          sku: 'FCMAPCL5248BL00S',
          price: 12490,
          quantities: { 'M': 2, 'L': 1 },
          subtotal: 37470
        }
      ],
      totalUnits: 3,
      totalAmount: 37470,
      currency: 'CLP',
      source: { url: 'https://catalogo-cti.vercel.app', timestamp: new Date().toISOString() }
    },
    {
      buyer: { name: 'María González', email: 'maria@email.com' },
      items: [
        {
          productId: '2',
          brand: 'Florenzi',
          title: 'Camisa Basic Azul',
          sku: 'FCMAPCL5248AZ00L',
          price: 12490,
          quantities: { 'S': 1, 'M': 2 },
          subtotal: 37470
        },
        {
          productId: '246bb7c4-501f-445d-9e2e-3b5d0765c9e7',
          brand: 'Florenzi',
          title: 'Camisa Basic Celeste',
          sku: 'FCMAPCL5248CE00L',
          price: 12490,
          quantities: { 'L': 1 },
          subtotal: 12490
        }
      ],
      totalUnits: 4,
      totalAmount: 49960,
      currency: 'CLP',
      source: { url: 'https://catalogo-cti.vercel.app', timestamp: new Date().toISOString() }
    },
    {
      buyer: { name: 'Carlos López', email: 'carlos@email.com', phone: '+56987654321' },
      items: [
        {
          productId: 'db1a221d-ea05-4b8c-a8ad-961158888fce',
          brand: 'Florenzi',
          title: 'CAMISA COTTON BLEND SF052 GRIS',
          sku: 'FCMAPCSF052SU00L',
          price: 14990,
          quantities: { 'L': 2, 'XL': 1 },
          subtotal: 44970
        }
      ],
      totalUnits: 3,
      totalAmount: 44970,
      currency: 'CLP',
      source: { url: 'https://catalogo-cti.vercel.app', timestamp: new Date().toISOString() }
    },
    // Órdenes del mes anterior
    {
      buyer: { name: 'Ana Martínez', email: 'ana@email.com' },
      items: [
        {
          productId: '1',
          brand: 'Florenzi',
          title: 'Camisa Basic Blanca',
          sku: 'FCMAPCL5248BL00S',
          price: 12490,
          quantities: { 'S': 1, 'M': 1 },
          subtotal: 24980
        }
      ],
      totalUnits: 2,
      totalAmount: 24980,
      currency: 'CLP',
      source: { url: 'https://catalogo-cti.vercel.app', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    },
    {
      buyer: { name: 'Roberto Silva', email: 'roberto@email.com' },
      items: [
        {
          productId: '9d036357-0544-4bf0-b5b3-41a4c147dd43',
          brand: 'Florenzi',
          title: 'Camisa Basic Gris',
          sku: 'FCMAPCL6535RG00L',
          price: 12490,
          quantities: { 'M': 3 },
          subtotal: 37470
        },
        {
          productId: 'd12f40c1-9fbf-4eed-9745-2aa93f41a7d3',
          brand: 'Florenzi',
          title: 'Camisa Basic Celeste Raya',
          sku: 'FCMAPCL5248RC00L',
          price: 12490,
          quantities: { 'L': 2 },
          subtotal: 24980
        }
      ],
      totalUnits: 5,
      totalAmount: 62450,
      currency: 'CLP',
      source: { url: 'https://catalogo-cti.vercel.app', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
    }
  ];

  console.log('Generando órdenes de ejemplo...');
  
  sampleOrders.forEach((order, index) => {
    try {
      const savedOrder = createOrder(order);
      console.log(`✓ Orden ${index + 1} creada: ${savedOrder.id}`);
    } catch (error) {
      console.error(`✗ Error creando orden ${index + 1}:`, error);
    }
  });
  
  console.log('¡Datos de ejemplo generados exitosamente!');
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  generateSampleOrders();
}

module.exports = { generateSampleOrders };
