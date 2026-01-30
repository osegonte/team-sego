'use client'

import { useState } from 'react'
import { MemberActionsDropdown } from './member-actions-dropdown'
import { ChangeRoleModal } from './change-role-modal'
import { RemoveMemberModal } from './remove-member-modal'

interface MemberRowProps {
  membershipId: string
  workspaceId: string
  displayName: string
  joinedAt: string
  role: string
  isCurrentUser: boolean
  canManageMembers: boolean
}

export function MemberRow({
  membershipId,
  workspaceId,
  displayName,
  joinedAt,
  role,
  isCurrentUser,
  canManageMembers,
}: MemberRowProps) {
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)

  return (
    <>
      <div className="px-6 py-4 flex items-center justify-between hover:bg-sidebar-hover transition">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <span className="text-text-inverse text-sm font-semibold">
              {displayName.substring(0, 1).toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">
                {displayName}
              </span>
              {isCurrentUser && (
                <span className="text-xs text-text-tertiary">(you)</span>
              )}
            </div>
            <div className="text-xs text-text-tertiary">
              Joined {new Date(joinedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-xs bg-sidebar-bg text-text-secondary border border-card-border">
            {role}
          </span>

          {canManageMembers && !isCurrentUser && (
            <MemberActionsDropdown
              onChangeRole={() => setIsChangeRoleModalOpen(true)}
              onRemove={() => setIsRemoveModalOpen(true)}
            />
          )}
        </div>
      </div>

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        workspaceId={workspaceId}
        membershipId={membershipId}
        memberName={displayName}
        currentRole={role}
      />

      <RemoveMemberModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        workspaceId={workspaceId}
        membershipId={membershipId}
        memberName={displayName}
      />
    </>
  )
}