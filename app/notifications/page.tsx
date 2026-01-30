import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { InvitesList } from '@/components/invites/invites-list'

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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

  const userEmail = user.email?.toLowerCase()
  
  const { data: pendingInvites } = await supabase
    .from('invites')
    .select(`
      id,
      token,
      role_to_grant,
      workspace_id,
      created_at,
      created_by,
      workspaces!inner(name, workspace_type)
    `)
    .eq('invited_email', userEmail)
    .is('accepted_by', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  const inviterIds = pendingInvites?.map(inv => inv.created_by).filter(Boolean) || []
  const { data: inviterProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', inviterIds)

  const formattedInvites = pendingInvites?.map(invite => {
    const inviterProfile = inviterProfiles?.find(p => p.id === invite.created_by)
    const workspace = Array.isArray(invite.workspaces) ? invite.workspaces[0] : invite.workspaces
    
    return {
      id: invite.id,
      token: invite.token,
      role_to_grant: invite.role_to_grant,
      workspace_id: invite.workspace_id,
      workspace_name: workspace?.name || 'Unknown Workspace',
      workspace_type: workspace?.workspace_type || 'team',
      inviter_name: inviterProfile?.display_name || inviterProfile?.username || 'Someone',
      created_at: invite.created_at
    }
  }) || []

  return (
    <AppLayout user={user} workspaces={workspaces}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">Notifications</h1>

        {formattedInvites.length > 0 ? (
          <div className="bg-card-bg rounded-lg border border-card-border">
            <div className="px-6 py-4 border-b border-card-border">
              <h2 className="text-sm font-medium text-text-primary">
                Pending Invitations ({formattedInvites.length})
              </h2>
            </div>
            <InvitesList invites={formattedInvites} />
          </div>
        ) : (
          <div className="bg-card-bg rounded-lg border border-card-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">No pending invitations.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}