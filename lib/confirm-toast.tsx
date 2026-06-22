'use client'

import { toast } from 'sonner'

type ConfirmActionOptions = {
  confirmLabel?: string
  cancelLabel?: string
}

export function confirmAction(
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: ConfirmActionOptions
) {
  const confirmLabel = options?.confirmLabel ?? 'Hapus'
  const cancelLabel = options?.cancelLabel ?? 'Batal'

  toast.custom((t) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <p className="text-gray-800 font-medium mb-3">{message}</p>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => toast.dismiss(t)}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={async () => {
            toast.dismiss(t)
            await onConfirm()
          }}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  ))
}
