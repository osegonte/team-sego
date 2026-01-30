'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreateWorkspaceModal } from '../workspaces/create-workspace-modal'

interface SidebarProps {
  workspaces: any[]
  currentWorkspaceId?: string
}

export function Sidebar({ workspaces, currentWorkspaceId }: SidebarProps) {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentWorkspace = workspaces.find(w => w.workspaces.id === currentWorkspaceId)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWorkspaceSwitcherOpen(false)
      }
    }
    
    if (isWorkspaceSwitcherOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isWorkspaceSwitcherOpen])

  return (
    <>
      <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
        <div className="border-b border-sidebar-border">
          <div className="h-14 flex items-center justify-between px-4">
            <Link href="/dashboard" className="text-lg font-semibold text-text-primary hover:text-primary transition">
              Team Sego
            </Link>
          </div>

          {currentWorkspace && (
            <div className="px-2 pb-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition text-left"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-text-inverse text-xs font-semibold flex-shrink-0">
                    {currentWorkspace.workspaces.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {currentWorkspace.workspaces.name}
                  </span>
                </div>
                <svg 
                  className={`w-4 h-4 text-text-tertiary transition-transform flex-shrink-0 ${isWorkspaceSwitcherOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isWorkspaceSwitcherOpen && (
                <div className="absolute top-full left-2 right-2 mt-1 bg-card-bg rounded-lg shadow-dropdown border border-card-border py-1 z-50 max-h-80 overflow-y-auto">
                  {workspaces.map((workspace) => {
                    const isActive = workspace.workspaces.id === currentWorkspaceId
                    
                    return (
                      <button
                        key={workspace.workspaces.id}
                        onClick={() => {
                          router.push(`/workspace/${workspace.workspaces.id}`)
                          setIsWorkspaceSwitcherOpen(false)
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-sidebar-hover transition text-left
                          ${isActive ? 'bg-primary-light' : ''}
                        `}
                      >
                        <div className={`
                          w-6 h-6 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0
                          ${isActive ? 'bg-primary text-text-inverse' : 'bg-sidebar-bg text-text-secondary'}
                        `}>
                          {workspace.workspaces.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium text-text-primary">
                            {workspace.workspaces.name}
                          </div>
                          <div className="text-xs text-text-tertiary capitalize">
                            {workspace.role}
                          </div>
                        </div>
                        {workspace.role === 'owner' && (
                          <span className="text-xs text-text-tertiary flex-shrink-0">★</span>
                        )}
                      </button>
                    )
                  })}

                  <div className="border-t border-card-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsWorkspaceSwitcherOpen(false)
                        setIsCreateModalOpen(true)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-sidebar-hover transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {currentWorkspace ? (
            <>
              <div className="px-3 mb-2">
                <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Projects
                </h2>
              </div>

              <div className="px-2">
                <div className="px-3 py-8 text-center text-xs text-text-tertiary">
                  Projects coming in Stage 2
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 text-center">
              <p className="text-sm text-text-tertiary mb-4">No workspace selected</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                Create your first workspace
              </button>
            </div>
          )}
        </div>
      </aside>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}
