import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Plus, Pencil, Building2, Users as UsersIcon, Search, ArrowDownUp, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { groups, type Group } from '~/lib/api'
import { Card, Tag, Empty, Input } from '~/components/ui'
import { cn } from '~/lib/cn'

const PAGE_SIZE = 10

type Sort = 'new' | 'old' | 'name'
type Status = 'all' | 'approved' | 'pending' | 'edit'

const sortOptions: { id: Sort; label: string }[] = [
  { id: 'new', label: '最新优先' },
  { id: 'old', label: '最旧优先' },
  { id: 'name', label: '按群名' },
]

const statusTabs: { id: Status; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'approved', label: '已通过' },
  { id: 'pending', label: '待审核' },
  { id: 'edit', label: '改动待审核' },
]

function statusOf(g: Group): Status {
  if (g.pending === 'true') return 'pending'
  if (g.hasPendingEdit === 'true') return 'edit'
  return 'approved'
}

export default function MyGroups() {
  const [list, setList] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('new')
  const [status, setStatus] = useState<Status>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [q, sort, status])

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

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    let r = list
    if (status !== 'all') r = r.filter((g) => statusOf(g) === status)
    if (kw) {
      r = r.filter(
        (g) =>
          g.groupName.toLowerCase().includes(kw) ||
          g.groupId.toLowerCase().includes(kw) ||
          g.region.toLowerCase().includes(kw) ||
          (g.orgName || '').toLowerCase().includes(kw),
      )
    }
    const sorted = [...r]
    if (sort === 'new') sorted.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    else if (sort === 'old') sorted.sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
    else if (sort === 'name') sorted.sort((a, b) => a.groupName.localeCompare(b.groupName, 'zh'))
    return sorted
  }, [list, q, sort, status])

  const counts = useMemo(() => {
    const m: Record<Status, number> = { all: list.length, approved: 0, pending: 0, edit: 0 }
    list.forEach((g) => {
      m[statusOf(g)]++
    })
    return m
  }, [list])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索群名 群号 地区或组织"
            className="pl-11"
          />
        </div>
        <Menu as="div" className="relative shrink-0">
          {({ open }) => (
            <>
              <Menu.Button className="w-full sm:w-44 px-4 py-3 flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:border-brand-400 transition-colors outline-none">
                <span className="flex items-center gap-2">
                  <ArrowDownUp size={14} className="text-gray-400" />
                  {sortOptions.find((o) => o.id === sort)?.label}
                </span>
                <ChevronDown
                  size={14}
                  className={cn('text-gray-400 transition-transform duration-200', open && 'rotate-180')}
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition duration-150 ease-out"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition duration-100 ease-in"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Menu.Items className="absolute right-0 sm:left-0 top-full mt-2 w-full sm:w-44 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 rounded-xl shadow-diffuse-light dark:shadow-diffuse-sm overflow-hidden py-1 z-20 outline-none">
                  {sortOptions.map((o) => (
                    <Menu.Item key={o.id}>
                      {({ active }) => (
                        <button
                          onClick={() => setSort(o.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                            active && 'bg-gray-50 dark:bg-zinc-700',
                            sort === o.id
                              ? 'text-brand-600 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-900/10'
                              : 'text-gray-700 dark:text-gray-300',
                          )}
                        >
                          <span>{o.label}</span>
                          {sort === o.id && <Check size={14} />}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {statusTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              status === t.id
                ? 'bg-brand-400 text-white'
                : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400',
            )}
          >
            {t.label}
            <span className={cn('text-[10px]', status === t.id ? 'text-white/80' : 'text-gray-400')}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {loading && <div className="text-gray-500">加载中</div>}
      {err && <div className="text-red-500">{err}</div>}

      {!loading && !err && list.length === 0 && <Empty>还没有群组 点上面的按钮添加一个</Empty>}

      {!loading && list.length > 0 && filtered.length === 0 && <Empty>没有匹配的群组</Empty>}

      {filtered.length > 0 && (
        <div className="grid gap-3">
          {paged.map((g) => (
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

      {filtered.length > PAGE_SIZE && (
        <Pagination page={safePage} total={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

function pageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push('...')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('...')
  out.push(total)
  return out
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = pageRange(page, total)
  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-400 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1.5 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-brand-400 text-white'
                : 'border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-400',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= total}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-400 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
