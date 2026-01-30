'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types/actions'
import type { WorkspaceRole } from '@/lib/types/workspace'

export async function changeMemberRole(
  workspaceId: string,
  membershipId: string,
  newRole: WorkspaceRole
): Promise<ActionResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUserMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!currentUserMembership || (currentUserMembership.role !== 'owner' && currentUserMembership.role !== 'admin')) {
    return { error: 'Permission denied' }
  }

  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  if (targetMember.user_id === user.id) {
    return { error: 'You cannot change your own role' }
  }

  if (targetMember.role === 'owner' && newRole !== 'owner') {
    const { data: owners } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner')
      .eq('status', 'active')

    if (owners && owners.length <= 1) {
      return { error: 'Cannot change role: workspace must have at least one owner' }
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[changeMemberRole]', error)
    return { error: 'Failed to change role' }
  }

  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}

export async function removeMember(
  workspaceId: string,
  membershipId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentUserMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!currentUserMembership || (currentUserMembership.role !== 'owner' && currentUserMembership.role !== 'admin')) {
    return { error: 'Permission denied' }
  }

  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  if (targetMember.user_id === user.id) {
    return { error: 'You cannot remove yourself from the workspace' }
  }

  if (targetMember.role === 'owner') {
    const { data: owners } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner')
      .eq('status', 'active')

    if (owners && owners.length <= 1) {
      return { error: 'Cannot remove: workspace must have at least one owner' }
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'inactive' })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[removeMember]', error)
    return { error: 'Failed to remove member' }
  }

  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}