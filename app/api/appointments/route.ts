import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/database'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let appointments, total

    if (date) {
      appointments = await db`
        SELECT a.id, a."appointmentDate", a."appointmentTime", a.duration, a.type, a.status, 
               a."providerName", a.notes, p.id as "patientId", p."firstName", p."lastName", p.phone
        FROM appointments a 
        JOIN patients p ON a."patientId" = p.id
        WHERE a."appointmentDate" = ${date}
        ORDER BY a."appointmentDate" ASC, a."appointmentTime" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`
        SELECT COUNT(*) FROM appointments a WHERE a."appointmentDate" = ${date}
      `
      total = parseInt(totalResult[0].count)
    } else if (patientId) {
      appointments = await db`
        SELECT a.id, a."appointmentDate", a."appointmentTime", a.duration, a.type, a.status, 
               a."providerName", a.notes, p.id as "patientId", p."firstName", p."lastName", p.phone
        FROM appointments a 
        JOIN patients p ON a."patientId" = p.id
        WHERE a."patientId" = ${patientId}
        ORDER BY a."appointmentDate" ASC, a."appointmentTime" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`
        SELECT COUNT(*) FROM appointments a WHERE a."patientId" = ${patientId}
      `
      total = parseInt(totalResult[0].count)
    } else {
      appointments = await db`
        SELECT a.id, a."appointmentDate", a."appointmentTime", a.duration, a.type, a.status, 
               a."providerName", a.notes, p.id as "patientId", p."firstName", p."lastName", p.phone
        FROM appointments a 
        JOIN patients p ON a."patientId" = p.id
        ORDER BY a."appointmentDate" ASC, a."appointmentTime" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`SELECT COUNT(*) FROM appointments`
      total = parseInt(totalResult[0].count)
    }

    const formattedAppointments = appointments.map(row => ({
      id: row.id,
      appointmentDate: row.appointmentDate,
      appointmentTime: row.appointmentTime,
      duration: row.duration,
      type: row.type,
      status: row.status,
      providerName: row.providerName,
      notes: row.notes,
      patient: {
        id: row.patientId,
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone
      }
    }))

    return NextResponse.json({ success: true, data: formattedAppointments, total })
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

    const appointmentId = randomUUID()
    const result = await db`
      INSERT INTO appointments (id, "patientId", "providerId", "appointmentDate", "appointmentTime", duration, type, "providerName", status, "updatedAt") 
      VALUES (${appointmentId}, ${patientId}, ${providerId || 'default-provider'}, ${appointmentDate}, ${appointmentTime}, ${duration || 30}, ${type || 'Consultation'}, ${providerName || 'Dr. Smith'}, 'SCHEDULED', NOW()) 
      RETURNING *
    `

    const patientResult = await db`SELECT id, "firstName", "lastName" FROM patients WHERE id = ${patientId}`

    const appointment = {
      id: result[0].id,
      appointmentDate: result[0].appointmentDate,
      appointmentTime: result[0].appointmentTime,
      duration: result[0].duration,
      type: result[0].type,
      status: result[0].status,
      providerName: result[0].providerName,
      patient: {
        id: patientResult[0].id,
        firstName: patientResult[0].firstName,
        lastName: patientResult[0].lastName
      }
    }

    return NextResponse.json({ success: true, data: appointment })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create appointment' }, { status: 500 })
  }
}