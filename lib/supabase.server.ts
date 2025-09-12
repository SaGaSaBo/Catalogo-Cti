import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export async function getSignedImageUrl(path: string, expiresSeconds?: number) {
  const bucket = process.env.SUPABASE_BUCKET || 'catalogo-imagenes';
  const expiresIn = Number(process.env.SUPABASE_SIGNED_URL_EXPIRES || expiresSeconds || 3600);

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn, { download: false });

  if (error) throw error;
  return data.signedUrl;
}
