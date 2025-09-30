"use client";

import { useState } from 'react';
import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import UiImg from '@/components/UiImg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, Download, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

export function CartModal({ isOpen, onClose, products }: CartModalProps) {
  const { items, setQty, removeItem, clear } = useCart();
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Helper para convertir items del store a formato para render
  const getCartItemsForRender = () => {
    return items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        product: product || { 
          id: item.productId, 
          name: item.name, 
          price: item.price,
          brand: item.brand || '',
          sku: item.sku || ''
        },
        size: item.size,
        quantity: item.qty,
        total: item.price * item.qty
      };
    });
  };
  
  const getTotalAmountForRender = () => {
    return items.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const handleQuantityChange = (productId: string, size: string, newQuantity: number) => {
    const key = `${productId}__${size}`;
    setQty(key, newQuantity);
  };

  const handleRemoveItem = (productId: string, size: string) => {
    const key = `${productId}__${size}`;
    removeItem(key);
    toast.success('Producto eliminado del carrito');
  };

  const handleGeneratePDF = async () => {
    // Validar datos del cliente
    if (!customerData.name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!customerData.email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setIsGeneratingPDF(true);
    
    let orderResult: any = null;
    
    try {
      console.log('🚀 Iniciando proceso de pedido...');
      const cartItems = getCartItemsForRender();
      console.log('🛒 Items en carrito:', cartItems.length);
      
      // Convertir items del carrito a formato esperado por createOrder
      const flattenedItems = cartItems.map(item => ({
        id: item.product.id,
        title: item.product.name,
        brand: item.product.brand || '',
        sku: item.product.sku || '',
        size: item.size || 'Única',
        quantity: item.quantity,
        price: item.product.price,
        total: item.total
      }));
      
      // 1. Primero guardar el pedido en la base de datos
      const orderPayload = {
        customer: {
          name: customerData.name.trim(),
          email: customerData.email.trim(),
          phone: customerData.phone.trim() || ''
        },
        items: flattenedItems,
        total: getTotalAmountForRender()
      };

      console.log('💾 Payload del pedido:', JSON.stringify(orderPayload, null, 2));
      console.log('💾 Guardando pedido en base de datos...');
      
      try {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload)
        });

        console.log('📡 Respuesta del servidor:', orderResponse.status, orderResponse.statusText);

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          console.error('❌ Error del servidor:', errorData);
          throw new Error(errorData.error || 'Error al guardar el pedido');
        }

        orderResult = await orderResponse.json();
        console.log('✅ Pedido guardado:', orderResult.order.order_number);
      } catch (orderError) {
        console.error('❌ Error guardando pedido:', orderError);
        throw orderError; // Re-lanzar el error para que se maneje en el catch principal
      }

      // 2. Luego generar el PDF
      const pdfPayload = {
        c: {
          n: customerData.name?.substring(0, 50) || '',
          e: customerData.email?.substring(0, 50) || '',
          p: customerData.phone?.substring(0, 20) || ''
        },
        i: flattenedItems.map(item => ({
          p: {
            i: item.id,
            s: item.sku?.substring(0, 20) || 'N/A',
            t: item.title?.substring(0, 50) || 'Sin título',
            b: item.brand?.substring(0, 30) || 'N/A',
            pr: Number(item.price) || 0
          },
          sz: item.size?.substring(0, 10) || 'N/A',
          q: item.quantity
        })),
        t: getTotalAmountForRender()
      };

      console.log('📄 Generando PDF...');
      const pdfResponse = await fetch('/api/order/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfPayload)
      });

      if (!pdfResponse.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido-${orderResult.order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Pedido ${orderResult.order.order_number} guardado y PDF descargado`);
      
      // Limpiar carrito después de generar el PDF
      clear();
      setCustomerData({ name: '', email: '', phone: '' });
      onClose();
      
    } catch (error) {
      console.error('❌ Error en proceso de pedido:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const cartItems = getCartItemsForRender();
  const totalAmount = getTotalAmountForRender();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Carrito de Compras</span>
            <Badge variant="secondary">{items.reduce((total, item) => total + item.qty, 0)} productos</Badge>
          </DialogTitle>
          <DialogDescription>
            Revisa tu pedido y completa tus datos para generar la orden
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de productos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Productos seleccionados</h3>
            
            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No hay productos en el carrito</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <Card key={`${item.product.id}-${item.size}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <UiImg
                            src={item.product.imageUrls?.[0] || '/images/placeholder-image.svg'}
                            alt={item.product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            transform={{ width: 64, quality: 60, format: "webp" }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.product.brand} • Talla: {item.size || 'Única'}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {formatPrice(item.product.price)} c/u
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.size || 'Única', item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.size || 'Única', item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id, item.size || 'Única')}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Subtotal: {formatPrice(item.total)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Formulario y resumen */}
          <div className="space-y-6">
            {/* Datos del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumen del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total de productos:</span>
                  <span className="font-medium">{items.reduce((total, item) => total + item.qty, 0)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total a pagar:</span>
                  <span className="text-blue-600">{formatPrice(totalAmount)}</span>
                </div>
                
                <Button
                  onClick={handleGeneratePDF}
                  disabled={cartItems.length === 0 || isGeneratingPDF}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? 'Generando PDF...' : 'Generar Orden PDF'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
