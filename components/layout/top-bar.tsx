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

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-gray-900">Dashboard</h1>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user.email?.substring(0, 1).toUpperCase()}
            </span>
          </div>
          
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {user.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-500">
              {user.app_metadata?.provider}
            </div>
          </div>

          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{user.email}</div>
              <div className="text-xs text-gray-500 mt-1">ID: {user.id.substring(0, 8)}...</div>
            </div>

            <div className="py-1">
              <button
                onClick={() => window.location.href = '/settings'}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Settings
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Profile
              </button>
            </div>

            <div className="border-t border-gray-100 py-1">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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