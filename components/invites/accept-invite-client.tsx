'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite, declineInvite } from '@/app/actions/invite-actions'

interface AcceptInviteClientProps {
  inviteId: string
  token: string
  workspaceName: string
  workspaceDescription?: string | null
  workspaceType?: string | null
  role: string
  inviterName: string
  isExpired: boolean
  isAccepted: boolean
  isAlreadyMember: boolean
  workspaceId: string
}

const roleDescriptions = {
  owner: 'Full control over workspace settings, members, and content',
  admin: 'Manage members, projects, and workspace settings',
  editor: 'Create and edit projects and content',
  viewer: 'View projects and content (read-only)',
}

export function AcceptInviteClient({
  inviteId,
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAlreadyMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Already a Member</h1>
          <p className="text-text-secondary mb-6">
            You're already a member of <strong>{workspaceName}</strong>.
          </p>
          <button
            onClick={() => router.push(`/workspace/${workspaceId}`)}
            className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    )
  }

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
            This invitation to <strong>{workspaceName}</strong> has expired.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Already Accepted</h1>
          <p className="text-text-secondary mb-6">
            This invitation has already been accepted.
          </p>
          <button
            onClick={() => router.push(`/workspace/${workspaceId}`)}
            className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    )
  }

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await acceptInvite(token)
    
    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push(`/workspace/${result.data?.workspaceId}`)
      router.refresh()
    }
  }

  const handleDecline = async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await declineInvite(inviteId)
    
    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
      <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Workspace Invitation</h1>
          <p className="text-text-secondary">
            <strong>{inviterName}</strong> invited you to join
          </p>
        </div>

        <div className="bg-main-bg rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">{workspaceName}</h2>
          {workspaceDescription && (
            <p className="text-sm text-text-secondary mb-3">{workspaceDescription}</p>
          )}
          {workspaceType && (
            <div className="inline-block px-2 py-1 bg-card-bg rounded text-xs text-text-secondary border border-card-border">
              {workspaceType}
            </div>
          )}
        </div>

        <div className="bg-main-bg rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1">
                Your role: <span className="capitalize">{role}</span>
              </h3>
              <p className="text-xs text-text-secondary">
                {roleDescriptions[role as keyof typeof roleDescriptions] || 'Access to workspace features'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-light border border-danger rounded-lg">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary bg-main-bg hover:bg-card-hover border border-card-border rounded-lg transition disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </div>
      </div>
    </div>
  )
}