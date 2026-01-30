export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type WorkspaceType = 'personal' | 'team' | 'class'
export type MembershipStatus = 'active' | 'inactive'

export const WORKSPACE_ROLES: Record<WorkspaceRole, { label: string; description: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full control over workspace settings, members, and content'
  },
  admin: {
    label: 'Admin',
    description: 'Manage members, projects, and workspace settings'
  },
  editor: {
    label: 'Editor',
    description: 'Create and edit projects and content'
  },
  viewer: {
    label: 'Viewer',
    description: 'View projects and content (read-only)'
  }
}

export interface Workspace {
  id: string
  name: string
  description: string | null
  workspace_type: WorkspaceType
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  status: MembershipStatus
  joined_at: string
}

export interface WorkspaceMemberWithProfile extends WorkspaceMember {
  profiles: {
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export interface UserProfile {
  id: string
  email: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return role === 'owner' || role === 'admin'
}

export function canDeleteWorkspace(role: WorkspaceRole): boolean {
  return role === 'owner'
}

export function getDisplayName(profile: Partial<UserProfile> | null, fallback: string = 'Unknown User'): string {
  if (!profile) return fallback
  return profile.display_name || profile.username || fallback
}