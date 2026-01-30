import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AcceptInviteClient } from '@/components/invites/accept-invite-client'

export default async function InvitePage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params
  
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/invite/${token}`)
  }

  // Fetch invite with workspace info
  const { data: invite, error } = await supabase
    .from('invites')
    .select(`
      *,
      workspaces (
        name,
        description,
        workspace_type
      )
    `)
    .eq('token', token)
    .single()

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Invalid Invite</h1>
          <p className="text-text-secondary mb-6">
            This invite link is invalid or has been revoked.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Fetch inviter profile separately
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', invite.created_by)
    .single()

  const inviterName = inviterProfile?.display_name || inviterProfile?.username || 'Someone'

  const isExpired = new Date(invite.expires_at) < new Date()
  const isAccepted = !!invite.accepted_by

  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const isAlreadyMember = !!existingMember

  return (
    <AcceptInviteClient
      token={token}
      workspaceName={invite.workspaces?.name || 'Unknown Workspace'}
      workspaceDescription={invite.workspaces?.description}
      workspaceType={invite.workspaces?.workspace_type}
      role={invite.role_to_grant}
      inviterName={inviterName}
      isExpired={isExpired}
      isAccepted={isAccepted}
      isAlreadyMember={isAlreadyMember}
      workspaceId={invite.workspace_id}
    />
  )
}