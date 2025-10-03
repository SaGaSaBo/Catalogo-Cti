import fs from 'fs';
import path from 'path';
import { StoredOrder, OrderPayload } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAllOrders(): StoredOrder[] {
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

export function saveOrders(orders: StoredOrder[]): void {
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

export function createOrder(orderPayload: OrderPayload): StoredOrder {
  const now = new Date().toISOString();
  const order: StoredOrder = {
    ...orderPayload,
    id: generateOrderId(),
    createdAt: now,
    updatedAt: now,
  };
  
  const orders = getAllOrders();
  orders.push(order);
  saveOrders(orders);
  
  return order;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `order_${timestamp}_${random}`;
}

export function getOrdersByDateRange(startDate: Date, endDate: Date): StoredOrder[] {
  const orders = getAllOrders();
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });
}

export function getOrdersByMonth(year: number, month: number): StoredOrder[] {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return getOrdersByDateRange(startDate, endDate);
}
