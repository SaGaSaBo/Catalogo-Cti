// lib/download-pdf.ts
export async function downloadPdf(orderPayload: any) {
  const res = await fetch('/api/order/pdf', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo generar el PDF');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pedido.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
