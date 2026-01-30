import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .select('*, workspaces(name, description, workspace_type)')
    .eq('token', token)
    .single()

  if (error || !invite) {
    console.error('Failed to fetch invite:', error)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Invalid Invite
          </h1>
          <p className="text-text-secondary mb-6">
            This invite link is invalid or has been revoked.
          </p>
          <a href="/dashboard" className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition">
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const userEmail = user.email?.toLowerCase()
  
  if (invite.invited_email !== userEmail) {
    console.error('Email mismatch:', { invited: invite.invited_email, user: userEmail })
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg p-4">
        <div className="max-w-md w-full bg-card-bg rounded-xl shadow-card border border-card-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-warning-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Wrong Account
          </h1>
          <p className="text-text-secondary mb-6">
            This invite is for {invite.invited_email} but you are logged in as {userEmail}.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/auth/signout" className="inline-block px-6 py-2 text-sm font-medium text-text-primary bg-main-bg hover:bg-sidebar-hover border border-card-border rounded-lg transition">
              Sign Out
            </a>
            <a href="/dashboard" className="inline-block px-6 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  const { data: inviterProfile } = await supabaseAdmin
    .from('profiles')
    .select('display_name, username')
    .eq('id', invite.created_by)
    .single()

  const inviterName = inviterProfile?.display_name || inviterProfile?.username || 'Someone'
  const isExpired = new Date(invite.expires_at) < new Date()
  const isAccepted = !!invite.accepted_by

  const { data: existingMember } = await supabaseAdmin
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const isAlreadyMember = !!existingMember

  console.log('Invite page loaded:', {
    token,
    inviteId: invite.id,
    workspaceName: invite.workspaces?.name,
    userEmail,
    isExpired,
    isAccepted,
    isAlreadyMember
  })

  return (
    <AcceptInviteClient
      inviteId={invite.id}
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