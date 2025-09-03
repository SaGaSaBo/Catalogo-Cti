"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchJson } from '@/lib/fetchJson';
import { Download, Eye, Trash2, Package, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'recibido' | 'en_proceso' | 'entregado';
  total_amount: number;
  order_data: {
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
  };
  created_at: string;
  updated_at: string;
}

interface AdminOrdersManagerProps {
  onPendingOrdersChange?: (count: number) => void;
  adminKey: string;
}

export function AdminOrdersManager({ adminKey, onPendingOrdersChange }: AdminOrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchJson('/api/orders', {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
        },
      });
      setOrders(data);
      // Notificar al componente padre sobre el número de pedidos pendientes
      if (onPendingOrdersChange) {
        const pendingCount = data.filter((order: any) => order.status === 'recibido').length;
        onPendingOrdersChange(pendingCount);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error cargando pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetchJson(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
      
      toast.success('Estado del pedido actualizado');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error actualizando estado del pedido');
    }
  };

  const handleDownloadPDF = async (orderId: string, orderNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${adminKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error downloading PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `pedido-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error descargando PDF');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return;
    }
    
    try {
      await fetchJson(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminKey}`,
        },
      });
      
      setOrders(orders.filter(order => order.id !== orderId));
      toast.success('Pedido eliminado correctamente');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error eliminando pedido');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recibido':
        return <Package className="h-4 w-4" />;
      case 'en_proceso':
        return <Clock className="h-4 w-4" />;
      case 'entregado':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recibido':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recibido':
        return 'Recibido';
      case 'en_proceso':
        return 'En Proceso';
      case 'entregado':
        return 'Entregado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
        <p className="text-gray-600">Aún no se han recibido pedidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos Recibidos</h2>
        <Badge variant="outline" className="text-sm">
          {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.order_number}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customer_name} • {order.customer_email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </Badge>
                  <span className="text-lg font-bold">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recibido">Recibido</SelectItem>
                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {expandedOrder === order.id ? 'Ocultar' : 'Ver'} Detalles
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(order.id, order.order_number)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteOrder(order.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
              
              {expandedOrder === order.id && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Productos del pedido:</h4>
                  <div className="space-y-2">
                    {order.order_data.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-600">
                            {item.brand} • SKU: {item.sku} • Talla: {item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.customer_phone && (
                    <div className="mt-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm">
                        <strong>Teléfono:</strong> {order.customer_phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
