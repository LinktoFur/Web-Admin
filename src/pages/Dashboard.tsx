import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '~/lib/auth'
import MyGroups from '~/pages/MyGroups'
import AddGroup from '~/pages/AddGroup'
import EditGroup from '~/pages/EditGroup'
import PendingReview from '~/pages/PendingReview'
import UserManagement from '~/pages/UserManagement'
import AdminAddUser from '~/pages/AdminAddUser'
import AdminAddGroup from '~/pages/AdminAddGroup'

export default function Dashboard() {
  const { me, logout } = useAuth()
  const nav = useNavigate()
  const isAdmin = me?.level === 'ADMIN'

  async function onLogout() {
    await logout()
    nav('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white p-4 flex flex-col">
        <div className="font-semibold tracking-wide">Linktofur</div>
        <div className="mt-1 text-xs text-neutral-500">控制台</div>

        <nav className="mt-6 space-y-1 text-sm flex-1">
          <Item to="/dashboard/groups">我的群组</Item>
          <Item to="/dashboard/groups/new">添加群组</Item>
          {isAdmin && (
            <>
              <div className="mt-4 mb-1 px-2 text-xs uppercase tracking-wider text-neutral-400">
                管理员
              </div>
              <Item to="/dashboard/pending">待审核</Item>
              <Item to="/dashboard/users">用户管理</Item>
              <Item to="/dashboard/users/new">添加用户</Item>
              <Item to="/dashboard/admin/add-group">代加群组</Item>
            </>
          )}
        </nav>

        <div className="border-t border-neutral-200 pt-3 mt-3 text-sm">
          <div className="font-medium truncate">{me?.name}</div>
          <div className="text-xs text-neutral-500 truncate">{me?.email}</div>
          <button
            onClick={onLogout}
            className="mt-2 text-xs text-neutral-500 hover:text-black"
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="groups" replace />} />
          <Route path="groups" element={<MyGroups />} />
          <Route path="groups/new" element={<AddGroup />} />
          <Route path="groups/:id/edit" element={<EditGroup />} />
          {isAdmin && (
            <>
              <Route path="pending" element={<PendingReview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/new" element={<AdminAddUser />} />
              <Route path="admin/add-group" element={<AdminAddGroup />} />
            </>
          )}
          <Route path="*" element={<Navigate to="groups" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 ${
          isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
