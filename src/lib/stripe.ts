// Configuración y utilidades para Stripe
import type { CartItem } from '../types/database'

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key not found. Payment functionality will be limited.')
}

// Función para cargar Stripe
export const loadStripe = async () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe publishable key not configured')
  }

  // Cargar Stripe dinámicamente
  const { loadStripe: stripeLoader } = await import('@stripe/stripe-js')
  return await stripeLoader(STRIPE_PUBLISHABLE_KEY)
}

// Función para crear sesión de checkout
export const createCheckoutSession = async (items: CartItem[], metadata?: any) => {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        metadata,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cart`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Función para redirigir a Stripe Checkout
export const redirectToCheckout = async (items: CartItem[], metadata?: any) => {
  try {
    const stripe = await loadStripe()
    if (!stripe) {
      throw new Error('Failed to load Stripe')
    }

    const sessionId = await createCheckoutSession(items, metadata)
    
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

// Función para calcular el total del carrito
export const calculateCartTotal = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const designFees = items.reduce((sum, item) => sum + item.design_fee, 0)
  const shipping = subtotal > 50 ? 0 : 5.99 // Envío gratis por encima de 50€
  const tax = (subtotal + designFees + shipping) * 0.21 // IVA 21%
  const total = subtotal + designFees + shipping + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    designFees: Math.round(designFees * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// Función para formatear precio
export const formatPrice = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Función para validar datos de tarjeta (básica)
export const validateCardData = (cardData: {
  number: string
  expiry: string
  cvc: string
  name: string
}) => {
  const errors: string[] = []

  // Validar número de tarjeta (básico)
  if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
    errors.push('Número de tarjeta inválido')
  }

  // Validar fecha de expiración
  if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
    errors.push('Fecha de expiración inválida (MM/YY)')
  }

  // Validar CVC
  if (!cardData.cvc || cardData.cvc.length < 3) {
    errors.push('CVC inválido')
  }

  // Validar nombre
  if (!cardData.name || cardData.name.trim().length < 2) {
    errors.push('Nombre del titular requerido')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}