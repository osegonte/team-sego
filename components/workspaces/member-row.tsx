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
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <span className="text-text-inverse text-sm font-semibold">
              {displayName.substring(0, 1).toUpperCase()}
            </span>
          </div>

          {/* Name & Info */}
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

        {/* Role Badge & Actions */}
        <div className="flex items-center gap-3">
          <span className={`
            px-3 py-1 rounded-lg text-xs font-medium
            ${role === 'owner' ? 'bg-purple-100 text-purple-700' : 
              role === 'admin' ? 'bg-blue-100 text-blue-700' :
              role === 'editor' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'}
          `}>
            {role}
          </span>

          {/* Actions Menu (Admin/Owner only, can't manage yourself) */}
          {canManageMembers && !isCurrentUser && (
            <MemberActionsDropdown
              onChangeRole={() => setIsChangeRoleModalOpen(true)}
              onRemove={() => setIsRemoveModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        workspaceId={workspaceId}
        membershipId={membershipId}
        memberName={displayName}
        currentRole={role}
      />

      {/* Remove Member Modal */}
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