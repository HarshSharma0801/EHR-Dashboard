import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id
    const cacheKey = getCacheKey(`patient-${patientId}`)
    
    return await withCache(cacheKey, async () => {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          allergies: {
            orderBy: { dateRecorded: 'desc' }
          },
          medications: {
            where: { active: true },
            orderBy: { createdAt: 'desc' }
          },
          vitalSigns: {
            orderBy: { recordedDate: 'desc' },
            take: 5
          },
          appointments: {
            orderBy: { appointmentDate: 'desc' },
            take: 10
          },
          clinicalNotes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })

      if (!patient) {
        return NextResponse.json(
          { success: false, error: 'Patient not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: patient
      })
    }, 5)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id
    const body = await request.json()
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address
    } = body

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender?.toUpperCase(),
        phone: phone?.trim(),
        email: email?.trim(),
        addressStreet: address?.street?.trim(),
        addressCity: address?.city?.trim(),
        addressState: address?.state?.trim(),
        addressZip: address?.zipCode?.trim()
      }
    })

    apiCache.invalidatePattern('patients')
    apiCache.delete(`patient-${patientId}`)
    
    return NextResponse.json({
      success: true,
      data: patient
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id

    await prisma.patient.delete({
      where: { id: patientId }
    })

    apiCache.invalidatePattern('patients')
    apiCache.delete(`patient-${patientId}`)

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}