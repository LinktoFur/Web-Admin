import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Search, ShieldCheck, Ban, ShieldAlert, RotateCcw } from 'lucide-react'
import { admin, type AdminUser } from '~/lib/api'
import { Button, Input, Card, Tag, Empty } from '~/components/ui'
import ConfirmDialog from '~/components/ConfirmDialog'
import { useToast } from '~/lib/toast'

type Action =
  | { kind: 'ban'; u: AdminUser }
  | { kind: 'unban'; u: AdminUser }
  | { kind: 'admin'; u: AdminUser }
  | null

export default function UserManagement() {
  const toast = useToast()
  const [list, setList] = useState<AdminUser[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [action, setAction] = useState<Action>(null)

  async function loadAll() {
    setLoading(true)
    setErr('')
    try {
      const r = await admin.userList()
      setList(r.users)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return loadAll()
    setLoading(true)
    setErr('')
    try {
      const u = await admin.userSearch(q.trim())
      setList(u as any)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function ban(u: AdminUser) {
    try {
      await admin.ban(u.id)
      toast.ok(`已封禁 ${u.name}`)
      await loadAll()
    } catch (e: any) {
      toast.err(e.message)
    }
  }

  async function unban(u: AdminUser) {
    try {
      await admin.unban(u.id)
      toast.ok(`已解封 ${u.name}`)
      await loadAll()
    } catch (e: any) {
      toast.err(e.message)
    }
  }

  async function setAdmin(u: AdminUser) {
    try {
      await admin.setAdmin(u.id)
      toast.ok(`${u.name} 已设为管理员`)
      await loadAll()
    } catch (e: any) {
      toast.err(e.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有注册用户</p>
        </div>
        <Link
          to="/dashboard/users/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-400 hover:bg-brand-600 text-white px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          添加用户
        </Link>
      </div>

      <form onSubmit={runSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="按昵称或邮箱搜索"
            className="pl-11"
          />
        </div>
        <Button type="submit">搜索</Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            setQ('')
            loadAll()
          }}
        >
          <RotateCcw size={14} />
          重置
        </Button>
      </form>

      {loading && <div className="text-gray-500">加载中</div>}
      {err && <div className="text-red-500">{err}</div>}

      {!loading && !err && list.length === 0 && <Empty>暂无用户数据</Empty>}

      {!loading && list.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-700/40 text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-medium">昵称</th>
                <th className="px-5 py-3 font-medium">邮箱</th>
                <th className="px-5 py-3 font-medium">权限</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.level === 'ADMIN' ? <Tag color="brand">管理员</Tag> : <Tag>普通</Tag>}
                  </td>
                  <td className="px-5 py-3">
                    {u.banned === 'true' ? (
                      <Tag color="red">已封禁</Tag>
                    ) : u.verified === 'true' ? (
                      <Tag color="green">正常</Tag>
                    ) : (
                      <Tag>未验证</Tag>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3 justify-end text-xs">
                      {u.banned === 'true' ? (
                        <button
                          onClick={() => setAction({ kind: 'unban', u })}
                          className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-brand-400 transition-colors"
                        >
                          <ShieldCheck size={12} />
                          解封
                        </button>
                      ) : (
                        <button
                          onClick={() => setAction({ kind: 'ban', u })}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Ban size={12} />
                          封禁
                        </button>
                      )}
                      {u.level !== 'ADMIN' && (
                        <button
                          onClick={() => setAction({ kind: 'admin', u })}
                          className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-brand-400 transition-colors"
                        >
                          <ShieldAlert size={12} />
                          设管理员
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={action?.kind === 'ban'}
        title="确认封禁"
        message={action ? `确定要封禁用户「${action.u.name}」吗` : ''}
        confirmLabel="确认封禁"
        variant="danger"
        onConfirm={() => action && ban(action.u)}
        onClose={() => setAction(null)}
      />
      <ConfirmDialog
        open={action?.kind === 'unban'}
        title="确认解封"
        message={action ? `确定要解封用户「${action.u.name}」吗` : ''}
        confirmLabel="确认解封"
        onConfirm={() => action && unban(action.u)}
        onClose={() => setAction(null)}
      />
      <ConfirmDialog
        open={action?.kind === 'admin'}
        title="设为管理员"
        message={action ? `确定要将用户「${action.u.name}」设为管理员吗` : ''}
        confirmLabel="确认"
        onConfirm={() => action && setAdmin(action.u)}
        onClose={() => setAction(null)}
      />
    </div>
  )
}
