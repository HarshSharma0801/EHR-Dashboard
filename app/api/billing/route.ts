import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (patientId) where.patientId = patientId
    
    // Map billing status to appointment status
    if (status) {
      const statusMap: { [key: string]: string } = {
        'PENDING': 'SCHEDULED',
        'PAID': 'COMPLETED',
        'OVERDUE': 'CONFIRMED'
      }
      where.status = statusMap[status.toUpperCase()] || 'SCHEDULED'
    }

    const appointments = await prisma.appointment.findMany({
      where,
      take: limit,
      orderBy: { appointmentDate: 'desc' },
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

    const billingData = appointments.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      type: appointment.type,
      duration: appointment.duration,
      providerName: appointment.providerName,
      status: appointment.status,
      amount: appointment.duration * 2.5,
      billingStatus: 'PENDING'
    }))

    return NextResponse.json({
      success: true,
      data: billingData
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}