import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Iniciando prueba de PDF...');
    
    // Importar componentes de @react-pdf/renderer
    const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    
    const styles = StyleSheet.create({
      page: { 
        padding: 30, 
        fontSize: 10,
        fontFamily: 'Helvetica' // Especificar fuente explícitamente
      },
      header: { 
        marginBottom: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eaeaea', 
        paddingBottom: 10 
      },
      title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 8 
      },
      customerInfo: { 
        fontSize: 10, 
        color: '#333' 
      },
      table: { 
        display: "flex", 
        width: 'auto', 
        borderStyle: 'solid', 
        borderWidth: 0, 
        borderRightWidth: 0, 
        borderBottomWidth: 0 
      },
      tableRow: { 
        flexDirection: 'row', 
        borderBottomColor: '#eaeaea', 
        borderBottomWidth: 1, 
        alignItems: 'center', 
        minHeight: 24 
      },
      tableHeader: { 
        backgroundColor: '#f2f2f2', 
        fontWeight: 'bold' 
      },
      colSku: { width: '20%', padding: 5 },
      colName: { width: '45%', padding: 5 },
      colQty: { width: '10%', textAlign: 'right', padding: 5 },
      colPrice: { width: '25%', textAlign: 'right', padding: 5 },
      totalSection: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        marginTop: 20 
      },
      totalText: { 
        fontSize: 12, 
        fontWeight: 'bold' 
      },
    });

    const formatPrice = (value: number) => {
      return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP', 
        minimumFractionDigits: 0 
      }).format(value);
    };

    const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleString('es-CL', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    };

    // Datos de prueba
    const testItems = [
      {
        sku: 'TEST-001',
        name: 'Producto de Prueba',
        qty: 2,
        unitPrice: 10000,
      }
    ];

    const total = testItems.reduce((acc, it) => acc + (it.unitPrice * it.qty), 0);

    const pdfDocument = (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.header}>
            <Text style={styles.title}>Nota de Pedido - PRUEBA</Text>
            <Text style={styles.customerInfo}>Pedido: TEST-123</Text>
            <Text style={styles.customerInfo}>Fecha: {formatDate(new Date().toISOString())}</Text>
            <Text style={styles.customerInfo}>Cliente: Cliente de Prueba</Text>
            <Text style={styles.customerInfo}>Email: test@example.com</Text>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              <Text style={styles.colSku}>SKU</Text>
              <Text style={styles.colName}>Producto</Text>
              <Text style={styles.colQty}>Cant.</Text>
              <Text style={styles.colPrice}>Total</Text>
            </View>

            {testItems.map((it, i) => (
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

    console.log('📄 Creando PDF de prueba...');
    const stream = await renderToStream(pdfDocument);
    console.log('✅ PDF de prueba creado exitosamente');

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-pdf.pdf"',
      },
    });

  } catch (error) {
    console.error('❌ Error en prueba de PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Error en prueba de PDF',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
