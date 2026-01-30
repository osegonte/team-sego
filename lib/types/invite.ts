import { WorkspaceRole, WorkspaceType } from './workspace'

export interface Invite {
  id: string
  workspace_id: string
  invited_email: string
  role_to_grant: WorkspaceRole
  token: string
  created_by: string
  created_at: string
  expires_at: string
  accepted_by: string | null
  accepted_at: string | null
}

export interface PendingInvite {
  id: string
  token: string
  role_to_grant: WorkspaceRole
  workspace_id: string
  workspace_name: string
  workspace_type: WorkspaceType
  inviter_name: string
  created_at: string
}

export interface InviteWithWorkspace extends Invite {
  workspaces: {
    name: string
    description: string | null
    workspace_type: WorkspaceType
  }
}

export interface InviteEmailParams {
  to: string
  inviterName: string
  workspaceName: string
  role: string
  inviteUrl: string
  expiresAt: string
}

export function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

export function isInviteAccepted(acceptedBy: string | null): boolean {
  return acceptedBy !== null
}

export function getInviteTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
  } else {
    return 'Less than 1 hour'
  }
}