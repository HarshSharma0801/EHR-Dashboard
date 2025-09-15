import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const noteType = searchParams.get('noteType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (patientId) where.patientId = patientId
    if (noteType) where.noteType = noteType.toUpperCase()

    const [notes, total] = await Promise.all([
      prisma.clinicalNote.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.clinicalNote.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: notes,
      total
    })
  } catch (error: any) {
    console.error('Clinical API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch clinical notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      providerId,
      providerName,
      appointmentId,
      noteType,
      content
    } = body

    if (!patientId || !providerId || !noteType || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const note = await prisma.clinicalNote.create({
      data: {
        patientId,
        providerId,
        providerName: providerName || 'Dr. Smith',
        appointmentId,
        noteType: noteType.toUpperCase(),
        content: content.trim()
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    apiCache.invalidatePattern('clinical-notes')
    return NextResponse.json({
      success: true,
      data: note
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create clinical note' },
      { status: 500 }
    )
  }
}