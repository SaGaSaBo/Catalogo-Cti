// app/pdf/OrderNote.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11 },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 700 },
  rowHead: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 6, marginTop: 8 },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5 },
  colSku: { width: '20%' },
  colName: { width: '40%' },
  colQty: { width: '15%', textAlign: 'right' },
  colPrice: { width: '25%', textAlign: 'right' },
  small: { fontSize: 10, color: '#555' },
});

export type OrderNoteProps = {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    sku: string;
    name: string;
    qty: number;
    unitPrice: number; // en la moneda del sitio
  }>;
  currency: string; // e.g. "CLP"
  createdAt: string; // ISO string
};

export default function OrderNote(props: OrderNoteProps) {
  const { orderId, customerName, customerEmail, items, currency, createdAt } = props;
  const total = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nota de Pedido</Text>
          <Text style={styles.small}>Pedido: {orderId}</Text>
          <Text style={styles.small}>Fecha: {new Date(createdAt).toLocaleString()}</Text>
          <Text style={styles.small}>Cliente: {customerName}{customerEmail ? ` · ${customerEmail}` : ''}</Text>
          <Text style={[styles.small, { marginTop: 6 }]}>
            Puede descargar y enviar esta nota a su vendedor de Consorcio Textil Internacional SpA.
          </Text>
        </View>

        {/* Tabla encabezado */}
        <View style={styles.rowHead}>
          <Text style={[styles.colSku]}>SKU</Text>
          <Text style={[styles.colName]}>Producto</Text>
          <Text style={[styles.colQty]}>Cant.</Text>
          <Text style={[styles.colPrice]}>Precio</Text>
        </View>

        {/* Una línea por producto */}
        {items.map((it, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.colSku}>{it.sku}</Text>
            <Text style={styles.colName}>{it.name}</Text>
            <Text style={styles.colQty}>{it.qty}</Text>
            <Text style={styles.colPrice}>
              {new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(it.unitPrice * it.qty)}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Text style={{ fontSize: 12, fontWeight: 700 }}>
            Total: {new Intl.NumberFormat('es-CL', { style: 'currency', currency }).format(total)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}