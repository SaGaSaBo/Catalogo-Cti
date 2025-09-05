// app/pdf/OrderNote.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fuentes (opcional, pero recomendado para consistencia)
// Font.register({ family: 'Oswald', src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf' });

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
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
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', color: 'grey', fontSize: 8 },
  pageNumber: { position: 'absolute', fontSize: 8, bottom: 15, left: 0, right: 0, textAlign: 'center', color: 'grey' },
});

export type OrderNoteProps = {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: Array<{
    sku: string;
    name: string;
    qty: number;
    unitPrice: number;
  }>;
  currency: string; // e.g. "CLP"
  createdAt: string; // ISO string
};

export default function OrderNote(props: OrderNoteProps) {
  const { orderId, customerName, customerEmail, customerPhone, items, currency, createdAt } = props;
  const total = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nota de Pedido</Text>
          <Text style={styles.customerInfo}>Pedido: {orderId}</Text>
          <Text style={styles.customerInfo}>Fecha: {formatDate(createdAt)}</Text>
          <Text style={styles.customerInfo}>Cliente: {customerName}</Text>
          {customerEmail && <Text style={styles.customerInfo}>Email: {customerEmail}</Text>}
          {customerPhone && <Text style={styles.customerInfo}>Teléfono: {customerPhone}</Text>}
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          {/* Encabezado de la tabla */}
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <Text style={styles.colSku}>SKU</Text>
            <Text style={styles.colName}>Producto</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>Total</Text>
          </View>

          {/* Filas de productos */}
          {items.map((it, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colSku}>{it.sku}</Text>
              <Text style={styles.colName}>{it.name}</Text>
              <Text style={styles.colQty}>{it.qty}</Text>
              <Text style={styles.colPrice}>{formatPrice(it.unitPrice * it.qty)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>
            Total Pedido: {formatPrice(total)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Gracias por su pedido. Puede enviar esta nota a su vendedor de Consorcio Textil Internacional SpA.</Text>
        </View>
        
        {/* Número de página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
}