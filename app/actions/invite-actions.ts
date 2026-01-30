'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '@/lib/email'

// Service role client for privileged operations (bypasses RLS)
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createInvite(
  workspaceId: string,
  email: string,
  role: 'owner' | 'admin' | 'editor' | 'viewer'
) {
  const supabase = await createClient()
  const supabaseAdmin = getServiceClient()
  
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

  // Use service role to bypass RLS
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
    console.error('Failed to create invite:', error)
    return { error: error.message }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/${token}`

  // Get inviter name for email
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user.id)
    .single()

  const inviterName = inviterProfile?.display_name || inviterProfile?.username || user.email?.split('@')[0] || 'Someone'

  // Get workspace name for email
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single()

  // Send email invitation
  const emailResult = await sendInviteEmail({
    to: normalizedEmail,
    inviterName,
    workspaceName: workspace?.name || 'a workspace',
    role,
    inviteUrl,
    expiresAt: expiresAt.toISOString(),
  })

  if (emailResult.error) {
    console.error('⚠️ Failed to send invite email:', emailResult.error)
    // Don't fail the whole invite if email fails - user can still see in-app notification
  } else {
    console.log('✅ Invite email sent successfully to:', normalizedEmail)
  }

  revalidatePath(`/workspace/${workspaceId}`)
  revalidatePath('/dashboard')
  revalidatePath('/notifications')
  
  return { 
    success: true, 
    inviteUrl,
    token,
    emailSent: !emailResult.error 
  }
}

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const supabaseAdmin = getServiceClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', requiresLogin: true }
  }

  // Get invite (use regular client for SELECT - RLS allows this)
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

  // Verify invite is for this user's email
  const userEmail = user.email?.toLowerCase()
  if (invite.invited_email !== userEmail) {
    return { error: 'This invite is not for your email address' }
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

  // Create membership using service role (bypasses RLS)
  const { error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role_to_grant,
      status: 'active',
    })

  if (memberError) {
    console.error('Failed to create membership:', memberError)
    return { error: 'Failed to accept invite. Please try again.' }
  }

  // Mark invite as accepted using service role
  const { error: updateError } = await supabaseAdmin
    .from('invites')
    .update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('token', token)

  if (updateError) {
    console.error('Error updating invite:', updateError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/notifications')
  revalidatePath(`/workspace/${invite.workspace_id}`)

  return { 
    success: true, 
    workspaceId: invite.workspace_id,
    workspaceName: invite.workspaces?.name 
  }
}

export async function declineInvite(inviteId: string) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get invite to verify it belongs to this user's email
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('invited_email, workspace_id')
    .eq('id', inviteId)
    .single()

  if (inviteError || !invite) {
    return { error: 'Invite not found' }
  }

  // Verify the invite is for this user's email
  const userEmail = user.email?.toLowerCase()
  if (invite.invited_email !== userEmail) {
    return { error: 'This invite is not for your email address' }
  }

  // Delete the invite (RLS allows this)
  const { error: deleteError } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId)

  if (deleteError) {
    console.error('Failed to decline invite:', deleteError)
    return { error: 'Failed to decline invite' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/notifications')

  return { success: true }
}