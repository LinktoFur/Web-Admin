import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GroupForm, { type GroupFormValue } from '~/components/GroupForm'
import { admin, type AdminUser } from '~/lib/api'

export default function AdminAddGroup() {
  const nav = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userId, setUserId] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    admin.userList().then((r) => setUsers(r.users)).catch((e) => setErr(e.message))
  }, [])

  async function runSearch() {
    if (!q.trim()) return
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
      nav('/dashboard/users', { replace: true })
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">代为添加群组</h1>
      <p className="mt-1 text-sm text-neutral-500">为指定用户创建群组 直接通过审核</p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="text-sm font-medium">选择群主</div>
        <div className="mt-3 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索用户"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={runSearch}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-black"
          >
            搜索
          </button>
        </div>

        <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-neutral-200">
          {users.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 cursor-pointer"
            >
              <input
                type="radio"
                name="owner"
                checked={userId === u.id}
                onChange={() => setUserId(u.id)}
              />
              <span className="font-medium">{u.name}</span>
              <span className="text-neutral-500">{u.email}</span>
            </label>
          ))}
          {users.length === 0 && (
            <div className="px-3 py-4 text-sm text-neutral-500 text-center">无结果</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <GroupForm onSubmit={submit} busy={busy} err={err} submitLabel="创建群组" />
      </div>
    </div>
  )
}
