export function isAdmin(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const envKey = process.env.ADMIN_KEY || 'altoconcepto_admin_2024';
  
  // Logging temporal para debug en producción
  console.log('🔐 Auth Debug:', {
    hasAuth: !!auth,
    authHeader: auth.substring(0, 20) + '...',
    extractedToken: token,
    envKey: envKey,
    tokenMatches: token === envKey,
    nodeEnv: process.env.NODE_ENV
  });
  
  const result = token && token === envKey;
  console.log('🔐 Auth Result:', result);
  
  return result;
}