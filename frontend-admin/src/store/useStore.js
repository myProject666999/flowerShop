import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      login: (user, token, role) => set({ user, token, role }),
      logout: () => set({ user: null, token: null, role: null }),
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'admin-storage',
    }
  )
)

export default useStore
