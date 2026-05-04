import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cartCount: 0,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setCartCount: (count) => set({ cartCount: count }),
      
      login: (data) => set({ user: data.user, token: data.token }),
      
      logout: () => set({ user: null, token: null, cartCount: 0 }),

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
    }),
    {
      name: 'user-store',
    }
  )
)

export default useStore
