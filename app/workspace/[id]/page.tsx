import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { MemberRow } from '@/components/workspaces/member-row'
import { InviteButton } from '@/components/workspaces/invite-button'

export default async function WorkspacePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params in Next.js 16+
  const { id } = await params
  
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (workspaceError || !workspace) {
    redirect('/dashboard')
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role, status')
    .eq('workspace_id', id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    // Not a member - redirect
    redirect('/dashboard')
  }

  // Fetch all members
  const { data: members } = await supabase
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

  // Fetch all user's workspaces for sidebar
  const { data: allMemberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const workspaceIds = allMemberships?.map(m => m.workspace_id) || []
  
  const { data: workspacesList } = await supabase
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

  return (
    <AppLayout user={user} workspaces={workspaces} currentWorkspaceId={id}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Workspace Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-text-primary mb-2">
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-text-secondary">
                  {workspace.description}
                </p>
              )}
            </div>

            {/* Settings Button (Owner Only) */}
            {isOwner && (
              <button className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded-lg transition">
                Settings
              </button>
            )}
          </div>

          {/* Workspace Info */}
          <div className="flex items-center gap-4 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <span className="capitalize">{workspace.workspace_type}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span className="capitalize font-medium text-text-secondary">Your role: {membership.role}</span>
            </div>
            <span>•</span>
            <div>
              Created {new Date(workspace.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-card-bg rounded-lg border border-card-border">
          <div className="px-6 py-4 border-b border-card-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Members ({members?.length || 0})
              </h2>
              
              {/* Invite Button (Admin/Owner Only) */}
              {canManageMembers && (
                <InviteButton workspaceId={id} workspaceName={workspace.name} />
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-card-border">
            {members && members.length > 0 ? (
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
                <p className="text-text-tertiary">No members yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Coming Soon Sections */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Projects Section - Coming in Stage 2 */}
          <div className="bg-card-bg rounded-lg border border-card-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Projects</h3>
            <p className="text-xs text-text-tertiary">Coming in Stage 2</p>
          </div>

          {/* Activity Section - Coming Later */}
          <div className="bg-card-bg rounded-lg border border-card-border p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Recent Activity</h3>
            <p className="text-xs text-text-tertiary">Coming soon</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}