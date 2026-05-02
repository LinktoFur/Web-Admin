import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X as XIcon, Building2, Users as UsersIcon, FileEdit, Sparkles } from 'lucide-react'
import { admin, type PendingGroup } from '~/lib/api'
import { Card, Tag, Empty, Button } from '~/components/ui'
import ConfirmDialog from '~/components/ConfirmDialog'
import { useToast } from '~/lib/toast'
import { cn } from '~/lib/cn'

type Action = { kind: 'approve' | 'reject'; g: PendingGroup } | null

export default function PendingReview() {
  const toast = useToast()
  const [list, setList] = useState<PendingGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [action, setAction] = useState<Action>(null)

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const r = await admin.pending()
      setList(r.groups)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function approve(id: string) {
    try {
      await admin.approve(id)
      toast.ok('已通过')
      await load()
    } catch (e: any) {
      toast.err(e.message)
    }
  }

  async function reject(id: string, reason?: string) {
    try {
      await admin.reject(id, reason)
      toast.ok('已拒绝')
      await load()
    } catch (e: any) {
      toast.err(e.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-white">待审核</h1>
        <p className="text-sm text-gray-500 mt-1">用户提交的新群组和修改</p>
      </div>

      {loading && <div className="text-gray-500">加载中</div>}
      {err && <div className="text-red-500">{err}</div>}

      {!loading && !err && list.length === 0 && <Empty>没有待审核的项</Empty>}

      <div className="grid gap-3">
        {list.map((g) => (
          <Card key={g.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    g.type === 'SCHOOL'
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-300'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
                  )}
                >
                  {g.type === 'SCHOOL' ? <Building2 size={18} /> : <UsersIcon size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{g.groupName}</span>
                    <Tag color={g.pendingType === 'edit' ? 'amber' : 'brand'}>
                      <span className="flex items-center gap-1">
                        {g.pendingType === 'edit' ? <FileEdit size={10} /> : <Sparkles size={10} />}
                        {g.pendingType === 'edit' ? '修改' : '新增'}
                      </span>
                    </Tag>
                    <Tag>{g.type === 'SCHOOL' ? '院校' : '地区'}</Tag>
                    {g.userName && (
                      <Link
                        to={`/dashboard/users?q=${encodeURIComponent(g.userName)}`}
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        {g.userName}
                      </Link>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {g.orgName} · {g.region} · 群号 <span className="font-mono">{g.groupId}</span>
                  </div>

                  {g.pendingType === 'edit' && g.pendingEdit && Object.keys(g.pendingEdit).length > 0 && (
                    <div className="mt-3 rounded-xl border border-amber-200/70 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 p-3 text-sm">
                      <div className="text-xs font-medium text-amber-700 dark:text-amber-400">改动内容</div>
                      <ul className="mt-1.5 space-y-0.5 text-gray-700 dark:text-gray-300">
                        {Object.entries(g.pendingEdit).map(([k, v]) => (
                          <li key={k} className="flex gap-2">
                            <span className="text-gray-500 shrink-0">{k}</span>
                            <span className="truncate">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3 text-sm">
                    <span className="text-gray-500">入群方式</span> {g.joinEntry}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button onClick={() => setAction({ kind: 'approve', g })} className="px-4 py-1.5 text-sm">
                  <Check size={14} />
                  通过
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setAction({ kind: 'reject', g })}
                  className="px-4 py-1.5 text-sm"
                >
                  <XIcon size={14} />
                  拒绝
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={action?.kind === 'approve'}
        title="确认通过"
        message={action ? `确定要通过群组「${action.g.groupName}」的审核吗 通过后将公开显示` : ''}
        confirmLabel="确认通过"
        onConfirm={async () => { if (action) await approve(action.g.id) }}
        onClose={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.kind === 'reject'}
        title="确认拒绝"
        message={action ? `确定要拒绝群组「${action.g.groupName}」的审核吗 拒绝后将被删除` : ''}
        confirmLabel="确认拒绝"
        variant="danger"
        withReason
        reasonPlaceholder="拒绝原因 选填"
        onConfirm={async (reason) => { if (action) await reject(action.g.id, reason) }}
        onClose={() => setAction(null)}
      />
    </div>
  )
}
