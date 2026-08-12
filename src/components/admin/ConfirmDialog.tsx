import { Modal } from '@/components/admin/Modal'
import { Trash2 } from 'lucide-react'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  busy,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  busy?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {busy ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}
