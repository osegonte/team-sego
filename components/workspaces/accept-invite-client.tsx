'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite } from '@/app/actions/invite-actions'

interface AcceptInviteClientProps {
  token: string
  workspaceName: string
  workspaceDescription?: string | null
  workspaceType?: string
  role: string
  inviterName: string
  isExpired: boolean
  isAccepted: boolean
  isAlreadyMember: boolean
  workspaceId: string
}

export function AcceptInviteClient({
  token,
  workspaceName,
  workspaceDescription,
  workspaceType,
  role,
  inviterName,
  isExpired,
  isAccepted,
  isAlreadyMember,
  workspaceId,
}: AcceptInviteClientProps) {
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If already a member, show message and redirect button
  if (isAlreadyMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Already a Member</h1>
          <p className="text-text-secondary mb-6">
            You're already a member of <strong>{workspaceName}</strong>.
          </p>
          <button
            onClick={() => router.push(`/workspace/${workspaceId}`)}
            className="px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    )
  }

  // If expired
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-warning-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Invite Expired</h1>
          <p className="text-text-secondary mb-6">
            This invite to <strong>{workspaceName}</strong> has expired. Please ask for a new invite.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // If already accepted
  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-warning-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Already Used</h1>
          <p className="text-text-secondary mb-6">
            This invite has already been accepted and cannot be used again.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Valid invite - show accept screen
  const handleAccept = async () => {
    setError(null)
    setIsAccepting(true)

    try {
      const result = await acceptInvite(token)
      
      if (result.error) {
        setError(result.error)
        setIsAccepting(false)
      } else if (result.workspaceId) {
        // Success - redirect to workspace
        router.push(`/workspace/${result.workspaceId}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite')
      setIsAccepting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
      <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">You're Invited!</h1>
          <p className="text-text-secondary">
            <strong>{inviterName}</strong> invited you to join
          </p>
        </div>

        {/* Workspace Info */}
        <div className="px-8 pb-6">
          <div className="bg-sidebar-bg rounded-lg p-4 border border-card-border">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-text-inverse text-lg font-semibold">
                  {workspaceName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text-primary mb-1">{workspaceName}</h2>
                {workspaceDescription && (
                  <p className="text-sm text-text-secondary mb-2">{workspaceDescription}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  {workspaceType && (
                    <>
                      <span className="capitalize">{workspaceType}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="capitalize">Join as {role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-8 pb-6">
            <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            disabled={isAccepting}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition border border-card-border disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? 'Accepting...' : 'Accept Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}