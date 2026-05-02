import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import GroupForm, { type GroupFormValue } from '~/components/GroupForm'
import { groups } from '~/lib/api'

export default function AddGroup() {
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(v: GroupFormValue) {
    setBusy(true)
    setErr('')
    try {
      await groups.add(v)
      nav('/dashboard/groups', { replace: true })
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/dashboard/groups" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4">
        <ArrowLeft size={14} />
        返回
      </Link>

      <h1 className="text-2xl font-medium text-gray-900 dark:text-white">添加群组</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">提交后会进入审核队列</p>

      <GroupForm onSubmit={submit} busy={busy} err={err} submitLabel="提交审核" />
    </div>
  )
}
