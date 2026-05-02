import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { admin } from '~/lib/api'

export default function AdminAddUser() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setOk('')
    try {
      const r = await admin.addUser({ email, name })
      setOk(`已添加 ${r.name}`)
      setTimeout(() => nav('/dashboard/users', { replace: true }), 800)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">添加用户</h1>
      <p className="mt-1 text-sm text-neutral-500">用于代为创建账号 仅支持 qq.com 邮箱</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <Field label="邮箱">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </Field>

        <Field label="昵称">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </Field>

        {err && <div className="text-sm text-red-600">{err}</div>}
        {ok && <div className="text-sm text-green-700">{ok}</div>}

        <button
          disabled={busy}
          className="rounded-md bg-black text-white px-5 py-2.5 hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy ? '请稍候' : '创建'}
        </button>
      </form>
    </div>
  )
}

const input = 'w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-black'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
