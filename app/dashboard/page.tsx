import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'

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

  return (
    <AppLayout user={user} workspaces={workspaces}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {profile?.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Select a workspace from the sidebar to get started.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {workspaces.length}
                </div>
                <div className="text-sm text-gray-600">
                  Workspaces
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  @{profile?.username}
                </div>
                <div className="text-xs text-gray-600">
                  {user.app_metadata?.provider} account
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Stage 1B
                </div>
                <div className="text-xs text-gray-600">
                  In Progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces Overview */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Workspaces</h2>
          
          {workspaces.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((membership) => {
                const workspace = membership.workspaces
                return (
                  <a key={workspace.id} href={`/workspace/${workspace.id}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-lg font-semibold">
                          {workspace.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 capitalize">
                            {workspace.workspace_type}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className={`text-xs font-medium ${membership.role === 'owner' ? 'text-purple-600' : 'text-gray-600'}`}>
                            {membership.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    {workspace.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {workspace.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Created {new Date(workspace.created_at).toLocaleDateString()}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first workspace to start organizing your projects.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}