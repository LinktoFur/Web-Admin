import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '~/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const btn: Record<Variant, string> = {
  primary: 'bg-brand-400 hover:bg-brand-600 text-white',
  secondary: 'border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700',
  ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  busy?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', busy, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || busy}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        btn[variant],
        className,
      )}
      {...rest}
    >
      {busy && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

const inputBase =
  'w-full rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 transition-all'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={cn(inputBase, 'px-4 py-3', className)} {...rest} />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea ref={ref} className={cn(inputBase, 'px-4 py-3 resize-none', className)} {...rest} />
  ),
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select ref={ref} className={cn(inputBase, 'px-4 py-3', className)} {...rest}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

type FieldProps = {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}

export function Field({ label, required, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-gray-400 font-normal ml-1">{hint}</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

type CardProps = { className?: string; children: ReactNode }

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-800 shadow-diffuse-sm-light dark:shadow-warm-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

type TagProps = { color?: 'gray' | 'amber' | 'green' | 'red' | 'brand'; children: ReactNode }

const tagColors: Record<NonNullable<TagProps['color']>, string> = {
  gray: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300',
}

export function Tag({ color = 'gray', children }: TagProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tagColors[color])}>
      {children}
    </span>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center text-gray-500">
      {children}
    </div>
  )
}
