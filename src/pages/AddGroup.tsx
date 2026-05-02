import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      <h1 className="text-2xl font-semibold">添加群组</h1>
      <p className="mt-1 text-sm text-neutral-500">提交后会进入审核队列</p>

      <div className="mt-6">
        <GroupForm onSubmit={submit} busy={busy} err={err} submitLabel="提交审核" />
      </div>
    </div>
  )
}
