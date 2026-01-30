'use client'

import { useState } from 'react'
import { DeleteWorkspaceModal } from './delete-workspace-modal'

interface DeleteWorkspaceButtonProps {
  workspaceId: string
  workspaceName: string
}

export function DeleteWorkspaceButton({ workspaceId, workspaceName }: DeleteWorkspaceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-sm font-medium text-danger hover:bg-danger-light border border-danger rounded-lg transition"
      >
        Delete Workspace
      </button>

      <DeleteWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
      />
    </>
  )
}