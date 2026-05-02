import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '~/lib/cn'

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

type Props = { page: number; total: number; onChange: (p: number) => void }

export default function Pagination({ page, total, onChange }: Props) {
  const pages = pageRange(page, total)
  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-400 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1 text-gray-400 text-xs">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'min-w-7 h-7 px-2 rounded-md text-xs font-medium transition-colors',
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
        className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-400 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
