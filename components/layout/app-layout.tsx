'use client'

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'

interface AppLayoutProps {
  children: ReactNode
  user: any
  workspaces: any[]
  currentWorkspaceId?: string
}

export function AppLayout({ children, user, workspaces, currentWorkspaceId }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        workspaces={workspaces} 
        currentWorkspaceId={currentWorkspaceId}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopBar user={user} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}