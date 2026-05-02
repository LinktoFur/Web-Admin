import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '~/lib/auth'
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
    <div className="min-h-screen flex items-center justify-center text-neutral-500">
      加载中
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
    </AuthProvider>
  )
}
