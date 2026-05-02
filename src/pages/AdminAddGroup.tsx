import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, User, Check } from 'lucide-react'
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

  const selectedUser = users.find((u) => u.id === userId)

  return (
    <div className="max-w-3xl">
      <Link
        to="/dashboard/users"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mb-2"
      >
        <ArrowLeft size={12} />
        返回
      </Link>

      <h1 className="text-lg font-medium text-gray-900 dark:text-white mb-3">代为添加群组</h1>

      <Card className="p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">选择群主</div>
          {selectedUser && (
            <div className="text-xs text-gray-500">
              已选 <span className="text-brand-600 dark:text-brand-300">{selectedUser.name}</span>
            </div>
          )}
        </div>

        <form onSubmit={runSearch} className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索昵称或邮箱"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">搜索</Button>
        </form>

        <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
          {users.length === 0 ? (
            <div className="px-3 py-6 text-xs text-gray-500 text-center">无结果</div>
          ) : (
            users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => setUserId(u.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
                  userId === u.id
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5',
                )}
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-500 shrink-0">
                  <User size={12} />
                </div>
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span className="font-medium truncate">{u.name}</span>
                  <span className="text-xs text-gray-500 truncate">{u.email}</span>
                </div>
                {userId === u.id && <Check size={14} className="shrink-0" />}
              </button>
            ))
          )}
        </div>
      </Card>

      <GroupForm onSubmit={submit} busy={busy} err={err} submitLabel="创建群组" />
    </div>
  )
}
