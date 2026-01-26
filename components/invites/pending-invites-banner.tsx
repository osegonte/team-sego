'use client'

import { useState } from 'react'
import { acceptInvite, declineInvite } from '@/app/actions/invite-actions'
import { useRouter } from 'next/navigation'

interface PendingInvite {
  id: string
  token: string
  role_to_grant: string
  workspace_id: string
  workspace_name: string
  workspace_type: string
  inviter_name: string
  created_at: string
}

interface PendingInvitesBannerProps {
  invites: PendingInvite[]
}

export function PendingInvitesBanner({ invites }: PendingInvitesBannerProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (invites.length === 0) return null

  const handleAccept = async (token: string, inviteId: string, workspaceName: string) => {
    setProcessingId(inviteId)
    setError(null)
    setSuccessMessage(null)

    const result = await acceptInvite(token)

    if (result.error) {
      setError(result.error)
      setProcessingId(null)
    } else if (result.workspaceId) {
      setSuccessMessage(`Successfully joined ${workspaceName}!`)
      setTimeout(() => {
        router.push(`/workspace/${result.workspaceId}`)
        router.refresh()
      }, 1000)
    }
  }

  const handleDecline = async (inviteId: string, workspaceName: string) => {
    // Confirm before declining
    if (!confirm(`Are you sure you want to decline the invite to ${workspaceName}?`)) {
      return
    }

    setProcessingId(inviteId)
    setError(null)
    setSuccessMessage(null)

    const result = await declineInvite(inviteId)

    if (result.error) {
      setError(result.error)
      setProcessingId(null)
    } else {
      setSuccessMessage('Invite declined')
      // Refresh to remove from list
      setTimeout(() => {
        router.refresh()
      }, 1000)
    }
  }

  return (
    <div className="mb-6">
      <div className="bg-primary-light border border-primary rounded-lg p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              📩 You have {invites.length} pending invite{invites.length > 1 ? 's' : ''}
            </h3>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-3 text-sm text-success font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-4 bg-card-bg rounded-lg p-3 border border-card-border"
                >
                  {/* Invite Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary">
                        {invite.workspace_name}
                      </span>
                      <span className="text-xs text-text-tertiary capitalize">
                        ({invite.workspace_type})
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <span className="capitalize">{invite.role_to_grant}</span>
                      {' • '}
                      Invited by {invite.inviter_name}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecline(invite.id, invite.workspace_name)}
                      disabled={processingId === invite.id}
                      className="px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === invite.id ? 'Processing...' : 'Decline'}
                    </button>
                    <button
                      onClick={() => handleAccept(invite.token, invite.id, invite.workspace_name)}
                      disabled={processingId === invite.id}
                      className="px-3 py-1.5 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === invite.id ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}