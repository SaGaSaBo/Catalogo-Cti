"use client";

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchJson } from '@/lib/fetchJson';
import { ShoppingCart, Send, Loader2, Download } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CartSummaryProps {
  products: Product[];
}

export function CartSummary({ products }: CartSummaryProps) {
  const { items, clear } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const totalUnits = items.reduce((total, item) => total + item.qty, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      product: product || { id: item.productId, name: item.name, price: item.price },
      size: item.size,
      quantity: item.qty,
      total: item.price * item.qty
    };
  });
  
  // Obtener moneda y mapear a código ISO si es necesario
  const rawCurrency = process.env.NEXT_PUBLIC_CURRENCY || 'CLP';
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR', 
    '£': 'GBP',
    '¥': 'JPY',
    'CLP': 'CLP'
  };
  const currency = currencyMap[rawCurrency] || rawCurrency;
  
  // Generar número de pedido único basado en timestamp
  const generateOrderNumber = () => {
    return `PED-${Date.now().toString().slice(-8)}`;
  };

  const downloadOrderNote = async (orderPayload: any) => {
    try {
      const res = await fetch('/api/order/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) throw new Error('No se pudo generar el PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota-pedido-${orderPayload.orderId ?? 'pedido'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = {
        items: cartItems,
        totalUnits,
        totalAmount,
        buyer: {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim() || undefined
        },
        currency: currency !== 'USD' ? currency : undefined,
        source: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const textResponse = await res.text().catch(() => 'Unknown error');
        data = { ok: false, error: `Server error: ${textResponse.slice(0, 100)}` };
      }

      if (!res.ok || !data?.ok) {
        const errorMessage = data?.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }

      // Mostrar mensaje apropiado según si se envió email o no
      if (data.email?.skipped) {
        toast.success('Pedido registrado (email deshabilitado)');
      } else {
        toast.success('Pedido enviado exitosamente');
      }
      
      // Limpiar formulario y carrito
      clear();
      setCustomerInfo({ name: '', email: '', phone: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`No pudimos enviar el pedido: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrderOld = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = {
        items: cartItems,
        totalUnits,
        totalAmount,
        buyer: {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim() || undefined
        },
        currency: currency !== 'USD' ? currency : undefined,
        source: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      const result = await response.json();
      
      if (!response.ok || !result.ok) {
        const errorMessage = result.error || `Error ${response.status}`;
        throw new Error(errorMessage);
      }

      // Solo mostrar éxito si el servidor confirma que se envió
      if (result.ok) {
        toast.success('Pedido enviado exitosamente');
        clear();
        setCustomerInfo({ name: '', email: '', phone: '' });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el pedido';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convertir cartItems al formato requerido por el PDF
  const pdfItems = cartItems.map(item => ({
    sku: (item.product as any).sku || '',
    name: `${(item.product as any).brand || ''} - ${(item.product as any).name}`,
    size: item.size || 'Única',
    qty: item.quantity,
    price: item.product.price
  }));

  return (
    <>
      {/* Fixed Cart Button - ELIMINADO: se usa CartButton del layout */}
      {/* <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="h-14 px-6 shadow-lg relative">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Ver Carrito</span>
              <span className="sm:hidden">Carrito</span>
              {totalUnits > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalUnits}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md"> */}
            <SheetHeader>
              <SheetTitle>Resumen del Pedido</SheetTitle>
              <SheetDescription>
                Revisa tu pedido y completa tus datos
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Cart Items */}
              {cartItems.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {(item.product as any).brand || ''}
                        </Badge>
                        <span className="text-sm text-gray-500">{(item.product as any).sku || ''}</span>
                      </div>
                      <h4 className="font-medium text-sm">{(item.product as any).name}</h4>
                      <div className="text-xs text-gray-600 mt-1">
                        Talle {item.size || 'Única'}: {item.quantity}
                      </div>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {currency} {item.total.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tu carrito está vacío</p>
                </div>
              )}

              {/* Customer Info Form */}
              {cartItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Información del Cliente</h3>
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                </div>
              )}

              {/* Totals */}
              {cartItems.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Unidades:</span>
                    <span className="font-medium">{totalUnits}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{currency} {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {cartItems.length > 0 && customerInfo.name.trim() && customerInfo.email.trim() && (
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      const orderId = generateOrderNumber();
                      const orderPayload = {
                        orderId,
                        customer: {
                          name: customerInfo.name.trim(),
                          email: customerInfo.email.trim(),
                          phone: customerInfo.phone.trim() || undefined
                        },
                        items: pdfItems,
                        currency: currency,
                        createdAt: new Date().toISOString()
                      };
                      downloadOrderNote(orderPayload);
                    }}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar nota de pedido (PDF)
                  </Button>
                  
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-800">📋 Instrucciones:</span><br />
                    Puede descargar y enviar la nota del pedido a uno de nuestros vendedores en{' '}
                    <strong>Consorcio Textil Internacional SpA</strong>.
                  </p>
                </div>
              )}
              
              {/* Botón de envío por email (deshabilitado) */}
              {cartItems.length > 0 && (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={true}
                  size="lg"
                  className="w-full opacity-50 cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envío por Email (Deshabilitado)
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div> */}

      {/* Mobile Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 sm:hidden z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{totalUnits} productos</p>
            <p className="font-bold">{currency} {totalAmount.toFixed(2)}</p>
          </div>
          <Button onClick={() => setIsOpen(true)} disabled={items.length === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ver Carrito
          </Button>
        </div>
      </div>
    </>
  );
}