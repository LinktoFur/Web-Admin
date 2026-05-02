import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, User } from 'lucide-react'
import GroupForm, { type GroupFormValue } from '~/components/GroupForm'
import { admin, type AdminUser } from '~/lib/api'
import { Button, Input, Card } from '~/components/ui'
import { useToast } from '~/lib/toast'
import { cn } from '~/lib/cn'

export default function AdminAddGroup() {
  const nav = useNavigate()
  const toast = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userId, setUserId] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    admin
      .userList()
      .then((r) => setUsers(r.users))
      .catch((e) => setErr(e.message))
  }, [])

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) {
      const r = await admin.userList().catch(() => null)
      if (r) setUsers(r.users)
      return
    }
    try {
      const u = await admin.userSearch(q.trim())
      setUsers(u as any)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function submit(v: GroupFormValue) {
    if (!userId) {
      setErr('请先选择群主')
      return
    }
    setBusy(true)
    setErr('')
    try {
      await admin.addGroup({ userId, ...v })
      toast.ok('群组添加成功 已通知用户')
      setTimeout(() => nav('/dashboard/users', { replace: true }), 600)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft size={14} />
        返回
      </Link>

      <h1 className="text-2xl font-medium text-gray-900 dark:text-white">代为添加群组</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">为指定用户创建群组 直接通过审核</p>

      <Card className="p-6 mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">选择群主</div>

        <form onSubmit={runSearch} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索昵称或邮箱"
              className="pl-11"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>

        <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
          {users.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">无结果</div>
          ) : (
            users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => setUserId(u.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                  userId === u.id
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5',
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-500">
                  <User size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                </div>
                {userId === u.id && <span className="text-xs">✓</span>}
              </button>
            ))
          )}
        </div>
      </Card>

      <GroupForm onSubmit={submit} busy={busy} err={err} submitLabel="创建群组" />
    </div>
  )
}
