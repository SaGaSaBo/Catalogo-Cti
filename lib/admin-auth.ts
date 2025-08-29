// lib/admin-auth.ts
export function requireAdmin(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const headerKey = req.headers.get('x-admin-key') || '';
  const url = new URL(req.url);
  const queryKey = url.searchParams.get('key') || '';

  const candidate =
    (auth.startsWith('Bearer ') ? auth.slice(7) : '') ||
    headerKey ||
    queryKey;

  const expected = process.env.ADMIN_KEY || '';
  const ok = !!expected && !!candidate && candidate === expected;

  return { ok, reason: ok ? undefined : 'No autorizado' };
}