export function isAdmin(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123';
  return token && token === envKey;
}