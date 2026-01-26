'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changeMemberRole(
  workspaceId: string,
  membershipId: string,
  newRole: 'owner' | 'admin' | 'editor' | 'viewer'
) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user can manage members
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

  // Get the member being changed
  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  // Can't change your own role
  if (targetMember.user_id === user.id) {
    return { error: 'You cannot change your own role' }
  }

  // If removing owner role, check there's another owner
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

  // Update the role
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}

export async function removeMember(workspaceId: string, membershipId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user can manage members
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

  // Get the member being removed
  const { data: targetMember } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  // Can't remove yourself
  if (targetMember.user_id === user.id) {
    return { error: 'You cannot remove yourself from the workspace' }
  }

  // If removing an owner, check there's another owner
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

  // Remove the member (set status to inactive instead of deleting)
  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'inactive' })
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}