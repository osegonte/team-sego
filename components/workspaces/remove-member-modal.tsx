'use client'

import { useState } from 'react'
import { removeMember } from '@/app/actions/member-actions'

interface RemoveMemberModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  membershipId: string
  memberName: string
}

export function RemoveMemberModal({
  isOpen,
  onClose,
  workspaceId,
  membershipId,
  memberName,
}: RemoveMemberModalProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = async () => {
    setError(null)
    setIsRemoving(true)

    const result = await removeMember(workspaceId, membershipId)
    
    if ('error' in result) {
      setError(result.error)
      setIsRemoving(false)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-md w-full">
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Remove Member</h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition"
              disabled={isRemoving}
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

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-light flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium mb-1">
                Are you sure you want to remove <span className="font-semibold">{memberName}</span>?
              </p>
              <p className="text-sm text-text-secondary">
                They will lose access to this workspace immediately. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-4 py-2 text-sm font-medium text-text-inverse bg-danger hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  )
}