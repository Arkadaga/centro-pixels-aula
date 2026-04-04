'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase'
import type { Perfil } from '@/types/database'

interface AuthState {
  user: Perfil | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      set({ user: perfil, loading: false, initialized: true })
    } else {
      set({ user: null, loading: false, initialized: true })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: perfil })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null })
      }
    })
  },

  login: async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
