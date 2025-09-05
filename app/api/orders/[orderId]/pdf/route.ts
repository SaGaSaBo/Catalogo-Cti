// app/api/orders/[orderId]/pdf/route.ts
import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function GET(_req: Request, { params }: { params: { orderId: string } }) {
  try {
    const order = await getOrder(params.orderId);
    const items = Array.isArray(order?.order_data?.items) ? order.order_data.items : [];

    // Importar componentes de @react-pdf/renderer
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

    const total = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 0)), 0);

    const pdfDocument = (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.header}>
            <Text style={styles.title}>Nota de Pedido</Text>
            <Text style={styles.customerInfo}>Pedido: {order.order_number}</Text>
            <Text style={styles.customerInfo}>Fecha: {formatDate(order.created_at)}</Text>
            <Text style={styles.customerInfo}>Cliente: {order.customer_name}</Text>
            <Text style={styles.customerInfo}>Email: {order.customer_email}</Text>
            {order.customer_phone && <Text style={styles.customerInfo}>Teléfono: {order.customer_phone}</Text>}
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              <Text style={styles.colSku}>SKU</Text>
              <Text style={styles.colName}>Producto</Text>
              <Text style={styles.colQty}>Cant.</Text>
              <Text style={styles.colPrice}>Total</Text>
            </View>

            {items.map((it, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.colSku}>{it.sku || 'N/A'}</Text>
                <Text style={styles.colName}>{it.title || 'Sin título'}</Text>
                <Text style={styles.colQty}>{it.quantity || 0}</Text>
                <Text style={styles.colPrice}>{formatPrice(Number(it.price || 0) * Number(it.quantity || 0))}</Text>
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

    const stream = await renderToStream(pdfDocument);

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orden-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 });
  }
}