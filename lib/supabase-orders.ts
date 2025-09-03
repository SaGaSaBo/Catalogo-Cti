import { supabase, SupabaseOrder } from './supabase';

// Función para generar número de pedido único
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Crear un nuevo pedido
export async function createOrder(orderData: {
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    title: string;
    brand: string;
    sku: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  total: number;
}, pdfBuffer?: Uint8Array): Promise<SupabaseOrder> {
  const orderNumber = generateOrderNumber();
  
  console.log('🔄 Creando pedido con número:', orderNumber);
  console.log('📊 Items en el pedido:', orderData.items.length);
  console.log('📊 Estructura del primer item:', JSON.stringify(orderData.items[0], null, 2));
  
  // Crear datos mínimos para evitar timeout
  const minimalOrderData = {
    customer: {
      name: orderData.customer.name,
      email: orderData.customer.email,
      phone: orderData.customer.phone || null
    },
    items: orderData.items.map(item => {
      // Manejar diferentes estructuras de datos
      const title = item.title || item.product?.title || 'Sin título';
      const brand = item.brand || item.product?.brand || 'Sin marca';
      const sku = item.sku || item.product?.sku || 'Sin SKU';
      const price = item.price || item.product?.price || 0;
      
      return {
        id: item.id,
        title: title.substring(0, 50), // Título corto
        brand: brand.substring(0, 30), // Marca corta
        sku: sku,
        size: item.size,
        quantity: item.quantity,
        price: price
      };
    }),
    total: orderData.total,
    itemCount: orderData.items.length,
    createdAt: new Date().toISOString()
  };
  
  console.log('📊 Datos mínimos creados, tamaño:', JSON.stringify(minimalOrderData).length, 'caracteres');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer.name,
        customer_email: orderData.customer.email,
        customer_phone: orderData.customer.phone || null,
        status: 'recibido',
        total_amount: orderData.total,
        order_data: minimalOrderData,
        pdf_data: null, // No guardar PDF
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating order:', error);
      throw new Error('Failed to create order');
    }

    console.log('✅ Pedido creado exitosamente:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error en createOrder:', error);
    throw error;
  }
}

// Obtener todos los pedidos
export async function getOrders(): Promise<SupabaseOrder[]> {
  console.log('🔍 Consultando pedidos en Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }

    console.log(`📊 Se encontraron ${data?.length || 0} pedidos en la base de datos`);
    return data || [];
  } catch (error) {
    console.error('❌ Error en getOrders:', error);
    throw error;
  }
}

// Obtener un pedido por ID
export async function getOrder(id: string): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }

  return data;
}

// Actualizar el estado de un pedido
export async function updateOrderStatus(id: string, status: 'recibido' | 'en_proceso' | 'entregado'): Promise<SupabaseOrder> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }

  return data;
}

// Eliminar un pedido
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}
