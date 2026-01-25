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

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Team Sego</h1>
        </div>

        {/* Workspaces Section */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-gray-400 hover:text-gray-600 transition"
                title="Create workspace"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Workspace List */}
          <nav className="space-y-1 px-2">
            {workspaces.map((workspace) => {
              const isActive = workspace.workspaces.id === currentWorkspaceId
              
              return (
                <Link
                  key={workspace.workspaces.id}
                  href={`/workspace/${workspace.workspaces.id}`}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {/* Workspace Icon */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {workspace.workspaces.name.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Workspace Name & Type */}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{workspace.workspaces.name}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {workspace.workspaces.workspace_type}
                    </div>
                  </div>

                  {/* Role Badge */}
                  {workspace.role === 'owner' && (
                    <span className="text-xs text-gray-400">★</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Coming Soon Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Stage 1B - Workspaces
          </div>
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