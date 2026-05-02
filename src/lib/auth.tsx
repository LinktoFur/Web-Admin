import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth, token, type Me } from './api'

type Ctx = {
  me: Me | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthCtx = createContext<Ctx>(null as any)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!token.get()) {
      setMe(null)
      setLoading(false)
      return
    }
    try {
      const u = await auth.me()
      setMe(u)
    } catch {
      token.clear()
      setMe(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await auth.logout()
    } catch {}
    token.clear()
    setMe(null)
  }

  useEffect(() => {
    refresh()
  }, [])

  return <AuthCtx.Provider value={{ me, loading, refresh, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
