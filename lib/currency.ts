export function formatCurrency(amount: number): string {
  return formatCurrencyWithCode(amount, process.env.NEXT_PUBLIC_CURRENCY || 'CLP');
}

export function formatCurrencyWithCode(amount: number, currencyCode: string): string {
  // Mapear símbolos a códigos ISO
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP', 
    '¥': 'JPY',
    'CLP': 'CLP'
  };
  
  const currency = currencyMap[currencyCode] || currencyCode;
  
  // Configurar opciones según la moneda
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency
  };
  
  // CLP no usa decimales
  if (currency === 'CLP') {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }
  
  try {
    // Usar locale chileno para CLP, español general para otros
    const locale = currency === 'CLP' ? 'es-CL' : 'es-ES';
    return new Intl.NumberFormat(locale, options).format(amount);
  } catch (error) {
    // Fallback si el código de moneda no es válido
    const symbol = currencyCode.length === 1 ? currencyCode : '$';
    const decimals = currency === 'CLP' ? 0 : 2;
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}