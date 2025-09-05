'use client';
import { useState } from 'react';

export default function DownloadOrderPdfButton({ orderId }: { orderId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`/api/orders/${orderId}/pdf`);
      if (!res.ok) throw new Error('Error al generar el PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('No se pudo descargar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
    >
      {downloading ? 'Preparando PDF…' : 'Descargar PDF'}
    </button>
  );
}
