'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string
  productId: string
  designId?: string
  name: string
  price: number
  designFee: number
  size: string
  color: string
  quantity: number
  image?: string
  designPreview?: string
}

export interface CartTotals {
  subtotal: number
  designFees: number
  shipping: number
  tax: number
  total: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed
  getTotals: () => CartTotals
  getItemCount: () => number
  getItem: (productId: string, designId?: string, size?: string, color?: string) => CartItem | undefined
}

const TAX_RATE = 0.21 // 21% IVA
const FREE_SHIPPING_THRESHOLD = 50
const SHIPPING_COST = 5.99

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          item => 
            item.productId === newItem.productId &&
            item.designId === newItem.designId &&
            item.size === newItem.size &&
            item.color === newItem.color
        )

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += newItem.quantity
          set({ items: updatedItems })
          toast.success('Cantidad actualizada en el carrito')
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `${newItem.productId}-${newItem.designId || 'no-design'}-${newItem.size}-${newItem.color}-${Date.now()}`
          }
          set({ items: [...items, cartItem] })
          toast.success('Producto agregado al carrito')
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) })
        toast.success('Producto eliminado del carrito')
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const items = get().items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
        set({ items })
      },

      clearCart: () => {
        set({ items: [] })
        toast.success('Carrito vaciado')
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotals: () => {
        const items = get().items
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const designFees = items.reduce((sum, item) => sum + (item.designFee * item.quantity), 0)
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
        const tax = (subtotal + designFees + shipping) * TAX_RATE
        const total = subtotal + designFees + shipping + tax

        return {
          subtotal: Math.round(subtotal * 100) / 100,
          designFees: Math.round(designFees * 100) / 100,
          shipping: Math.round(shipping * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
        }
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getItem: (productId, designId, size, color) => {
        return get().items.find(
          item => 
            item.productId === productId &&
            item.designId === designId &&
            (!size || item.size === size) &&
            (!color || item.color === color)
        )
      }
    }),
    {
      name: 'ves-sport-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
)