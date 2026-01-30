'use server'

import { createClient as createServerClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkspace(
  name: string,
  description: string | null,
  workspaceType: 'personal' | 'team' | 'class'
) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from('workspaces')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      workspace_type: workspaceType
    })
    .select()
    .single()

  if (workspaceError) {
    console.error('Failed to create workspace:', workspaceError)
    return { error: 'Failed to create workspace' }
  }

  const { error: memberError } = await supabaseAdmin
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
      status: 'active'
    })

  if (memberError) {
    console.error('Failed to create membership:', memberError)
    await supabaseAdmin.from('workspaces').delete().eq('id', workspace.id)
    return { error: 'Failed to create workspace membership' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/workspace/${workspace.id}`)
  
  return { 
    success: true, 
    workspaceId: workspace.id,
    workspaceName: workspace.name
  }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Verify user is the owner
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('owner_id, name')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    return { error: 'Workspace not found' }
  }

  if (workspace.owner_id !== user.id) {
    return { error: 'Only the workspace owner can delete it' }
  }

  // Delete workspace (CASCADE will delete members and invites)
  const { error } = await supabaseAdmin
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  if (error) {
    console.error('Failed to delete workspace:', error)
    return { error: 'Failed to delete workspace' }
  }

  revalidatePath('/dashboard')
  return { success: true, workspaceName: workspace.name }
}