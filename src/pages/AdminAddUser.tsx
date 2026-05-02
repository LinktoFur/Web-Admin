import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { admin } from '~/lib/api'
import { Button, Input, Field, Card } from '~/components/ui'
import { useToast } from '~/lib/toast'

export default function AdminAddUser() {
  const nav = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const r = await admin.addUser({ email, name })
      toast.ok(`已添加 ${r.name}`)
      setTimeout(() => nav('/dashboard/users', { replace: true }), 600)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md">
      <Link
        to="/dashboard/users"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft size={14} />
        返回
      </Link>

      <h1 className="text-2xl font-medium text-gray-900 dark:text-white">添加用户</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">无需邮箱验证 直接创建</p>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <Field label="邮箱" required hint="仅支持 qq.com">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <Field label="昵称" required>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <Button busy={busy} type="submit">
            创建
          </Button>
        </form>
      </Card>
    </div>
  )
}
