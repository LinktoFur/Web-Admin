import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '~/lib/auth'
import { ToastProvider } from '~/lib/toast'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'

function Guard({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const { me, loading } = useAuth()
  if (loading) return <Loading />
  if (!me) return <Navigate to="/login" replace />
  if (admin && me.level !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">加载中</p>
    </div>
  )
}

function Home() {
  const { me, loading } = useAuth()
  if (loading) return <Loading />
  return <Navigate to={me ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <Guard>
                <Dashboard />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
