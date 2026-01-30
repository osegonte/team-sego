'use client'

import { useState } from 'react'
import { createInvite } from '@/app/actions/invite-actions'
import { WORKSPACE_ROLES, type WorkspaceRole } from '@/lib/types/workspace'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  workspaceName: string
}

export function InviteMemberModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('viewer')
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)
    setIsInviting(true)

    const result = await createInvite(workspaceId, email, selectedRole)
    
    if ('error' in result) {
      setError(result.error)
      setIsInviting(false)
    } else if (result.data) {
      setInviteUrl(result.data.inviteUrl)
      setShowSuccess(true)
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
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-md w-full">
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {showSuccess ? 'Invitation Sent' : 'Invite Member'}
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
              Invite someone to join {workspaceName}
            </p>
          )}
        </div>

        {showSuccess && inviteUrl ? (
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-text-secondary">
              Invitation sent to <strong className="text-text-primary">{email}</strong>
            </p>
            <p className="text-xs text-text-tertiary">
              They will see a notification when they log in to Team Sego. This invite expires in 7 days.
            </p>

            <details className="text-sm">
              <summary className="text-text-secondary cursor-pointer hover:text-text-primary mb-2">
                Backup invite link
              </summary>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-text-tertiary">
                  Only use this link if they need direct access:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-card-border rounded-lg bg-sidebar-bg text-text-secondary text-xs font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 text-xs font-medium text-text-secondary hover:bg-sidebar-hover border border-card-border rounded-lg transition"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </details>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                className="w-full px-4 py-2 border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg text-text-primary disabled:opacity-50"
              />
              <p className="text-xs text-text-tertiary mt-1">
                They'll see a notification when they log in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Role
              </label>
              <div className="space-y-2">
                {(Object.entries(WORKSPACE_ROLES) as [WorkspaceRole, typeof WORKSPACE_ROLES[WorkspaceRole]][]).map(([roleValue, roleData]) => (
                  <label
                    key={roleValue}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition
                      ${selectedRole === roleValue
                        ? 'border-primary bg-primary-light'
                        : 'border-card-border hover:border-card-border-hover'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleValue}
                      checked={selectedRole === roleValue}
                      onChange={(e) => setSelectedRole(e.target.value as WorkspaceRole)}
                      className="mt-1"
                      disabled={isInviting}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{roleData.label}</div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {roleData.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        )}

        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          {showSuccess ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-sidebar-hover border border-card-border rounded-lg transition"
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
                {isInviting ? 'Sending...' : 'Send Invite'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}