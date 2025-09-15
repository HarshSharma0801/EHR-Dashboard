import { NextResponse } from 'next/server'
import { db } from '@/app/lib/database'
import { randomUUID } from 'crypto'

const seedPatients = [
  { firstName: 'John', lastName: 'Smith', dateOfBirth: '1985-03-15', gender: 'MALE', phone: '(555) 123-4567', email: 'john.smith@email.com' },
  { firstName: 'Emily', lastName: 'Davis', dateOfBirth: '1992-05-14', gender: 'FEMALE', phone: '(555) 456-7890', email: 'emily.davis@email.com' },
  { firstName: 'Michael', lastName: 'Johnson', dateOfBirth: '1978-11-08', gender: 'MALE', phone: '(555) 345-6789', email: 'michael.johnson@email.com' },
  { firstName: 'Sarah', lastName: 'Wilson', dateOfBirth: '1990-07-22', gender: 'FEMALE', phone: '(555) 234-5678', email: 'sarah.wilson@email.com' },
  { firstName: 'Robert', lastName: 'Brown', dateOfBirth: '1965-09-30', gender: 'MALE', phone: '(555) 567-8901', email: 'robert.brown@email.com' }
]

export async function POST() {
  try {
    // Clear existing data
    await db`DELETE FROM clinical_notes`
    await db`DELETE FROM vital_signs`
    await db`DELETE FROM appointments`
    await db`DELETE FROM patients`

    // Insert patients in batch
    const patientIds: string[] = []
    const patientInserts = seedPatients.map(patient => {
      const patientId = randomUUID()
      patientIds.push(patientId)
      return {
        id: patientId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        updatedAt: new Date()
      }
    })
    
    await db`INSERT INTO patients ${db(patientInserts)}`

    // Insert appointments in batch
    const appointmentInserts = []
    for (let i = 0; i < patientIds.length; i++) {
      const numAppointments = Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < numAppointments; j++) {
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 15)
        
        const hours = Math.floor(Math.random() * 8) + 9
        const minutes = Math.random() < 0.5 ? '00' : '30'
        const appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes}`
        
        const types = ['Consultation', 'Follow-up', 'Check-up', 'Physical Exam']
        const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED']
        
        appointmentInserts.push({
          id: randomUUID(),
          patientId: patientIds[i],
          providerId: 'provider-' + (i % 3 + 1),
          providerName: 'Dr. ' + ['Smith', 'Johnson', 'Brown'][i % 3],
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime,
          duration: [30, 45, 60][Math.floor(Math.random() * 3)],
          type: types[Math.floor(Math.random() * types.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          updatedAt: new Date()
        })
      }
    }
    
    if (appointmentInserts.length > 0) {
      await db`INSERT INTO appointments ${db(appointmentInserts)}`
    }

    // Insert vital signs in batch
    const vitalInserts = []
    for (const patientId of patientIds) {
      if (Math.random() < 0.8) {
        vitalInserts.push({
          id: randomUUID(),
          patientId,
          bloodPressureSystolic: Math.floor(Math.random() * 40) + 110,
          bloodPressureDiastolic: Math.floor(Math.random() * 20) + 70,
          heartRate: Math.floor(Math.random() * 30) + 60,
          temperature: Math.random() * 2 + 97.5,
          weight: Math.random() * 50 + 120,
          height: Math.random() * 12 + 60
        })
      }
    }
    
    if (vitalInserts.length > 0) {
      await db`INSERT INTO vital_signs ${db(vitalInserts)}`
    }

    // Insert clinical notes in batch
    const noteInserts = []
    for (let i = 0; i < patientIds.length; i++) {
      if (Math.random() < 0.6) {
        noteInserts.push({
          id: randomUUID(),
          patientId: patientIds[i],
          providerId: 'provider-1',
          providerName: 'Dr. Smith',
          noteType: 'PROGRESS',
          content: 'Patient is responding well to treatment. Continue current medication regimen.',
          updatedAt: new Date()
        })
      }
    }
    
    if (noteInserts.length > 0) {
      await db`INSERT INTO clinical_notes ${db(noteInserts)}`
    }

    const stats = {
      patients: patientIds.length,
      appointments: appointmentInserts.length,
      vitalSigns: vitalInserts.length,
      clinicalNotes: noteInserts.length
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}