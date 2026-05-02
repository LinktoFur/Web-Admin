import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '~/lib/cn'

type Toast = { id: number; kind: 'ok' | 'err'; text: string }

const Ctx = createContext<{
  ok: (text: string) => void
  err: (text: string) => void
}>(null as any)

let idSeq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])

  const remove = (id: number) => setItems((arr) => arr.filter((t) => t.id !== id))

  const push = useCallback((kind: 'ok' | 'err', text: string) => {
    const id = ++idSeq
    setItems((arr) => [...arr, { id, kind, text }])
    setTimeout(() => remove(id), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ ok: (t) => push('ok', t), err: (t) => push('err', t) }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-diffuse-light dark:shadow-warm border text-sm animate-slide-down',
              t.kind === 'ok'
                ? 'bg-white dark:bg-zinc-800 border-green-200 dark:border-green-900/40 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-zinc-800 border-red-200 dark:border-red-900/40 text-gray-900 dark:text-white',
            )}
          >
            {t.kind === 'ok' ? (
              <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
