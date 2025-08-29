export async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text().catch(() => '');

  // Si no es ok, intentar parsear JSON de error
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      // Incluir información adicional del error si está disponible
      const errorMessage = j?.error || `Error ${res.status}`;
      const additionalInfo = j?.missing ? ` (Missing: ${j.missing.join(', ')})` : '';
      throw new Error(errorMessage + additionalInfo);
    } catch {
      throw new Error(`Error ${res.status}: ${text.slice(0,120)}…`);
    }
  }

  // Verificar Content-Type JSON
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(
      'La API devolvió una respuesta no válida (no JSON). Detalle: ' +
      text.slice(0,120) + '…'
    );
  }

  return JSON.parse(text);
}