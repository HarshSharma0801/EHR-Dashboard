import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic counts
    const [patientCount, appointmentCount] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count()
    ])

    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      data: {
        patients: patientCount,
        appointments: appointmentCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}