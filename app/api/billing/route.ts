import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let appointments

    // Map billing status to appointment status
    const statusMap: { [key: string]: string } = {
      'PENDING': 'SCHEDULED',
      'PAID': 'COMPLETED',
      'OVERDUE': 'CONFIRMED'
    }

    if (patientId && status) {
      const mappedStatus = statusMap[status.toUpperCase()] || 'SCHEDULED'
      appointments = await db`
        SELECT a.*, p.first_name, p.last_name, p.phone, p.email
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id
        WHERE a.patient_id = ${patientId} AND a.status = ${mappedStatus}
        ORDER BY a.appointment_date DESC 
        LIMIT ${limit}
      `
    } else if (patientId) {
      appointments = await db`
        SELECT a.*, p.first_name, p.last_name, p.phone, p.email
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id
        WHERE a.patient_id = ${patientId}
        ORDER BY a.appointment_date DESC 
        LIMIT ${limit}
      `
    } else if (status) {
      const mappedStatus = statusMap[status.toUpperCase()] || 'SCHEDULED'
      appointments = await db`
        SELECT a.*, p.first_name, p.last_name, p.phone, p.email
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id
        WHERE a.status = ${mappedStatus}
        ORDER BY a.appointment_date DESC 
        LIMIT ${limit}
      `
    } else {
      appointments = await db`
        SELECT a.*, p.first_name, p.last_name, p.phone, p.email
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id
        ORDER BY a.appointment_date DESC 
        LIMIT ${limit}
      `
    }

    const billingData = appointments.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: `${row.first_name} ${row.last_name}`,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      type: row.type,
      duration: row.duration,
      providerName: row.provider_name,
      status: row.status,
      amount: row.duration * 2.5,
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