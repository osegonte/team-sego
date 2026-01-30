'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/lib/types/actions'
import type { WorkspaceType } from '@/lib/types/workspace'

export async function createWorkspace(
  name: string,
  description: string | null,
  workspaceType: WorkspaceType
): Promise<ActionResult<{ workspaceId: string; workspaceName: string }>> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const supabaseAdmin = getAdminClient()

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
    console.error('[createWorkspace]', workspaceError)
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
    console.error('[createWorkspace] Membership creation failed:', memberError)
    await supabaseAdmin.from('workspaces').delete().eq('id', workspace.id)
    return { error: 'Failed to create workspace membership' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/workspace/${workspace.id}`)
  
  return { 
    success: true, 
    data: {
      workspaceId: workspace.id,
      workspaceName: workspace.name
    }
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<ActionResult<{ workspaceName: string }>> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const supabaseAdmin = getAdminClient()

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

  const { error } = await supabaseAdmin
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)

  if (error) {
    console.error('[deleteWorkspace]', error)
    return { error: 'Failed to delete workspace' }
  }

  revalidatePath('/dashboard')
  return { success: true, data: { workspaceName: workspace.name } }
}