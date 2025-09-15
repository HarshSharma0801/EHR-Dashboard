import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/database'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const noteType = searchParams.get('noteType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let notes, total

    if (patientId && noteType) {
      notes = await db`
        SELECT c.*, p."firstName", p."lastName" 
        FROM clinical_notes c 
        JOIN patients p ON c."patientId" = p.id
        WHERE c."patientId" = ${patientId} AND c."noteType" = ${noteType.toUpperCase()}
        ORDER BY c."createdAt" DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`
        SELECT COUNT(*) FROM clinical_notes c 
        WHERE c."patientId" = ${patientId} AND c."noteType" = ${noteType.toUpperCase()}
      `
      total = parseInt(totalResult[0].count)
    } else if (patientId) {
      notes = await db`
        SELECT c.*, p."firstName", p."lastName" 
        FROM clinical_notes c 
        JOIN patients p ON c."patientId" = p.id
        WHERE c."patientId" = ${patientId}
        ORDER BY c."createdAt" DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`
        SELECT COUNT(*) FROM clinical_notes c WHERE c."patientId" = ${patientId}
      `
      total = parseInt(totalResult[0].count)
    } else {
      notes = await db`
        SELECT c.*, p."firstName", p."lastName" 
        FROM clinical_notes c 
        JOIN patients p ON c."patientId" = p.id
        ORDER BY c."createdAt" DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
      const totalResult = await db`SELECT COUNT(*) FROM clinical_notes`
      total = parseInt(totalResult[0].count)
    }

    const formattedNotes = notes.map(row => ({
      id: row.id,
      patientId: row.patientId,
      providerId: row.providerId,
      providerName: row.providerName,
      appointmentId: row.appointmentId,
      noteType: row.noteType,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      patient: {
        id: row.patientId,
        firstName: row.firstName,
        lastName: row.lastName
      }
    }))

    return NextResponse.json({
      success: true,
      data: formattedNotes,
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

    const noteId = randomUUID()
    const result = await db`
      INSERT INTO clinical_notes (id, "patientId", "providerId", "providerName", "appointmentId", "noteType", content, "updatedAt") 
      VALUES (${noteId}, ${patientId}, ${providerId}, ${providerName || 'Dr. Smith'}, ${appointmentId}, ${noteType.toUpperCase()}, ${content.trim()}, NOW()) 
      RETURNING *
    `

    const patientResult = await db`SELECT id, "firstName", "lastName" FROM patients WHERE id = ${patientId}`

    const note = {
      id: result[0].id,
      patientId: result[0].patientId,
      providerId: result[0].providerId,
      providerName: result[0].providerName,
      appointmentId: result[0].appointmentId,
      noteType: result[0].noteType,
      content: result[0].content,
      createdAt: result[0].createdAt,
      patient: {
        id: patientResult[0].id,
        firstName: patientResult[0].firstName,
        lastName: patientResult[0].lastName
      }
    }

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