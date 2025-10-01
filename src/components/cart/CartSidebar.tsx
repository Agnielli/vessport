'use client'

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'
import Image from 'next/image'

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotals,
    getItemCount 
  } = useCartStore()
  
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const totals = getTotals()
  const itemCount = getItemCount()

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">
                Carrito ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600 mb-4">
                  Agrega algunos productos para comenzar
                </p>
                <button
                  onClick={closeCart}
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Talla: {item.size} | Color: {item.color}</p>
                          {item.designId && (
                            <p className="text-primary">Con diseño personalizado</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-primary">
                              €{item.price.toFixed(2)}
                              {item.designFee > 0 && (
                                <span className="text-orange-600 ml-1">
                                  + €{item.designFee.toFixed(2)} diseño
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.designFees > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Tarifas de diseño:</span>
                      <span>€{totals.designFees.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>
                      {totals.shipping === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        `€${totals.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span>€{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span className="text-primary">€{totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {totals.subtotal < 50 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 Agrega €{(50 - totals.subtotal).toFixed(2)} más para envío gratuito
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    {user ? 'Proceder al Pago' : 'Iniciar Sesión para Comprar'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={closeCart}
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Continuar Comprando
                    </button>
                    <button
                      onClick={clearCart}
                      className="flex-1 border border-red-300 hover:bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  )
}