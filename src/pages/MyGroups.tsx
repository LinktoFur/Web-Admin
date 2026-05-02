import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { groups, type Group } from '~/lib/api'

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">我的群组</h1>
        <Link
          to="/dashboard/groups/new"
          className="rounded-md bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800"
        >
          添加群组
        </Link>
      </div>

      {loading && <div className="mt-6 text-neutral-500">加载中</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      {!loading && !err && list.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          还没有群组 点上面的按钮添加一个
        </div>
      )}

      {list.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-2">群名</th>
                <th className="px-4 py-2">类型</th>
                <th className="px-4 py-2">所属</th>
                <th className="px-4 py-2">地区</th>
                <th className="px-4 py-2">状态</th>
                <th className="px-4 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-3 font-medium">{g.groupName}</td>
                  <td className="px-4 py-3">{g.type === 'SCHOOL' ? '学校' : '地区'}</td>
                  <td className="px-4 py-3">{g.orgName}</td>
                  <td className="px-4 py-3">{g.region}</td>
                  <td className="px-4 py-3">
                    {g.pending === 'true' ? (
                      <span className="text-amber-600">待审核</span>
                    ) : g.hasPendingEdit === 'true' ? (
                      <span className="text-amber-600">改动待审核</span>
                    ) : (
                      <span className="text-green-700">已通过</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/dashboard/groups/${g.id}/edit`}
                      className="text-neutral-600 hover:text-black"
                    >
                      编辑
                    </Link>
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
