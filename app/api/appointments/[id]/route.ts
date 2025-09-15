import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const cacheKey = getCacheKey(`appointment-${appointmentId}`)
    
    return await withCache(cacheKey, async () => {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true
            }
          }
        }
      })

      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: appointment
      })
    }, 3)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const body = await request.json()
    const {
      appointmentDate,
      appointmentTime,
      duration,
      type,
      status,
      notes,
      providerName
    } = body

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        appointmentTime,
        duration,
        type,
        status: status?.toUpperCase(),
        notes,
        providerName
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

    apiCache.invalidatePattern('appointments')
    apiCache.delete(`appointment-${appointmentId}`)

    return NextResponse.json({
      success: true,
      data: appointment
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id

    await prisma.appointment.delete({
      where: { id: appointmentId }
    })

    apiCache.invalidatePattern('appointments')
    apiCache.delete(`appointment-${appointmentId}`)

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}