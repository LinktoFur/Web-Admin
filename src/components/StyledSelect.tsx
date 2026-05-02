import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '~/lib/cn'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  className?: string
}

export default function StyledSelect<T extends string>({ value, onChange, options, className }: Props<T>) {
  const current = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className={cn('relative', className)}>
          <Listbox.Button className="w-full px-3 py-2 flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-700 dark:text-gray-200 hover:border-brand-400 transition-colors outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30">
            <span className="truncate">{current?.label}</span>
            <ChevronDown
              size={14}
              className={cn('text-gray-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}
            />
          </Listbox.Button>

          <Transition
            as={Fragment}
            enter="transition duration-150 ease-out"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition duration-100 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/5 rounded-lg shadow-diffuse-light dark:shadow-diffuse-sm overflow-hidden py-1 z-20 outline-none">
              {options.map((o) => (
                <Listbox.Option key={o.value} value={o.value} as={Fragment}>
                  {({ active, selected }) => (
                    <li
                      className={cn(
                        'flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors',
                        active && 'bg-gray-50 dark:bg-zinc-700',
                        selected
                          ? 'text-brand-600 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-900/10'
                          : 'text-gray-700 dark:text-gray-300',
                      )}
                    >
                      <span>{o.label}</span>
                      {selected && <Check size={14} />}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
