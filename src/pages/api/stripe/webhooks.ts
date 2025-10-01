import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Importar Stripe dinámicamente
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Verificar webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Generar número de pedido único
        const orderNumber = `VES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Crear pedido en la base de datos
        const orderData = {
          order_number: orderNumber,
          status: 'processing',
          total_amount: session.amount_total / 100, // Convertir de centavos
          stripe_payment_intent_id: session.payment_intent,
          shipping_address: session.shipping_details?.address || {},
          billing_address: session.customer_details?.address || {},
          customer_email: session.customer_details?.email,
          customer_phone: session.customer_details?.phone,
          metadata: session.metadata,
        };

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        // Registrar pago
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: order.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total / 100,
            currency: 'eur',
            status: 'completed',
            payment_method: session.payment_method_types[0],
            metadata: session.metadata,
          });

        if (paymentError) {
          console.error('Error recording payment:', paymentError);
        }

        console.log('Order created successfully:', order.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        
        // Actualizar estado del pago
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (paymentError) {
          console.error('Error updating payment status:', paymentError);
        }

        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        
        // Actualizar estado del pago
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (paymentError) {
          console.error('Error updating payment status:', paymentError);
        }

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Webhook handler failed' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};