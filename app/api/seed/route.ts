import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database'
import { seedPatients, seedProviders, seedAppointmentTypes, seedAllergies, seedMedications, generateSeedVitals, seedClinicalNotes } from '@/app/lib/mock-data'

export async function POST() {
  try {
    // Parallel cleanup
    await Promise.all([
      prisma.clinicalNote.deleteMany(),
      prisma.vitalSign.deleteMany(),
      prisma.medication.deleteMany(),
      prisma.allergy.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.patient.deleteMany()
    ])

    // Batch create patients
    const createdPatients = await prisma.patient.createMany({
      data: seedPatients,
      skipDuplicates: true
    })

    const patients = await prisma.patient.findMany({
      select: { id: true, firstName: true }
    })

    // Prepare batch data
    const appointments = []
    const allergies = []
    const medications = []
    const vitals = []
    const notes = []

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i]
      const provider = seedProviders[i % seedProviders.length]
      
      // Generate appointments
      for (let j = 0; j < Math.floor(Math.random() * 2) + 2; j++) {
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) - 15)
        
        const hours = Math.floor(Math.random() * 8) + 9
        const minutes = Math.random() < 0.5 ? '00' : '30'
        
        appointments.push({
          patientId: patient.id,
          providerId: provider.id,
          providerName: `Dr. ${provider.firstName} ${provider.lastName}`,
          appointmentDate,
          appointmentTime: `${hours.toString().padStart(2, '0')}:${minutes}`,
          duration: [30, 45, 60][Math.floor(Math.random() * 3)],
          type: seedAppointmentTypes[Math.floor(Math.random() * seedAppointmentTypes.length)],
          status: (['SCHEDULED', 'CONFIRMED', 'COMPLETED'] as const)[Math.floor(Math.random() * 3)],
          notes: Math.random() < 0.7 ? `Follow-up appointment for ${patient.firstName}` : null
        })
      }

      // Generate allergies
      if (Math.random() < 0.6) {
        const numAllergies = Math.floor(Math.random() * 3) + 1
        for (let j = 0; j < numAllergies; j++) {
          const allergy = seedAllergies[Math.floor(Math.random() * seedAllergies.length)]
          allergies.push({
            patientId: patient.id,
            ...allergy,
            dateRecorded: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          })
        }
      }

      // Generate medications
      if (Math.random() < 0.8) {
        const numMeds = Math.floor(Math.random() * 4) + 1
        for (let j = 0; j < numMeds; j++) {
          const medication = seedMedications[Math.floor(Math.random() * seedMedications.length)]
          medications.push({
            patientId: patient.id,
            ...medication,
            prescribedDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            active: Math.random() < 0.9
          })
        }
      }

      // Generate vitals
      const numVitals = Math.floor(Math.random() * 5) + 3
      for (let j = 0; j < numVitals; j++) {
        const vitalData = generateSeedVitals(patient.id)
        vitals.push({
          ...vitalData,
          recordedDate: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000)
        })
      }

      // Generate clinical notes
      if (Math.random() < 0.7) {
        const numNotes = Math.floor(Math.random() * 3) + 1
        for (let j = 0; j < numNotes; j++) {
          const note = seedClinicalNotes[Math.floor(Math.random() * seedClinicalNotes.length)]
          const noteProvider = seedProviders[Math.floor(Math.random() * seedProviders.length)]
          
          notes.push({
            patientId: patient.id,
            providerId: noteProvider.id,
            providerName: `Dr. ${noteProvider.firstName} ${noteProvider.lastName}`,
            ...note,
            createdAt: new Date(Date.now() - j * 14 * 24 * 60 * 60 * 1000)
          })
        }
      }
    }

    // Batch create all data in parallel
    await Promise.all([
      appointments.length > 0 ? prisma.appointment.createMany({ data: appointments, skipDuplicates: true }) : Promise.resolve(),
      allergies.length > 0 ? prisma.allergy.createMany({ data: allergies, skipDuplicates: true }) : Promise.resolve(),
      medications.length > 0 ? prisma.medication.createMany({ data: medications, skipDuplicates: true }) : Promise.resolve(),
      vitals.length > 0 ? prisma.vitalSign.createMany({ data: vitals, skipDuplicates: true }) : Promise.resolve(),
      notes.length > 0 ? prisma.clinicalNote.createMany({ data: notes, skipDuplicates: true }) : Promise.resolve()
    ])

    // Get final counts in parallel
    const [appointmentCount, allergyCount, medicationCount, vitalCount, noteCount] = await Promise.all([
      prisma.appointment.count(),
      prisma.allergy.count(),
      prisma.medication.count(),
      prisma.vitalSign.count(),
      prisma.clinicalNote.count()
    ])

    const stats = {
      patients: patients.length,
      appointments: appointmentCount,
      allergies: allergyCount,
      medications: medicationCount,
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