import { NextResponse } from 'next/server';
import { getAllOrders, getOrdersByMonth } from '@/lib/fs-orders';
import { getAllProducts } from '@/lib/fs-products';
import { DashboardStats } from '@/lib/types';

export async function GET() {
  try {
    const orders = getAllOrders();
    const products = getAllProducts();
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Get orders for current and last month
    const currentMonthOrders = getOrdersByMonth(currentYear, currentMonth);
    const lastMonthOrders = getOrdersByMonth(lastMonthYear, lastMonth);
    
    // Calculate sales totals
    const totalSalesCurrentMonth = currentMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalSalesLastMonth = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Calculate order counts
    const totalOrdersCurrentMonth = currentMonthOrders.length;
    const totalOrdersLastMonth = lastMonthOrders.length;
    
    // Calculate top products
    const productStats = new Map<string, { 
      id: string; 
      title: string; 
      brand: string; 
      totalQuantity: number; 
      totalRevenue: number; 
    }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const totalQuantity = Object.values(item.quantities).reduce((sum, qty) => sum + qty, 0);
        
        if (productStats.has(item.productId)) {
          const existing = productStats.get(item.productId)!;
          existing.totalQuantity += totalQuantity;
          existing.totalRevenue += item.subtotal;
        } else {
          productStats.set(item.productId, {
            id: item.productId,
            title: item.title,
            brand: item.brand,
            totalQuantity,
            totalRevenue: item.subtotal
          });
        }
      });
    });
    
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);
    
    // Calculate top customers
    const customerStats = new Map<string, { 
      name: string; 
      email: string; 
      totalOrders: number; 
      totalSpent: number; 
    }>();
    
    orders.forEach(order => {
      const email = order.buyer.email.toLowerCase();
      
      if (customerStats.has(email)) {
        const existing = customerStats.get(email)!;
        existing.totalOrders += 1;
        existing.totalSpent += order.totalAmount;
      } else {
        customerStats.set(email, {
          name: order.buyer.name,
          email: order.buyer.email,
          totalOrders: 1,
          totalSpent: order.totalAmount
        });
      }
    });
    
    const topCustomers = Array.from(customerStats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Calculate monthly sales data (last 12 months)
    const monthlySales = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthOrders = getOrdersByMonth(year, month);
      const monthSales = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      monthlySales.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        sales: monthSales,
        orders: monthOrders.length
      });
    }
    
    const stats: DashboardStats = {
      totalSalesLastMonth,
      totalSalesCurrentMonth,
      totalOrdersLastMonth,
      totalOrdersCurrentMonth,
      topProducts,
      topCustomers,
      monthlySales
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar estadísticas' },
      { status: 500 }
    );
  }
}
