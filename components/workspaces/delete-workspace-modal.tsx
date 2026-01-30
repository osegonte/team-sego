'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteWorkspace } from '@/app/actions/workspace-actions'

interface DeleteWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspaceName: string
}

export function DeleteWorkspaceModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: DeleteWorkspaceModalProps) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = confirmText === workspaceName

  const handleDelete = async () => {
    if (!canDelete) return

    setError(null)
    setIsDeleting(true)

    const result = await deleteWorkspace(workspaceId)
    
    if ('error' in result) {
      setError(result.error)
      setIsDeleting(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-lg w-full">
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-danger">Delete Workspace</h2>
            <button
              onClick={handleClose}
              className="text-text-tertiary hover:text-text-secondary transition"
              disabled={isDeleting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3 bg-danger-light border border-danger rounded-lg p-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-danger mb-2">
                This action cannot be undone!
              </p>
              <p className="text-sm text-text-secondary">
                Deleting <strong className="text-text-primary">{workspaceName}</strong> will permanently remove:
              </p>
              <ul className="text-sm text-text-secondary mt-2 space-y-1 list-disc list-inside">
                <li>All workspace members</li>
                <li>All pending invites</li>
                <li>All projects and data (Stage 2+)</li>
                <li>All workspace settings</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Type <code className="px-2 py-0.5 bg-danger-light text-danger rounded font-mono text-sm">{workspaceName}</code> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter workspace name"
              disabled={isDeleting}
              className="w-full px-4 py-2 border border-card-border rounded-lg focus:ring-2 focus:ring-danger focus:border-transparent bg-card-bg text-text-primary disabled:opacity-50"
              autoComplete="off"
            />
            <p className="text-xs text-text-tertiary mt-1">
              This is case-sensitive and must match exactly.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="px-4 py-2 text-sm font-medium text-text-inverse bg-danger hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Workspace'}
          </button>
        </div>
      </div>
    </div>
  )
}