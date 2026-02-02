import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgContext = await getOrgContext(session.user.id)
    if (!orgContext) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id, 
        orgId: orgContext.orgId 
      },
      select: { 
        id: true, 
        name: true, 
        projectNumber: true,
        status: true,
        phase: true,
      },
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
