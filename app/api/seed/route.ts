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

    // Insert patients and collect IDs
    const patientIds: string[] = []
    for (const patient of seedPatients) {
      const patientId = randomUUID()
      await db`
        INSERT INTO patients (id, "firstName", "lastName", "dateOfBirth", gender, phone, email, "updatedAt") 
        VALUES (${patientId}, ${patient.firstName}, ${patient.lastName}, ${patient.dateOfBirth}, ${patient.gender}, ${patient.phone}, ${patient.email}, NOW()) 
      `
      patientIds.push(patientId)
    }

    // Insert appointments
    let appointmentCount = 0
    for (let i = 0; i < patientIds.length; i++) {
      const numAppointments = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numAppointments; j++) {
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 15)
        
        const hours = Math.floor(Math.random() * 8) + 9
        const minutes = Math.random() < 0.5 ? '00' : '30'
        const appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes}`
        
        const types = ['Consultation', 'Follow-up', 'Check-up', 'Physical Exam']
        const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED']
        
        await db`
          INSERT INTO appointments (id, "patientId", "providerId", "providerName", "appointmentDate", "appointmentTime", duration, type, status, "updatedAt") 
          VALUES (${randomUUID()}, ${patientIds[i]}, ${'provider-' + (i % 3 + 1)}, ${'Dr. ' + ['Smith', 'Johnson', 'Brown'][i % 3]}, ${appointmentDate.toISOString().split('T')[0]}, ${appointmentTime}, ${[30, 45, 60][Math.floor(Math.random() * 3)]}, ${types[Math.floor(Math.random() * types.length)]}, ${statuses[Math.floor(Math.random() * statuses.length)]}, NOW())
        `
        appointmentCount++
      }
    }

    // Insert vital signs
    let vitalCount = 0
    for (const patientId of patientIds) {
      const numVitals = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numVitals; j++) {
        await db`
          INSERT INTO vital_signs (id, "patientId", "bloodPressureSystolic", "bloodPressureDiastolic", "heartRate", temperature, weight, height) 
          VALUES (${randomUUID()}, ${patientId}, ${Math.floor(Math.random() * 40) + 110}, ${Math.floor(Math.random() * 20) + 70}, ${Math.floor(Math.random() * 30) + 60}, ${Math.random() * 2 + 97.5}, ${Math.random() * 50 + 120}, ${Math.random() * 12 + 60})
        `
        vitalCount++
      }
    }

    // Insert clinical notes
    let noteCount = 0
    for (const patientId of patientIds) {
      if (Math.random() < 0.7) {
        await db`
          INSERT INTO clinical_notes (id, "patientId", "providerId", "providerName", "noteType", content, "updatedAt") 
          VALUES (${randomUUID()}, ${patientId}, 'provider-1', 'Dr. Smith', 'PROGRESS', 'Patient is responding well to treatment. Continue current medication regimen.', NOW())
        `
        noteCount++
      }
    }

    const stats = {
      patients: patientIds.length,
      appointments: appointmentCount,
      vitalSigns: vitalCount,
      clinicalNotes: noteCount
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