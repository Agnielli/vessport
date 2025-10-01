import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Funciones de utilidad para autenticación
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Funciones de utilidad para perfiles
export const profiles = {
  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  update: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  create: async (profile: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }
}

// Funciones de utilidad para productos
export const products = {
  getAll: async (filters?: { category?: string; active?: boolean }) => {
    let query = supabase.from('products').select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)

    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .single()
    return { data, error }
  }
}

// Funciones de utilidad para categorías
export const categories = {
  getAll: async (activeOnly = true) => {
    let query = supabase.from('categories').select('*')
    
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('name')
    return { data, error }
  }
}

// Funciones de utilidad para diseños
export const designs = {
  getAll: async (filters?: { 
    userId?: string; 
    public?: boolean; 
    status?: string;
    limit?: number;
  }) => {
    let query = supabase.from('designs').select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      products (
        id,
        name,
        base_price
      )
    `)

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.public !== undefined) {
      query = query.eq('is_public', filters.public)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        products (
          id,
          name,
          base_price,
          sizes,
          colors
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  create: async (design: any) => {
    const { data, error } = await supabase
      .from('designs')
      .insert(design)
      .select()
      .single()
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('designs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Funciones de utilidad para pedidos
export const orders = {
  create: async (order: any) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    return { data, error }
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name
          ),
          designs (
            id,
            title,
            preview_url
          )
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  getUserOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name
          ),
          designs (
            id,
            title,
            preview_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Funciones de utilidad para items de pedido
export const orderItems = {
  create: async (items: any[]) => {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select()
    return { data, error }
  }
}

// Funciones de utilidad para ventas de diseños
export const designSales = {
  create: async (sale: any) => {
    const { data, error } = await supabase
      .from('design_sales')
      .insert(sale)
      .select()
      .single()
    return { data, error }
  },

  getByDesign: async (designId: string) => {
    const { data, error } = await supabase
      .from('design_sales')
      .select('*')
      .eq('design_id', designId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}