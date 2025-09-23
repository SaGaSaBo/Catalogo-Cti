import { createClient } from "@supabase/supabase-js";
import { Product } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, anon);

export async function getCatalogProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
      category:categories(id, name)
    `)
    .eq("active", true)
    .order("sort_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
      category:categories(id, name)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data as unknown as Product) ?? null;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, brand, title, description, sku, price, sizes, image_urls, active, category_id, sort_index, created_at, updated_at,
      category:categories(id, name)
    `)
    .order("sort_index", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}
