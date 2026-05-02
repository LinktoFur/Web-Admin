import { useEffect, useState } from 'react'
import { admin, type PendingGroup } from '~/lib/api'

export default function PendingReview() {
  const [list, setList] = useState<PendingGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [acting, setActing] = useState('')

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
    setActing(id)
    try {
      await admin.approve(id)
      await load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActing('')
    }
  }

  async function reject(id: string) {
    const reason = prompt('拒绝原因 可留空') || ''
    setActing(id)
    try {
      await admin.reject(id, reason)
      await load()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActing('')
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold">待审核</h1>

      {loading && <div className="mt-6 text-neutral-500">加载中</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && list.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          没有待审核的项
        </div>
      )}

      <div className="mt-6 space-y-3">
        {list.map((g) => (
          <div key={g.id} className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{g.groupName}</span>
                  <Tag>{g.pendingType === 'new' ? '新增' : '修改'}</Tag>
                  <Tag>{g.type === 'SCHOOL' ? '学校' : '地区'}</Tag>
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  {g.orgName} · {g.region} · 群号 {g.groupId}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  提交者 {g.userName || g.userId || '未知'}
                </div>

                {g.pendingType === 'edit' && g.pendingEdit && (
                  <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
                    <div className="text-xs font-medium text-amber-700">改动内容</div>
                    <ul className="mt-1 space-y-0.5 text-neutral-700">
                      {Object.entries(g.pendingEdit).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-neutral-500">{k}</span>: {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 text-sm">
                  <span className="text-neutral-500">入群方式</span>: {g.joinEntry}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  disabled={acting === g.id}
                  onClick={() => approve(g.id)}
                  className="rounded-md bg-black text-white px-4 py-1.5 text-sm hover:bg-neutral-800 disabled:opacity-60"
                >
                  通过
                </button>
                <button
                  disabled={acting === g.id}
                  onClick={() => reject(g.id)}
                  className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm hover:border-black disabled:opacity-60"
                >
                  拒绝
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-600">
      {children}
    </span>
  )
}
