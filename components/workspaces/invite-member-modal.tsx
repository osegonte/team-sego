'use client'

import { useState } from 'react'
import { createInvite } from '@/app/actions/invite-actions'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspaceName: string
}

const ROLES = [
  { value: 'viewer', label: 'Viewer', description: 'Can only view content' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
  { value: 'admin', label: 'Admin', description: 'Can manage members and settings' },
  { value: 'owner', label: 'Owner', description: 'Full access including workspace deletion' },
] as const

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>('viewer')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)
    setIsInviting(true)

    try {
      const result = await createInvite(workspaceId, email, selectedRole)
      
      if (result.error) {
        setError(result.error)
        setIsInviting(false)
      } else if (result.inviteUrl) {
        setInviteUrl(result.inviteUrl)
        setShowSuccess(true)
        setIsInviting(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invite')
      setIsInviting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setSelectedRole('viewer')
    setError(null)
    setInviteUrl(null)
    setShowSuccess(false)
    onClose()
  }

  const copyToClipboard = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl)
      // Could add a toast notification here
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {showSuccess ? 'Invite Created' : 'Invite Member'}
            </h2>
            <button
              onClick={handleClose}
              className="text-text-tertiary hover:text-text-secondary transition"
              disabled={isInviting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!showSuccess && (
            <p className="text-sm text-text-secondary mt-1">
              Invite someone to join <span className="font-medium">{workspaceName}</span>
            </p>
          )}
        </div>

        {/* Modal Body */}
        {showSuccess && inviteUrl ? (
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-success-light rounded-lg border border-success">
              <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-success mb-1">Invite created successfully!</p>
                <p className="text-sm text-text-secondary">
                  Share this link with <strong>{email}</strong>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-card-border rounded-lg bg-sidebar-bg text-text-secondary text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                This link expires in 7 days
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
                disabled={isInviting}
                className="w-full px-4 py-2 border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg text-text-primary"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Role
              </label>
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
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1"
                      disabled={isInviting}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{role.label}</div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          {showSuccess ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isInviting}
                className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isInviting || !email.trim()}
                className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? 'Creating...' : 'Create Invite'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}