import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const supabaseAdmin = getAdminClient()

  const { data: memberships } = await supabaseAdmin
    .from('workspace_members')
    .select('workspace_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const workspaceIds = memberships?.map(m => m.workspace_id) || []
  
  const { data: workspacesList } = await supabaseAdmin
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
    .select('id')
    .eq('invited_email', userEmail)
    .is('accepted_by', null)
    .gt('expires_at', new Date().toISOString())

  const inviteCount = pendingInvites?.length || 0

  return (
    <AppLayout user={user} workspaces={workspaces}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {inviteCount > 0 && (
          <Link 
            href="/notifications"
            className="block mb-6 bg-card-bg border border-card-border rounded-lg p-4 hover:border-primary transition"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
              <span className="text-sm text-text-secondary">
                {inviteCount} pending workspace invitation{inviteCount > 1 ? 's' : ''}
              </span>
            </div>
          </Link>
        )}

        {workspaces.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-sidebar-bg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">
                No workspaces yet. Create one using the + button in the sidebar.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}