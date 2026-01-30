'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkspace } from '@/app/actions/workspace-actions'
import type { WorkspaceType } from '@/lib/types/workspace'

interface CreateWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('team')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsCreating(true)

    const result = await createWorkspace(
      name,
      description || null,
      workspaceType
    )
    
    if ('error' in result) {
      setError(result.error)
      setIsCreating(false)
    } else if (result.data) {
      setName('')
      setDescription('')
      setWorkspaceType('team')
      
      onClose()
      router.push(`/workspace/${result.data.workspaceId}`)
      router.refresh()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-xl shadow-dropdown max-w-md w-full">
        <div className="px-6 py-4 border-b border-card-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Create Workspace</h2>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary transition"
              disabled={isCreating}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-danger-light border border-danger text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Sego Dev"
              required
              disabled={isCreating}
              className="w-full px-4 py-2 border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-card-bg text-text-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Workspace Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['personal', 'team', 'class'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWorkspaceType(type)}
                  disabled={isCreating}
                  className={`
                    px-4 py-2 rounded-lg border-2 text-sm font-medium transition
                    ${workspaceType === type
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-card-border text-text-primary hover:border-card-border-hover'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              rows={3}
              disabled={isCreating}
              className="w-full px-4 py-2 border border-card-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-card-bg text-text-primary disabled:opacity-50"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-sidebar-bg rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-sidebar-hover rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating || !name.trim()}
            className="px-4 py-2 text-sm font-medium text-text-inverse bg-primary hover:bg-primary-hover rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </div>
    </div>
  )
}