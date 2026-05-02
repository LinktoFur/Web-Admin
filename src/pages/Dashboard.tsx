import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut, ListChecks, Users, UserPlus, FolderPlus, Folder, ShieldCheck } from 'lucide-react'
import { useAuth } from '~/lib/auth'
import { useTheme } from '~/lib/theme'
import { cn } from '~/lib/cn'
import logo from '~/assets/logo.png'
import MyGroups from '~/pages/MyGroups'
import AddGroup from '~/pages/AddGroup'
import EditGroup from '~/pages/EditGroup'
import PendingReview from '~/pages/PendingReview'
import UserManagement from '~/pages/UserManagement'
import AdminAddUser from '~/pages/AdminAddUser'
import AdminAddGroup from '~/pages/AdminAddGroup'

export default function Dashboard() {
  const { me, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const isAdmin = me?.level === 'ADMIN'

  async function onLogout() {
    await logout()
    nav('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-800 flex flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-white/5">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Linktofur" width={32} height={32} className="h-8 w-auto" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white tracking-wide leading-tight">
                Linktofur
              </div>
              <div className="text-xs text-gray-500 leading-tight">控制台</div>
            </div>
          </a>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 text-sm overflow-y-auto">
          <Item to="/dashboard/groups" icon={Folder}>我的群组</Item>
          <Item to="/dashboard/groups/new" icon={FolderPlus}>添加群组</Item>

          {isAdmin && (
            <>
              <div className="mt-4 mb-1 px-3 text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                <span>管理员</span>
              </div>
              <Item to="/dashboard/pending" icon={ListChecks}>待审核</Item>
              <Item to="/dashboard/users" icon={Users}>用户管理</Item>
              <Item to="/dashboard/users/new" icon={UserPlus}>添加用户</Item>
              <Item to="/dashboard/admin/add-group" icon={FolderPlus}>代加群组</Item>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate text-gray-900 dark:text-white">{me?.name}</div>
              <div className="text-xs text-gray-500 truncate">{me?.email}</div>
            </div>
            <button
              onClick={toggle}
              aria-label="切换主题"
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all active:scale-95 shrink-0"
            >
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="animate-fade-in">
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
        </div>
      </main>
    </div>
  )
}

function Item({ to, icon: Icon, children }: { to: string; icon: typeof Folder; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
          isActive
            ? 'bg-brand-400 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700',
        )
      }
    >
      <Icon size={16} />
      <span>{children}</span>
    </NavLink>
  )
}
