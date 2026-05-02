import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GroupForm, { type GroupFormValue } from '~/components/GroupForm'
import { groups, type Group } from '~/lib/api'

export default function EditGroup() {
  const { id } = useParams()
  const nav = useNavigate()
  const [g, setG] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    groups
      .list()
      .then((r) => {
        const found = r.groups.find((x) => x.id === id)
        if (!found) setErr('群组不存在或不属于你')
        else setG(found)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function submit(v: GroupFormValue) {
    if (!g) return
    setBusy(true)
    setErr('')
    try {
      await groups.edit({ id: g.id, ...v })
      nav('/dashboard/groups', { replace: true })
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="text-neutral-500">加载中</div>
  if (!g) return <div className="text-red-600">{err || '群组不存在'}</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">编辑群组</h1>
      <p className="mt-1 text-sm text-neutral-500">改动可能需要重新审核</p>

      <div className="mt-6">
        <GroupForm
          initial={{
            groupId: g.groupId,
            groupName: g.groupName,
            orgName: g.orgName,
            region: g.region,
            type: g.type,
            joinEntry: g.joinEntry,
            showContact: g.showContact === 'true',
            acceptApply: g.acceptApply === 'true',
          }}
          onSubmit={submit}
          busy={busy}
          err={err}
          submitLabel="保存修改"
          showFlags
        />
      </div>
    </div>
  )
}
