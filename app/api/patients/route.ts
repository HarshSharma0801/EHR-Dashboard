import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/database'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let patients, total
    
    if (search) {
      const searchPattern = `%${search}%`
      patients = await db`
        SELECT id, "firstName", "lastName", "dateOfBirth", gender, phone, email, "addressCity", "addressState" 
        FROM patients 
        WHERE ("firstName" ILIKE ${searchPattern} OR "lastName" ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
        ORDER BY "lastName" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`
        SELECT COUNT(*) FROM patients 
        WHERE ("firstName" ILIKE ${searchPattern} OR "lastName" ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      `
      total = parseInt(totalResult[0].count)
    } else {
      patients = await db`
        SELECT id, "firstName", "lastName", "dateOfBirth", gender, phone, email, "addressCity", "addressState" 
        FROM patients 
        ORDER BY "lastName" ASC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`SELECT COUNT(*) FROM patients`
      total = parseInt(totalResult[0].count)
    }
    
    const formattedPatients = patients.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      dateOfBirth: row.dateOfBirth,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      addressCity: row.addressCity,
      addressState: row.addressState
    }))
    
    return NextResponse.json({ success: true, data: formattedPatients, total })
  } catch (error: any) {
    console.error('Patients API error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, phone, email, address } = body

    if (!firstName || !lastName || !dateOfBirth) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const patientId = randomUUID()
    const result = await db`
      INSERT INTO patients (id, "firstName", "lastName", "dateOfBirth", gender, phone, email, "addressStreet", "addressCity", "addressState", "addressZip", "updatedAt") 
      VALUES (${patientId}, ${firstName.trim()}, ${lastName.trim()}, ${dateOfBirth}, ${gender?.toUpperCase() || 'OTHER'}, ${phone?.trim()}, ${email?.trim()}, ${address?.street?.trim()}, ${address?.city?.trim()}, ${address?.state?.trim()}, ${address?.zipCode?.trim()}, NOW()) 
      RETURNING *
    `

    const patient = {
      id: result[0].id,
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      dateOfBirth: result[0].dateOfBirth,
      gender: result[0].gender,
      phone: result[0].phone,
      email: result[0].email
    }

    return NextResponse.json({ success: true, data: patient })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create patient' }, { status: 500 })
  }
}