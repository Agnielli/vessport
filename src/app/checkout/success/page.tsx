'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { CircleCheck as CheckCircle, Package, Truck, Mail } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id')
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
      // Clear the cart after successful payment
      clearCart()
    } else {
      // If no session ID, redirect to home
      router.push('/')
    }
  }, [searchParams, clearCart, router])

  if (!sessionId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-lg text-gray-600">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles del Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">ID de Sesión:</span>
                <span className="font-mono text-sm text-gray-900">{sessionId}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Estado:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Procesando
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Fecha:</span>
                <span className="text-gray-900">{new Date().toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">¿Qué sigue?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Confirmación por Email</h4>
                  <p className="text-sm text-gray-600">
                    Recibirás un email de confirmación con todos los detalles de tu pedido.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Preparación del Pedido</h4>
                  <p className="text-sm text-gray-600">
                    Comenzaremos a preparar tu pedido inmediatamente. Los diseños personalizados pueden tomar 3-5 días adicionales.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Envío</h4>
                  <p className="text-sm text-gray-600">
                    Te notificaremos cuando tu pedido sea enviado con información de seguimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/account/orders"
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors"
            >
              Ver Mis Pedidos
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center transition-colors"
            >
              Continuar Comprando
            </Link>
          </div>

          {/* Support */}
          <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">¿Necesitas Ayuda?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
            </p>
            <Link
              href="/contact"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}