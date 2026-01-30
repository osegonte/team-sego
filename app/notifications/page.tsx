import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { PendingInvitesBanner } from '@/components/invites/pending-invites-banner'

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's workspaces for sidebar
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
  
  console.log('🔍 Checking invites for email:', userEmail)
  
  const { data: pendingInvites, error: invitesError } = await supabase
    .from('invites')
    .select(`
      id,
      token,
      role_to_grant,
      workspace_id,
      created_at,
      invited_email,
      accepted_by,
      expires_at,
      created_by,
      workspaces(name, workspace_type)
    `)
    .eq('invited_email', userEmail)
    .is('accepted_by', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  
  // Fetch inviter profiles separately
  const inviterIds = pendingInvites?.map(inv => inv.created_by).filter(Boolean) || []
  const { data: inviterProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', inviterIds)

  console.log('📬 Found invites:', pendingInvites?.length || 0)
  console.log('❌ Error:', invitesError)

  // Also fetch ALL invites (including expired/accepted) for debugging
  const { data: allInvites } = await supabase
    .from('invites')
    .select(`
      id,
      invited_email,
      role_to_grant,
      accepted_by,
      expires_at,
      created_at,
      workspaces(name)
    `)
    .eq('invited_email', userEmail)
    .order('created_at', { ascending: false })

  // Format invites for the banner
  const formattedInvites = pendingInvites?.map(invite => {
    const inviterProfile = inviterProfiles?.find(p => p.id === invite.created_by)
    return {
      id: invite.id,
      token: invite.token,
      role_to_grant: invite.role_to_grant,
      workspace_id: invite.workspace_id,
      workspace_name: invite.workspaces?.name || 'Unknown Workspace',
      workspace_type: invite.workspaces?.workspace_type || 'team',
      inviter_name: inviterProfile?.display_name || inviterProfile?.username || 'Someone',
      created_at: invite.created_at
    }
  }) || []

  return (
    <AppLayout user={user} workspaces={workspaces}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold text-text-primary mb-8">Notifications</h1>

        {/* Debug Info */}
        <div className="mb-6 bg-sidebar-bg rounded-lg border border-card-border p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Debug Info</h2>
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Your Email:</strong> {userEmail}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Pending Invites Found:</strong> {pendingInvites?.length || 0}</p>
            <p><strong>Total Invites (all status):</strong> {allInvites?.length || 0}</p>
            {invitesError && (
              <p className="text-danger"><strong>Error:</strong> {invitesError.message}</p>
            )}
          </div>
        </div>

        {/* Pending Invites Banner */}
        {formattedInvites.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Invites</h2>
            <PendingInvitesBanner invites={formattedInvites} />
          </>
        ) : (
          <div className="bg-card-bg rounded-lg border border-card-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Pending Invites</h3>
            <p className="text-text-secondary">You don't have any pending workspace invitations.</p>
          </div>
        )}

        {/* All Invites History (for debugging) */}
        {allInvites && allInvites.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Invite History (Debug)</h2>
            <div className="bg-card-bg rounded-lg border border-card-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-sidebar-bg border-b border-card-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase">Workspace</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {allInvites.map((invite) => {
                    const isExpired = new Date(invite.expires_at) < new Date()
                    const isAccepted = !!invite.accepted_by
                    const isPending = !isExpired && !isAccepted
                    
                    return (
                      <tr key={invite.id} className="hover:bg-sidebar-hover">
                        <td className="px-4 py-3 text-text-primary">
                          {invite.workspaces?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary capitalize">
                          {invite.role_to_grant}
                        </td>
                        <td className="px-4 py-3">
                          {isPending && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-light text-primary">
                              ✅ Pending
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success-light text-success">
                              ✓ Accepted
                            </span>
                          )}
                          {isExpired && !isAccepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-warning-light text-warning">
                              ⏰ Expired
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-tertiary text-xs">
                          {new Date(invite.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-text-tertiary text-xs">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}