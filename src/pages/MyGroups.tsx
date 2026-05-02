import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Building2, Users as UsersIcon } from 'lucide-react'
import { groups, type Group } from '~/lib/api'
import { Card, Tag, Empty } from '~/components/ui'
import { cn } from '~/lib/cn'

export default function MyGroups() {
  const [list, setList] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const r = await groups.list()
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

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">我的群组</h1>
          <p className="text-sm text-gray-500 mt-1">管理你提交的群组</p>
        </div>
        <Link
          to="/dashboard/groups/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-400 hover:bg-brand-600 text-white px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          添加群组
        </Link>
      </div>

      {loading && <div className="text-gray-500">加载中</div>}
      {err && <div className="text-red-500">{err}</div>}

      {!loading && !err && list.length === 0 && <Empty>还没有群组 点上面的按钮添加一个</Empty>}

      {list.length > 0 && (
        <div className="grid gap-3">
          {list.map((g) => (
            <Card key={g.id} className="p-5 hover:shadow-diffuse-light dark:hover:shadow-warm transition-shadow">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{g.groupName}</span>
                      {g.pending === 'true' && <Tag color="amber">待审核</Tag>}
                      {g.hasPendingEdit === 'true' && <Tag color="amber">改动待审核</Tag>}
                      {g.pending !== 'true' && g.hasPendingEdit !== 'true' && <Tag color="green">已通过</Tag>}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 truncate">
                      {g.orgName} · {g.region} · 群号 {g.groupId}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/dashboard/groups/${g.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-brand-400 transition-colors shrink-0"
                >
                  <Pencil size={14} />
                  编辑
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
