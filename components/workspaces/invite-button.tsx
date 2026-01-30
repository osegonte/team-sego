'use client'

import { useState } from 'react'
import { InviteMemberModal } from './invite-member-modal'

interface InviteButtonProps {
  workspaceId: string
  workspaceName: string
}

export function InviteButton({ workspaceId, workspaceName }: InviteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-sidebar-hover border border-card-border rounded-lg transition"
      >
        Invite Members
      </button>

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspaceName}
      />
    </>
  )
}
