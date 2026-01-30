'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '@/lib/email'
import type { ActionResult } from '@/lib/types/actions'
import type { WorkspaceRole } from '@/lib/types/workspace'

export async function createInvite(
  workspaceId: string,
  email: string,
  role: WorkspaceRole
): Promise<ActionResult<{ inviteUrl: string; token: string; emailSent: boolean }>> {
  const supabase = await createClient()
  const supabaseAdmin = getAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return { error: 'Permission denied' }
  }

  const normalizedEmail = email.toLowerCase().trim()
  
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  if (existingProfile) {
    const { data: existingMembership } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', existingProfile.id)
      .eq('status', 'active')
      .single()

    if (existingMembership) {
      return { error: 'This user is already a member of this workspace' }
    }
  }

  const { data: existingInvite } = await supabase
    .from('invites')
    .select('id, expires_at, accepted_by')
    .eq('workspace_id', workspaceId)
    .eq('invited_email', normalizedEmail)
    .is('accepted_by', null)
    .single()

  if (existingInvite) {
    const isExpired = new Date(existingInvite.expires_at) < new Date()
    if (!isExpired) {
      return { error: 'An invite has already been sent to this email' }
    }
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .insert({
      workspace_id: workspaceId,
      invited_email: normalizedEmail,
      role_to_grant: role,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[createInvite]', error)
    return { error: 'Failed to create invite' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${token}`

  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .single()

  const inviterName = inviterProfile?.display_name || inviterProfile?.username || user.email?.split('@')[0] || 'Someone'

  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single()

  const emailResult = await sendInviteEmail({
    to: normalizedEmail,
    inviterName,
    workspaceName: workspace?.name || 'a workspace',
    role,
    inviteUrl,
    expiresAt: expiresAt.toISOString(),
  })

  if (emailResult.error) {
    console.error('[createInvite] Email failed:', emailResult.error)
  }

  revalidatePath(`/workspace/${workspaceId}`)
  revalidatePath('/dashboard')
  revalidatePath('/notifications')
  
  return { 
    success: true, 
    data: {
      inviteUrl,
      token,
      emailSent: !emailResult.error
    }
  }
}

export async function acceptInvite(token: string): Promise<ActionResult<{ workspaceId: string; workspaceName: string | null }>> {
  const supabase = await createClient()
  const supabaseAdmin = getAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invites')
    .select('*, workspaces(name)')
    .eq('token', token)
    .single()

  if (inviteError || !invite) {
    console.error('[acceptInvite]', inviteError)
    return { error: 'Invite not found or invalid' }
  }

  if (invite.accepted_by) {
    return { error: 'This invite has already been used' }
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: 'This invite has expired' }
  }

  const userEmail = user.email?.toLowerCase()
  if (invite.invited_email !== userEmail) {
    return { error: 'This invite is not for your email address' }
  }

  const { data: existingMember } = await supabaseAdmin
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (existingMember) {
    return { 
      error: 'You are already a member of this workspace'
    }
  }

  const { error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role_to_grant,
      status: 'active',
    })

  if (memberError) {
    console.error('[acceptInvite] Membership creation failed:', memberError)
    return { error: 'Failed to accept invite' }
  }

  await supabaseAdmin
    .from('invites')
    .update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('token', token)

  revalidatePath('/dashboard')
  revalidatePath('/notifications')
  revalidatePath(`/workspace/${invite.workspace_id}`)

  return { 
    success: true, 
    data: {
      workspaceId: invite.workspace_id,
      workspaceName: invite.workspaces?.name || null
    }
  }
}

export async function declineInvite(inviteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('invited_email')
    .eq('id', inviteId)
    .single()

  if (inviteError || !invite) {
    return { error: 'Invite not found' }
  }

  const userEmail = user.email?.toLowerCase()
  if (invite.invited_email !== userEmail) {
    return { error: 'This invite is not for your email address' }
  }

  const { error: deleteError } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId)

  if (deleteError) {
    console.error('[declineInvite]', deleteError)
    return { error: 'Failed to decline invite' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/notifications')

  return { success: true }
}

