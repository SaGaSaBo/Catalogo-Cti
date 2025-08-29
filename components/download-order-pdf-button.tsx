'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

type Item = {
  sku: string
  name: string
  color?: string
  size: string
  quantity: number
  unitPrice: number
}

type Customer = { 
  name: string
  email: string
  phone?: string
  taxId?: string
  address?: string
}

export function DownloadOrderPdfButton({
  items,
  customer,
  orderNumber,
  currency = '$',
  discount = 0,
  taxRate = 0,
  notes = '',
}: {
  items: Item[]
  customer: Customer
  orderNumber?: string
  currency?: string
  discount?: number
  taxRate?: number
  notes?: string
}) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/order/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          date: new Date().toLocaleDateString('es-CL'),
          customer,
          items,
          currency,
          discount,
          taxRate,
          notes,
        }),
      })
      
      if (!res.ok) throw new Error('No se pudo generar el PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nota-pedido-${orderNumber || 'sin-numero'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Ocurrió un error al generar el PDF')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownload}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            📄 Descargar Nota de Pedido (PDF)
          </>
        )}
      </Button>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="font-medium text-blue-800 mb-1">📋 Instrucciones:</p>
        <p>
          Puedes descargar y enviar esta nota de pedido a un vendedor de{' '}
          <strong>Consorcio Textil Internacional SpA</strong> para procesar tu orden.
        </p>
      </div>
    </div>
  )
}