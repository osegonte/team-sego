import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PendingInvitesBanner } from '@/components/invites/pending-invites-banner'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's workspaces
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const workspaceIds = memberships?.map(m => m.workspace_id) || []
  
  const { data: workspacesList } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)

  const workspaces = memberships?.map(membership => {
    const workspace = workspacesList?.find(w => w.id === membership.workspace_id)
    return {
      role: membership.role,
      status: membership.status,
      workspaces: workspace
    }
  }).filter(w => w.workspaces) || []

  // Fetch pending invites for this user's email
  const userEmail = user.email?.toLowerCase()
  const { data: pendingInvites } = await supabase
    .from('invites')
    .select(`
      id,
      token,
      role_to_grant,
      workspace_id,
      created_at,
      workspaces(name, workspace_type),
      profiles:created_by(display_name, username)
    `)
    .eq('invited_email', userEmail)
    .is('accepted_by', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  // Format invites for the banner
  const formattedInvites = pendingInvites?.map(invite => ({
    id: invite.id,
    token: invite.token,
    role_to_grant: invite.role_to_grant,
    workspace_id: invite.workspace_id,
    workspace_name: invite.workspaces?.name || 'Unknown Workspace',
    workspace_type: invite.workspaces?.workspace_type || 'team',
    inviter_name: invite.profiles?.display_name || invite.profiles?.username || 'Someone',
    created_at: invite.created_at
  })) || []

  // Get display name
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'

  return (
    <AppLayout user={user} workspaces={workspaces}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Pending Invites Notification Banner */}
        <PendingInvitesBanner invites={formattedInvites} />

        {/* Welcome Message */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-text-secondary">
              {workspaces.length > 0 
                ? 'Select a workspace from the sidebar to get started'
                : 'Create your first workspace to get started'}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}