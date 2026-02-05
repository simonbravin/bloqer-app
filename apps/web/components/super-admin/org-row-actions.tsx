'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, Ban, CheckCircle, Eye } from 'lucide-react'
import { toggleOrganizationBlock } from '@/app/actions/super-admin'

type OrgWithCount = {
  id: string
  name: string
  slug: string
  isBlocked: boolean
  _count: { members: number; projects: number }
}

export function OrgRowActions({ org }: { org: OrgWithCount }) {
  const router = useRouter()
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleToggleBlock(block: boolean, reason?: string) {
    setLoading(true)
    try {
      const res = await toggleOrganizationBlock(org.id, block, reason)
      if (res.success) {
        setBlockOpen(false)
        setBlockReason('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          {org.isBlocked ? (
            <DropdownMenuItem
              onClick={() => handleToggleBlock(false)}
              disabled={loading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Unblock
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setBlockOpen(true)}>
              <Ban className="mr-2 h-4 w-4" />
              Block
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block organization</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking &quot;{org.name}&quot; will prevent all members from accessing the
              organization. You can unblock later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="block-reason">Reason (optional)</Label>
            <Input
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Payment overdue"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleToggleBlock(true, blockReason || undefined)}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
