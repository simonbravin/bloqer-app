'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

type UserMenuProps = {
  userName: string
}

export function UserMenu({ userName }: UserMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {userName}
      </span>
      <Button
        type="button"
        variant="outline"
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Sign out
      </Button>
    </div>
  )
}
