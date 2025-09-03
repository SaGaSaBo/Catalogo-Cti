import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface SupabaseProduct {
  id: string;
  brand: string;
  title: string;
  description: string;
  sku: string;
  price: number;
  sizes: string[];
  image_urls: string[];
  active: boolean;
  category_id?: string;
  sort_index: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  description?: string;
  sort_index: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrder {
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
  pdf_data?: any;
  created_at: string;
  updated_at: string;
}
