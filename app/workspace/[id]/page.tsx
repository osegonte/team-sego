import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { MemberRow } from '@/components/workspaces/member-row'
import { InviteButton } from '@/components/workspaces/invite-button'

export default async function WorkspacePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = getAdminClient()

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (workspaceError || !workspace) {
    redirect('/dashboard')
  }

  const { data: membership } = await supabaseAdmin
    .from('workspace_members')
    .select('role, status')
    .eq('workspace_id', id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    redirect('/dashboard')
  }

  const { data: members } = await supabaseAdmin
    .from('workspace_members')
    .select(`
      id,
      role,
      status,
      joined_at,
      user_id,
      profiles:user_id (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq('workspace_id', id)
    .eq('status', 'active')

  console.log('[workspace] ID:', id)
  console.log('[workspace] Members count:', members?.length || 0)
  console.log('[workspace] Members data:', JSON.stringify(members, null, 2))

  const { data: allMemberships } = await supabaseAdmin
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const workspaceIds = allMemberships?.map(m => m.workspace_id) || []
  
  const { data: workspacesList } = await supabaseAdmin
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)

  const workspaces = allMemberships?.map(m => {
    const ws = workspacesList?.find(w => w.id === m.workspace_id)
    return {
      role: m.role,
      status: m.status,
      workspaces: ws
    }
  }).filter(w => w.workspaces) || []

  const isOwner = membership.role === 'owner'
  const isAdmin = membership.role === 'admin' || isOwner
  const canManageMembers = isAdmin

  const memberCount = members?.length || 0

  return (
    <AppLayout user={user} workspaces={workspaces} currentWorkspaceId={id}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-text-primary mb-2">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="text-text-secondary">
              {workspace.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-text-tertiary mt-4">
            <span className="capitalize">{workspace.workspace_type}</span>
            <span>•</span>
            <span className="capitalize font-medium text-text-secondary">
              Your role: {membership.role}
            </span>
            <span>•</span>
            <span>Created {new Date(workspace.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="bg-card-bg rounded-lg border border-card-border">
          <div className="px-6 py-4 border-b border-card-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Members ({memberCount})
              </h2>
              
              {canManageMembers && (
                <InviteButton workspaceId={id} workspaceName={workspace.name} />
              )}
            </div>
          </div>

          <div className="divide-y divide-card-border">
            {memberCount > 0 ? (
              members.map((member: any) => {
                const profile = member.profiles
                const displayName = profile?.display_name || profile?.username || 'Unknown User'
                const isCurrentUser = member.user_id === user.id

                return (
                  <MemberRow
                    key={member.id}
                    membershipId={member.id}
                    workspaceId={id}
                    displayName={displayName}
                    joinedAt={member.joined_at}
                    role={member.role}
                    isCurrentUser={isCurrentUser}
                    canManageMembers={canManageMembers}
                  />
                )
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-text-secondary">This workspace is ready for members.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}