'use client'

import { useState } from 'react'
import { acceptInvite, declineInvite } from '@/app/actions/invite-actions'
import { useRouter } from 'next/navigation'
import type { PendingInvite } from '@/lib/types/invite'

interface InvitesListProps {
  invites: PendingInvite[]
}

export function InvitesList({ invites }: InvitesListProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async (token: string, inviteId: string) => {
    setProcessingId(inviteId)
    setError(null)

    const result = await acceptInvite(token)

    if ('error' in result) {
      setError(result.error)
      setProcessingId(null)
    } else {
      router.push(`/workspace/${result.data?.workspaceId}`)
      router.refresh()
    }
  }

  const handleDecline = async (inviteId: string, workspaceName: string) => {
    if (!confirm(`Decline invitation to ${workspaceName}?`)) {
      return
    }

    setProcessingId(inviteId)
    setError(null)

    const result = await declineInvite(inviteId)

    if ('error' in result) {
      setError(result.error)
      setProcessingId(null)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      {error && (
        <div className="px-6 py-3 bg-danger-light border-b border-danger text-sm text-danger">
          {error}
        </div>
      )}
      
      <div className="divide-y divide-card-border">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-sidebar-hover transition"
          >
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

            <div className="flex items-center gap-4 text-sm">
              {processingId === invite.id ? (
                <span className="text-text-tertiary">Processing...</span>
              ) : (
                <>
                  <button
                    onClick={() => handleDecline(invite.id, invite.workspace_name)}
                    className="text-text-secondary hover:text-text-primary hover:underline transition"
                  >
                    Decline
                  </button>
                  <span className="text-text-tertiary">|</span>
                  <button
                    onClick={() => handleAccept(invite.token, invite.id)}
                    className="text-primary hover:underline transition"
                  >
                    Accept
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}