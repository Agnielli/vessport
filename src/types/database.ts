// Tipos TypeScript para la base de datos
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'designer' | 'admin'
          phone: string | null
          address: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'designer' | 'admin'
          phone?: string | null
          address?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'designer' | 'admin'
          phone?: string | null
          address?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          base_price: number
          images: any | null
          sizes: any | null
          colors: any | null
          is_active: boolean
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          base_price?: number
          images?: any | null
          sizes?: any | null
          colors?: any | null
          is_active?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          base_price?: number
          images?: any | null
          sizes?: any | null
          colors?: any | null
          is_active?: boolean
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      designs: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          design_data: any
          preview_url: string | null
          product_id: string | null
          status: 'draft' | 'published' | 'in_progress' | 'free_achieved'
          price: number
          sales_count: number
          target_sales: number
          is_public: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          design_data: any
          preview_url?: string | null
          product_id?: string | null
          status?: 'draft' | 'published' | 'in_progress' | 'free_achieved'
          price?: number
          sales_count?: number
          target_sales?: number
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          design_data?: any
          preview_url?: string | null
          product_id?: string | null
          status?: 'draft' | 'published' | 'in_progress' | 'free_achieved'
          price?: number
          sales_count?: number
          target_sales?: number
          is_public?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      design_sales: {
        Row: {
          id: string
          design_id: string
          order_id: string | null
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          order_id?: string | null
          quantity?: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          order_id?: string | null
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          design_fee: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          shipping_address: any
          billing_address: any | null
          notes: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          design_fee?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          shipping_address: any
          billing_address?: any | null
          notes?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          design_fee?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          shipping_address?: any
          billing_address?: any | null
          notes?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          design_id: string | null
          quantity: number
          size: string
          color: string
          unit_price: number
          design_fee: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          design_id?: string | null
          quantity?: number
          size: string
          color: string
          unit_price: number
          design_fee?: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          design_id?: string | null
          quantity?: number
          size?: string
          color?: string
          unit_price?: number
          design_fee?: number
          total_price?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string | null
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: any | null
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          stripe_payment_intent_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: any | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: any | null
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'designer' | 'admin'
      design_status: 'draft' | 'published' | 'in_progress' | 'free_achieved'
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
    }
  }
}

// Tipos de utilidad
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Design = Database['public']['Tables']['designs']['Row']
export type DesignSale = Database['public']['Tables']['design_sales']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']

// Tipos para el carrito de compras
export interface CartItem {
  id: string
  productId: string
  designId?: string
  name: string
  price: number
  designFee: number
  quantity: number
  size: string
  color: string
  image?: string
  designPreview?: string
  designSalesCount?: number // Para saber si el diseño ya alcanzó las 10 ventas
}

// Tipos para el editor de diseños
export interface DesignElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  data: any // Datos específicos del elemento
}

export interface DesignData {
  elements: DesignElement[]
  canvas: {
    width: number
    height: number
    background: string
  }
  version: string
}