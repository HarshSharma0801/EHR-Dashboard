import { NextResponse } from 'next/server'
import { db, initTables } from '@/app/lib/database'

export async function GET() {
  try {
    // Initialize tables and test connection
    await initTables()
    await db`SELECT 1`
    
    // Get basic counts
    const [patientResult, appointmentResult] = await Promise.all([
      db`SELECT COUNT(*) FROM patients`,
      db`SELECT COUNT(*) FROM appointments`
    ])

    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      data: {
        patients: parseInt(patientResult[0].count),
        appointments: parseInt(appointmentResult[0].count)
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