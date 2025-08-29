// Sistema de emails deshabilitado
// Este archivo ha sido deshabilitado para simplificar la aplicación

/*
import React from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { env } from './env-validation';

// Componente de email simple
function OrderEmail({ data }: { data: OrderPayload }) {
  const currency = data.currency || '$';
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
      <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Nuevo Pedido Recibido</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          {new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
        </p>
      </div>
      
      <div style={{ padding: '20px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>Información del Cliente</h3>
          <p style={{ margin: '5px 0' }}><strong>Nombre:</strong> {data.buyer.name}</p>
          <p style={{ margin: '5px 0' }}><strong>Email:</strong> {data.buyer.email}</p>
          {data.buyer.phone && (
            <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> {data.buyer.phone}</p>
          )}
        </div>

        <h3 style={{ color: '#1e40af', marginBottom: '15px' }}>Detalle del Pedido</h3>
        
        {data.items.map((item, index) => (
          <div key={index} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px' 
              }}>
                {item.brand}
              </span>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>SKU: {item.sku}</span>
            </div>
            
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{item.title}</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>
              Precio unitario: {currency} {item.price}
            </p>
            
            <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
              <strong>Cantidades por talle:</strong>
              <div style={{ marginTop: '5px' }}>
                {Object.entries(item.quantities)
                  .filter(([_, qty]) => qty > 0)
                  .map(([size, qty]) => (
                    <span key={size} style={{ 
                      display: 'inline-block', 
                      margin: '2px 8px 2px 0',
                      padding: '2px 6px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      Talle {size}: {qty} uds
                    </span>
                  ))}
              </div>
              <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#059669' }}>
                Subtotal: {currency} {item.subtotal.toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>Resumen del Pedido</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span><strong>Total de Unidades:</strong></span>
            <span style={{ fontWeight: 'bold' }}>{data.totalUnits}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px' }}>
            <span><strong>Monto Total:</strong></span>
            <span style={{ fontWeight: 'bold', color: '#059669' }}>
              {currency} {data.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inicializar Resend solo si tenemos la API key
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurado en las variables de entorno');
    }
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOrderEmail(data: OrderPayload) {
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const EMAIL_FROM = env.EMAIL_FROM;
  const ORDER_TO = env.ORDER_TO;

  if (!RESEND_API_KEY || !EMAIL_FROM || !ORDER_TO) {
    console.error('[ORDER] Email configuration missing:', { 
      hasKey: !!RESEND_API_KEY, 
      hasFrom: !!EMAIL_FROM, 
      hasTo: !!ORDER_TO 
    });
    throw new Error('EMAIL_CONFIG_MISSING');
  }

  try {
    const resendClient = getResendClient();

    const html = render(React.createElement(OrderEmail, { data }));

    const res = await resendClient.emails.send({
      from: EMAIL_FROM,
      to: ORDER_TO,
      subject: `Nuevo pedido de ${data.buyer.name} (${data.totalUnits} uds - ${data.currency || '$'}${data.totalAmount})`,
      html,
    });

    if (res.error) {
      throw new Error(`Resend API error: ${res.error.message}`);
    }

    console.log('[ORDER] Email sent successfully:', { id: res.data?.id });
    return { skipped: false, id: res.data?.id };
  } catch (error) {
    console.error('[ORDER] Email send failed:', error);
    throw new Error('EMAIL_SEND_FAILED', { cause: error });
  }
}
*/