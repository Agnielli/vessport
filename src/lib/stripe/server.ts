import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const createPaymentIntent = async (amount: number, metadata?: any) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export const createCheckoutSession = async (
  items: any[],
  successUrl: string,
  cancelUrl: string,
  metadata?: any
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            description: item.designId ? 'Con diseño personalizado' : 'Producto base',
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
              designId: item.designId || '',
              size: item.size,
              color: item.color,
            },
          },
          unit_amount: Math.round((item.price + item.designFee) * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      shipping_address_collection: {
        allowed_countries: ['ES', 'FR', 'DE', 'IT', 'PT'],
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const retrieveCheckoutSession = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })
    return session
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    throw error
  }
}

export const constructWebhookEvent = (body: string, signature: string) => {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Error constructing webhook event:', error)
    throw error
  }
}

export const refundPayment = async (paymentIntentId: string, amount?: number) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if specified
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}