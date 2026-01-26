'use client'

import { useState } from 'react'
import { changeMemberRole } from '@/app/actions/member-actions'

interface ChangeRoleModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  membershipId: string
  memberName: string
  currentRole: string
}

const ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full access including workspace deletion' },
  { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view content' },
] as const

export function ChangeRoleModal({
  isOpen,
  onClose,
  workspaceId,
  membershipId,
  memberName,
  currentRole,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRole === currentRole) {
      onClose()
      return
    }

    setError(null)
    setIsChanging(true)

    try {
      const result = await changeMemberRole(workspaceId, membershipId, selectedRole as any)
      
      if (result.error) {
        setError(result.error)
        setIsChanging(false)
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change role')
      setIsChanging(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Change Role</h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition"
              disabled={isChanging}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Change role for <span className="font-medium">{memberName}</span>
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Role Options */}
          <div className="space-y-2">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                  ${selectedRole === role.value
                    ? 'border-primary bg-primary-light'
                    : 'border-card-border hover:border-card-border-hover'
                  }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1"
                  disabled={isChanging}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{role.label}</span>
                    {role.value === currentRole && (
                      <span className="text-xs text-text-tertiary">(current)</span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {role.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isChanging}
            className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isChanging || selectedRole === currentRole}
            className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'Changing...' : 'Change Role'}
          </button>
        </div>
      </div>
    </div>
  )
}