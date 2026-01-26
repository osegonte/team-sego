'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function createInvite(
  workspaceId: string,
  email: string,
  role: 'owner' | 'admin' | 'editor' | 'viewer'
) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if current user can invite (admin or owner)
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

  // Check if a user with this email exists and is already a member
  const normalizedEmail = email.toLowerCase().trim()
  
  // First, get the user ID for this email (if they exist)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  // If user exists, check if they're already a member
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

  // Check if there's already a pending invite for this email
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

  // Generate unique token
  const token = randomBytes(32).toString('hex')

  // Create invite (expires in 7 days)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invite, error } = await supabase
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
    return { error: error.message }
  }

  // Generate invite URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${token}`

  revalidatePath(`/workspace/${workspaceId}`)
  
  return { 
    success: true, 
    inviteUrl,
    token 
  }
}

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', requiresLogin: true }
  }

  // Get invite
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('*, workspaces(name)')
    .eq('token', token)
    .single()

  if (inviteError || !invite) {
    return { error: 'Invite not found or invalid' }
  }

  // Check if already accepted
  if (invite.accepted_by) {
    return { error: 'This invite has already been used' }
  }

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return { error: 'This invite has expired' }
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (existingMember) {
    return { 
      error: 'You are already a member of this workspace',
      workspaceId: invite.workspace_id 
    }
  }

  // Create membership
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role_to_grant,
      status: 'active',
    })

  if (memberError) {
    return { error: memberError.message }
  }

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from('invites')
    .update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('token', token)

  if (updateError) {
    console.error('Error updating invite:', updateError)
  }

  return { 
    success: true, 
    workspaceId: invite.workspace_id,
    workspaceName: invite.workspaces?.name 
  }
}