import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    const event = constructWebhookEvent(body, signature)
    const supabase = createClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        // Create order in database
        const orderData = {
          user_id: session.metadata.userId,
          order_number: `VES-${Date.now()}`,
          status: 'processing',
          total_amount: session.amount_total / 100, // Convert from cents
          stripe_payment_intent_id: session.payment_intent,
          shipping_address: session.shipping_details?.address || {},
          billing_address: session.customer_details?.address || {},
        }

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()

        if (orderError) {
          console.error('Error creating order:', orderError)
          throw orderError
        }

        // Create order items (you'll need to store line items in session metadata)
        // This is a simplified version - in production, you'd store cart items in session metadata
        
        // Update design sales count if applicable
        // This would be implemented based on your specific business logic

        console.log('Order created successfully:', order.id)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        
        // Update payment status
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            stripe_payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'completed',
            payment_method: paymentIntent.payment_method,
          })

        if (paymentError) {
          console.error('Error recording payment:', paymentError)
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        
        // Update payment status
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (paymentError) {
          console.error('Error updating payment status:', paymentError)
        }

        console.log('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 400 }
    )
  }
}