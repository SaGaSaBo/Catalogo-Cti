export type Product = {
  id: string;
  brand: string;
  title: string;
  description?: string | null;
  sku: string;
  price: number;
  sizes: string[];
  imageUrls: string[];
  image_urls?: string[];   // compat con Supabase
  image_paths?: string[];  // compat con Supabase
  active: boolean;
  sortIndex: number;
  sort_index?: number | null;  // compat con Supabase
  categoryId?: string;
  category_id?: string | null;  // compat con Supabase
  category?: Category | null;  // relación con categoría
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type OrderItem = {
  productId: string;
  brand: string;
  title: string;
  sku: string;
  price: number;
  imageUrl?: string;
  quantities: Record<string, number>;
  subtotal: number;
};

export type Buyer = {
  name: string;
  email: string;
  phone?: string;
};

export type OrderPayload = {
  buyer: Buyer;
  items: OrderItem[];
  totalUnits: number;
  totalAmount: number;
  currency?: string;
  source?: { url?: string; userAgent?: string; timestamp?: string };
};

// Legacy types for backward compatibility
export type Order = {
  items: OrderItem[];
  totalUnits: number;
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
};

export type OrderWithBuyer = {
  items: OrderItem[];
  totalUnits: number;
  totalAmount: number;
  buyer: {
    name: string;
    email: string;
    phone?: string;
  };
};