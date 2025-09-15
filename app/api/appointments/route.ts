import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      where.appointmentDate = { gte: targetDate, lt: nextDay }
    }

    if (patientId) where.patientId = patientId
    if (status) where.status = status.toUpperCase()

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
        select: {
          id: true,
          appointmentDate: true,
          appointmentTime: true,
          duration: true,
          type: true,
          status: true,
          providerName: true,
          notes: true,
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          }
        }
      }),
      prisma.appointment.count({ where })
    ])

    return NextResponse.json({ success: true, data: appointments, total })
  } catch (error: any) {
    console.error('Appointments API error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, appointmentDate, appointmentTime, duration, type, providerName, providerId } = body

    if (!patientId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        providerId: providerId || 'default-provider',
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration: duration || 30,
        type: type || 'Consultation',
        providerName: providerName || 'Dr. Smith',
        status: 'SCHEDULED'
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        duration: true,
        type: true,
        status: true,
        providerName: true,
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
    return NextResponse.json({ success: true, data: appointment })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create appointment' }, { status: 500 })
  }
}