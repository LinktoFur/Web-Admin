import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { admin, type AdminUser } from '~/lib/api'

export default function UserManagement() {
  const [list, setList] = useState<AdminUser[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

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
    if (!confirm(`封禁 ${u.name}`)) return
    try {
      await admin.ban(u.id)
      await loadAll()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function unban(u: AdminUser) {
    try {
      await admin.unban(u.id)
      await loadAll()
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function setAdmin(u: AdminUser) {
    if (!confirm(`将 ${u.name} 设为管理员`)) return
    try {
      await admin.setAdmin(u.id)
      await loadAll()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">用户管理</h1>
        <Link
          to="/dashboard/users/new"
          className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800"
        >
          添加用户
        </Link>
      </div>

      <form onSubmit={runSearch} className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按昵称或邮箱搜索"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-black"
        />
        <button className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">
          搜索
        </button>
        <button
          type="button"
          onClick={() => {
            setQ('')
            loadAll()
          }}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-black"
        >
          重置
        </button>
      </form>

      {loading && <div className="mt-6 text-neutral-500">加载中</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && list.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-2">昵称</th>
                <th className="px-4 py-2">邮箱</th>
                <th className="px-4 py-2">权限</th>
                <th className="px-4 py-2">状态</th>
                <th className="px-4 py-2 w-48"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.level === 'ADMIN' ? (
                      <span className="text-amber-700">管理员</span>
                    ) : (
                      <span className="text-neutral-500">普通</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.banned === 'true' ? (
                      <span className="text-red-600">已封禁</span>
                    ) : u.verified === 'true' ? (
                      <span className="text-green-700">正常</span>
                    ) : (
                      <span className="text-neutral-500">未验证</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end text-xs">
                      {u.banned === 'true' ? (
                        <button onClick={() => unban(u)} className="text-neutral-600 hover:text-black">
                          解封
                        </button>
                      ) : (
                        <button onClick={() => ban(u)} className="text-red-600 hover:text-red-700">
                          封禁
                        </button>
                      )}
                      {u.level !== 'ADMIN' && (
                        <button onClick={() => setAdmin(u)} className="text-neutral-600 hover:text-black">
                          设管理员
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
