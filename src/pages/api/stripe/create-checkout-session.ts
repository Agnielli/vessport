import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items, metadata } = await request.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Importar Stripe dinámicamente
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    // Crear line items para Stripe
    const lineItems = items.map((item: any) => {
      const unitAmount = Math.round(item.price * 100); // Convertir a centavos
      const designFee = item.designId && (item.designSalesCount || 0) < 10 ? 8000 : 0; // €80 en centavos
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.designId ? 
              `Con diseño personalizado ${(item.designSalesCount || 0) >= 10 ? '(gratuito)' : '(€80)'}` : 
              'Producto base',
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
              designId: item.designId || '',
              size: item.size,
              color: item.color,
            },
          },
          unit_amount: unitAmount + designFee,
        },
        quantity: item.quantity,
      };
    });

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${import.meta.env.SITE || 'http://localhost:4321'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.SITE || 'http://localhost:4321'}/#productos`,
      metadata: {
        ...metadata,
        itemCount: items.length.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ['ES', 'FR', 'DE', 'IT', 'PT'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      automatic_tax: {
        enabled: true,
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};