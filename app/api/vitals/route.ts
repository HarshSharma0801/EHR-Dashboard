import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/database'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '10')

    let vitals

    if (patientId) {
      vitals = await db`
        SELECT v.*, p."firstName", p."lastName" 
        FROM vital_signs v 
        JOIN patients p ON v."patientId" = p.id
        WHERE v."patientId" = ${patientId}
        ORDER BY v."recordedDate" DESC 
        LIMIT ${limit}
      `
    } else {
      vitals = await db`
        SELECT v.*, p."firstName", p."lastName" 
        FROM vital_signs v 
        JOIN patients p ON v."patientId" = p.id
        ORDER BY v."recordedDate" DESC 
        LIMIT ${limit}
      `
    }

    const formattedVitals = vitals.map(row => ({
      id: row.id,
      patientId: row.patientId,
      recordedDate: row.recordedDate,
      bloodPressureSystolic: row.bloodPressureSystolic,
      bloodPressureDiastolic: row.bloodPressureDiastolic,
      heartRate: row.heartRate,
      temperature: row.temperature,
      weight: row.weight,
      height: row.height,
      respiratoryRate: row.respiratoryRate,
      oxygenSaturation: row.oxygenSaturation,
      patient: {
        id: row.patientId,
        firstName: row.firstName,
        lastName: row.lastName
      }
    }))

    return NextResponse.json({ success: true, data: formattedVitals })
  } catch (error: any) {
    console.error('Vitals API error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch vitals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      weight,
      height,
      respiratoryRate,
      oxygenSaturation
    } = body

    if (!patientId) {
      return NextResponse.json({ success: false, error: 'Patient ID is required' }, { status: 400 })
    }

    const vitalId = randomUUID()
    const result = await db`
      INSERT INTO vital_signs (id, "patientId", "bloodPressureSystolic", "bloodPressureDiastolic", "heartRate", temperature, weight, height, "respiratoryRate", "oxygenSaturation") 
      VALUES (${vitalId}, ${patientId}, ${bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null}, ${bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null}, ${heartRate ? parseInt(heartRate) : null}, ${temperature ? parseFloat(temperature) : null}, ${weight ? parseFloat(weight) : null}, ${height ? parseFloat(height) : null}, ${respiratoryRate ? parseInt(respiratoryRate) : null}, ${oxygenSaturation ? parseInt(oxygenSaturation) : null}) 
      RETURNING *
    `

    const patientResult = await db`SELECT id, "firstName", "lastName" FROM patients WHERE id = ${patientId}`

    const vital = {
      id: result[0].id,
      patientId: result[0].patientId,
      recordedDate: result[0].recordedDate,
      bloodPressureSystolic: result[0].bloodPressureSystolic,
      bloodPressureDiastolic: result[0].bloodPressureDiastolic,
      heartRate: result[0].heartRate,
      temperature: result[0].temperature,
      weight: result[0].weight,
      height: result[0].height,
      patient: {
        id: patientResult[0].id,
        firstName: patientResult[0].firstName,
        lastName: patientResult[0].lastName
      }
    }

    return NextResponse.json({ success: true, data: vital })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create vital signs' }, { status: 500 })
  }
}