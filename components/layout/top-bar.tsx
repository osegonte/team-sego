'use client'

import { useState, useRef, useEffect } from 'react'

interface TopBarProps {
  user: any
}

export function TopBar({ user }: TopBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Extract display name
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <header className="h-14 bg-card-bg border-b border-card-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-sm font-medium text-text-primary">Dashboard</h1>
        
        {/* Notifications Link */}
        <a 
          href="/notifications"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-sm font-medium">Notifications</span>
        </a>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-hover transition"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <span className="text-text-inverse text-sm font-semibold">
              {displayName.substring(0, 1).toUpperCase()}
            </span>
          </div>
          
          {/* Name only - no provider */}
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-text-primary">
              {displayName}
            </div>
          </div>

          {/* Dropdown arrow */}
          <svg 
            className={`w-4 h-4 text-text-tertiary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-card-bg rounded-lg shadow-dropdown border border-card-border py-1 z-50">
            <div className="px-4 py-3 border-b border-card-border">
              <div className="text-sm font-medium text-text-primary">{user.email}</div>
              <div className="text-xs text-text-tertiary mt-1">ID: {user.id.substring(0, 8)}...</div>
            </div>

            <div className="py-1">
              <button
                onClick={() => window.location.href = '/settings'}
                className="w-full text-left block px-4 py-2 text-sm text-text-primary hover:bg-sidebar-hover transition"
              >
                Settings
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-full text-left block px-4 py-2 text-sm text-text-primary hover:bg-sidebar-hover transition"
              >
                Profile
              </button>
            </div>

            <div className="border-t border-card-border py-1">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-light transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}