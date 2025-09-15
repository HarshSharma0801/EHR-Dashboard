import { NextRequest, NextResponse } from 'next/server'

const defaultSettings = {
  clinic: {
    name: 'EHR Clinic',
    address: '123 Healthcare Ave',
    phone: '(555) 123-4567',
    email: 'info@ehrclinic.com'
  },
  api: {
    athenaBaseUrl: 'https://api.athenahealth.com',
    modmedBaseUrl: 'https://portal.api.modmed.com',
    timeout: 30000
  },
  features: {
    externalIntegration: true,
    notifications: true,
    autoBackup: true
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: defaultSettings
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      data: { ...defaultSettings, ...body },
      message: 'Settings updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}