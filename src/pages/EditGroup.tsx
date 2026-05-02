import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import GroupForm, { type GroupFormValue } from '~/components/GroupForm'
import { groups, type Group } from '~/lib/api'
import { useAuth } from '~/lib/auth'

export default function EditGroup() {
  const { id } = useParams()
  const nav = useNavigate()
  const { me } = useAuth()
  const isAdmin = me?.level === 'ADMIN'
  const [g, setG] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    groups
      .list()
      .then((r) => {
        const found = r.groups.find((x) => x.id === id)
        if (!found) return setErr('群组不存在')
        if (!isAdmin && found.userId !== me?.id) return setErr('群组不属于你')
        setG(found)
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [id, isAdmin, me?.id])

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

  if (loading) return <div className="text-gray-500">加载中</div>
  if (!g) return <div className="text-red-500">{err || '群组不存在'}</div>

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/groups"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft size={14} />
        返回
      </Link>

      <h1 className="text-2xl font-medium text-gray-900 dark:text-white">编辑群组</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">改动可能需要重新审核</p>

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
  )
}
