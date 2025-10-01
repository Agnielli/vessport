'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { getStripe } from '@/lib/stripe/client'
import { Loader as Loader2, CreditCard, Truck, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotals, clearCart } = useCartStore()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const totals = getTotals()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (items.length === 0) {
      router.push('/')
      return
    }
  }, [user, authLoading, items.length, router])

  const handleCheckout = async () => {
    if (!user || items.length === 0) return

    setLoading(true)
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            designId: item.designId,
            name: item.name,
            price: item.price,
            designFee: item.designFee,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          metadata: {
            userId: user.id,
            itemCount: items.length,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error creating checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }

    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Talla: {item.size} | Color: {item.color} | Cantidad: {item.quantity}
                      </p>
                      {item.designId && (
                        <p className="text-sm text-primary">Con diseño personalizado</p>
                      )}
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        €{(item.price + item.designFee).toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>€{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.designFees > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Tarifas de diseño:</span>
                    <span>€{totals.designFees.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>
                    {totals.shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `€${totals.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (21%):</span>
                  <span>€{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-primary">€{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              {/* Security Features */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pago Seguro</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">Encriptación SSL de 256 bits</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700">Procesado por Stripe</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-700">Envío asegurado</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar €{totals.total.toFixed(2)}</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Al hacer clic en "Pagar", aceptas nuestros términos y condiciones
                </p>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Métodos de pago aceptados:</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      MC
                    </div>
                    <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      AMEX
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">y más...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}