'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateWorkspaceModal } from '../workspaces/create-workspace-modal'

interface SidebarProps {
  workspaces: any[]
  currentWorkspaceId?: string
}

export function Sidebar({ workspaces, currentWorkspaceId }: SidebarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Find current workspace or default to first one
  const currentWorkspace = workspaces.find(w => w.workspaces.id === currentWorkspaceId) || workspaces[0]
  const currentWorkspaceName = currentWorkspace?.workspaces.name || 'Team Sego'

  // Filter out current workspace from the list
  const otherWorkspaces = workspaces.filter(w => w.workspaces.id !== currentWorkspace?.workspaces.id)

  return (
    <>
      <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
        {/* Sidebar Header - Current Workspace + Plus Button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          <h1 className="text-lg font-semibold text-text-primary truncate">
            {currentWorkspaceName}
          </h1>
          
          {/* Create Workspace Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-sidebar-hover transition flex-shrink-0"
            title="Create workspace"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto py-4">
          {otherWorkspaces.length > 0 && (
            <>
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Workspaces
                </h2>
              </div>

              <nav className="space-y-1 px-2">
                {otherWorkspaces.map((workspace) => (
                  <Link
                    key={workspace.workspaces.id}
                    href={`/workspace/${workspace.workspaces.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-sidebar-hover transition"
                  >
                    {/* Workspace Icon */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold bg-gray-100 text-text-secondary">
                      {workspace.workspaces.name.substring(0, 2).toUpperCase()}
                    </div>
                    
                    {/* Workspace Name */}
                    <div className="flex-1 min-w-0 truncate">
                      {workspace.workspaces.name}
                    </div>

                    {/* Role Badge (owner only) */}
                    {workspace.role === 'owner' && (
                      <span className="text-xs text-text-tertiary">★</span>
                    )}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </aside>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}