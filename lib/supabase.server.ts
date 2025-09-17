import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

export async function getSignedImageUrl(path: string, expiresSeconds = Number(process.env.SUPABASE_SIGNED_URL_EXPIRES || 3600)) {
  const bucket = process.env.SUPABASE_BUCKET!;
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresSeconds, { download: false });
  if (error) throw error;
  return data.signedUrl;
}