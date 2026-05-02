import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Button, Textarea } from './ui'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'primary' | 'danger'
  withReason?: boolean
  reasonPlaceholder?: string
  onConfirm: (reason?: string) => Promise<void> | void
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  variant = 'primary',
  withReason,
  reasonPlaceholder,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setBusy(false)
    }
  }, [open])

  async function run() {
    setBusy(true)
    try {
      await onConfirm(withReason ? reason : undefined)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            取消
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={run} busy={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      {withReason && (
        <Textarea
          rows={3}
          placeholder={reasonPlaceholder || '原因 选填'}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-4"
        />
      )}
    </Modal>
  )
}
