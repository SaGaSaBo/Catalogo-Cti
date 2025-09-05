// app/api/order/pdf/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import OrderNote, { OrderNoteProps } from '@/app/pdf/OrderNote';
import { createOrder } from '@/lib/supabase-orders';

// Forzar el runtime de Node.js y aumentar la duración máxima en Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Normaliza los items del carrito a un formato seguro para el PDF
function normalizeOrderItems(items: any[]) {
  if (!Array.isArray(items)) return [];

  return items.flatMap(item => {
    // Caso 1: Datos optimizados (formato ultra-compacto)
    if (item.p && typeof item.sz === 'string' && typeof item.q === 'number') {
      const product = item.p;
      return [{
        brand: product.b || 'N/A',
        name: product.t || 'Sin Título',
        sku: product.s || 'N/A',
        size: item.sz || 'N/A',
        qty: item.q,
        unitPrice: Number(product.pr) || 0,
        total: (Number(product.pr) || 0) * item.q,
      }];
    }
    // Caso 2: Formato original (fallback)
    if (item.product && typeof item.size === 'string' && typeof item.quantity === 'number') {
      const product = item.product;
      return [{
        brand: product.brand || 'N/A',
        name: product.title || 'Sin Título',
        sku: product.sku || 'N/A',
        size: item.size || 'N/A',
        qty: item.quantity,
        unitPrice: Number(product.price) || 0,
        total: (Number(product.price) || 0) * item.quantity,
      }];
    }
    console.warn('Item con formato no reconocido:', item);
    return [];
  });
}

// Función para limpiar y optimizar los datos del carrito antes de enviarlos
function optimizeCartData(cartData: any) {
  if (!cartData || !cartData.items) return cartData;

  // Crear una copia optimizada sin datos pesados
  const optimizedItems = cartData.items.map((item: any) => {
    if (item.product) {
      // Extraer solo los campos esenciales del producto
      const { id, sku, title, brand, price } = item.product;
      return {
        product: { id, sku, title, brand, price },
        size: item.size,
        quantity: item.quantity
      };
    }
    return item;
  });

  return {
    ...cartData,
    items: optimizedItems
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Iniciando generación de PDF...');
    const rawOrderData = await req.json();
    console.log('📦 Datos recibidos:', JSON.stringify(rawOrderData, null, 2));

    // Validar datos requeridos (formato optimizado)
    if (!rawOrderData.c || !rawOrderData.i) {
      console.error('❌ Datos incompletos:', { c: rawOrderData.c, i: rawOrderData.i });
      return NextResponse.json({ error: 'Datos de la orden incompletos' }, { status: 400 });
    }

    // Los datos ya vienen optimizados, procesar directamente
    console.log('🔄 Normalizando items...');
    const normalizedItems = normalizeOrderItems(rawOrderData.i);
    console.log('✅ Items normalizados:', normalizedItems.length);
    
    const orderId = `ORD-${Date.now()}`;
    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    console.log('💰 Total calculado:', totalAmount);

    // Reconstruir datos para Supabase (formato completo)
    const orderDataForDB = {
      customer: {
        name: rawOrderData.c.n,
        email: rawOrderData.c.e,
        phone: rawOrderData.c.p
      },
      items: rawOrderData.i,
      total: rawOrderData.t
    };

    try {
      // Guardar pedido en Supabase
      const savedOrder = await createOrder(orderDataForDB);
      console.log('✅ Pedido guardado exitosamente:', savedOrder.order_number);
    } catch (dbError) {
      console.error('❌ Error saving order to database:', dbError);
      // No bloqueamos la generación del PDF si la BD falla.
    }

    // Crear el PDF con @react-pdf/renderer
    console.log('📄 Creando PDF con @react-pdf/renderer...');
    
    const pdfProps: OrderNoteProps = {
      orderId: orderId,
      customerName: rawOrderData.c.n,
      customerEmail: rawOrderData.c.e,
      customerPhone: rawOrderData.c.p || '',
      items: normalizedItems.map(item => ({
        sku: item.sku,
        name: item.name,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      currency: 'CLP',
      createdAt: new Date().toISOString(),
    };

    console.log('📊 Props del PDF:', JSON.stringify(pdfProps, null, 2));
    console.log('📊 Generando stream del PDF...');
    
    let stream;
    try {
      // Crear el PDF directamente sin usar el componente OrderNote
      const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      
      const styles = StyleSheet.create({
        page: { padding: 30, fontSize: 10 },
        header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eaeaea', paddingBottom: 10 },
        title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
        customerInfo: { fontSize: 10, color: '#333' },
        table: { display: "flex", width: 'auto', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 },
        tableRow: { flexDirection: 'row', borderBottomColor: '#eaeaea', borderBottomWidth: 1, alignItems: 'center', minHeight: 24 },
        tableHeader: { backgroundColor: '#f2f2f2', fontWeight: 'bold' },
        colSku: { width: '20%', padding: 5 },
        colName: { width: '45%', padding: 5 },
        colQty: { width: '10%', textAlign: 'right', padding: 5 },
        colPrice: { width: '25%', textAlign: 'right', padding: 5 },
        totalSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
        totalText: { fontSize: 12, fontWeight: 'bold' },
      });

      const formatPrice = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value);
      };

      const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-CL', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      };

      const total = pdfProps.items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);

      const pdfDocument = (
        <Document>
          <Page size="A4" style={styles.page} wrap>
            <View style={styles.header}>
              <Text style={styles.title}>Nota de Pedido</Text>
              <Text style={styles.customerInfo}>Pedido: {pdfProps.orderId}</Text>
              <Text style={styles.customerInfo}>Fecha: {formatDate(pdfProps.createdAt)}</Text>
              <Text style={styles.customerInfo}>Cliente: {pdfProps.customerName}</Text>
              {pdfProps.customerEmail && <Text style={styles.customerInfo}>Email: {pdfProps.customerEmail}</Text>}
              {pdfProps.customerPhone && <Text style={styles.customerInfo}>Teléfono: {pdfProps.customerPhone}</Text>}
            </View>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]} fixed>
                <Text style={styles.colSku}>SKU</Text>
                <Text style={styles.colName}>Producto</Text>
                <Text style={styles.colQty}>Cant.</Text>
                <Text style={styles.colPrice}>Total</Text>
              </View>

              {pdfProps.items.map((it, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <Text style={styles.colSku}>{it.sku}</Text>
                  <Text style={styles.colName}>{it.name}</Text>
                  <Text style={styles.colQty}>{it.qty}</Text>
                  <Text style={styles.colPrice}>{formatPrice(it.unitPrice * it.qty)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalText}>
                Total Pedido: {formatPrice(total)}
              </Text>
            </View>
          </Page>
        </Document>
      );

      stream = await renderToStream(pdfDocument);
      console.log('✅ Stream del PDF creado');
    } catch (renderError) {
      console.error('❌ Error en renderToStream:', renderError);
      throw renderError;
    }

    // Retornar el stream como respuesta
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const safeFileName = (rawOrderData.c.n || 'pedido').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    headers.set('Content-Disposition', `attachment; filename="pedido-${safeFileName}.pdf"`);

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Error interno al generar el PDF',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}