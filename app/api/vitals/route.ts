import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = patientId ? { patientId } : {}

    const vitals = await prisma.vitalSign.findMany({
      where,
      take: limit,
      orderBy: { recordedDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vitals
    })
  } catch (error: any) {
    console.error('Vitals API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch vitals' },
      { status: 500 }
    )
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

    const vital = await prisma.vitalSign.create({
      data: {
        patientId,
        bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    apiCache.invalidatePattern('vitals')
    return NextResponse.json({
      success: true,
      data: vital
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create vital signs' },
      { status: 500 }
    )
  }
}