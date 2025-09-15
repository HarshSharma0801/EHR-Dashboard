import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { withCache, getCacheKey, apiCache } from '@/app/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          email: true,
          addressCity: true,
          addressState: true
        }
      }),
      prisma.patient.count({ where })
    ])
    
    return NextResponse.json({ success: true, data: patients, total })
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

    const patient = await prisma.patient.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender: gender?.toUpperCase() || 'OTHER',
        phone: phone?.trim(),
        email: email?.trim(),
        addressStreet: address?.street?.trim(),
        addressCity: address?.city?.trim(),
        addressState: address?.state?.trim(),
        addressZip: address?.zipCode?.trim()
      }
    })

    apiCache.invalidatePattern('patients')
    return NextResponse.json({ success: true, data: patient })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create patient' }, { status: 500 })
  }
}