import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { cn } from '~/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  footer?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, footer, children, size = 'md' }: Props) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="duration-200 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-150 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full rounded-2xl bg-white dark:bg-zinc-800 shadow-diffuse-light dark:shadow-diffuse',
                  'border border-gray-100 dark:border-white/5',
                  sizeMap[size],
                )}
              >
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                <div className="p-6">{children}</div>
                {footer && (
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-2">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
