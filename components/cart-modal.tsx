"use client";

import { useState } from 'react';
import { useCartContext } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
  const { cart, updateQuantity, getQuantity, getTotalUnits, clearCart } = useCartContext();
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

  const getCartItems = () => {
    const items: any[] = [];
    
    Object.entries(cart).forEach(([productId, sizes]) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        Object.entries(sizes).forEach(([size, quantity]) => {
          if (quantity > 0) {
            items.push({
              product,
              size,
              quantity,
              total: product.price * quantity
            });
          }
        });
      }
    });
    
    return items;
  };

  const getTotalAmount = () => {
    return getCartItems().reduce((total, item) => total + item.total, 0);
  };

  const handleQuantityChange = (productId: string, size: string, newQuantity: number) => {
    updateQuantity(productId, size, newQuantity);
  };

  const handleRemoveItem = (productId: string, size: string) => {
    updateQuantity(productId, size, 0);
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
    
    try {
      const orderData = {
        customer: customerData,
        items: getCartItems(),
        total: getTotalAmount(),
        date: new Date().toISOString()
      };

      const response = await fetch('/api/order/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden-${customerData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF generado y descargado correctamente');
      
      // Limpiar carrito después de generar el PDF
      clearCart();
      setCustomerData({ name: '', email: '', phone: '' });
      onClose();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const cartItems = getCartItems();
  const totalAmount = getTotalAmount();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Carrito de Compras</span>
            <Badge variant="secondary">{getTotalUnits()} productos</Badge>
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
                          <img
                            src={item.product.imageUrls?.[0] || '/images/placeholder-image.svg'}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.product.brand} • Talla: {item.size}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {formatPrice(item.product.price)} c/u
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product.id, item.size, item.quantity - 1)}
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
                            onClick={() => handleQuantityChange(item.product.id, item.size, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id, item.size)}
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
                  <span className="font-medium">{getTotalUnits()}</span>
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
