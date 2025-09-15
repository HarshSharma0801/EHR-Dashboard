import { Patient, Appointment, VitalSign, Allergy, Medication } from '@prisma/client'

export const seedPatients: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'MALE',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    addressStreet: '123 Main St',
    addressCity: 'New York',
    addressState: 'NY',
    addressZip: '10001'
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    dateOfBirth: new Date('1990-07-22'),
    gender: 'FEMALE',
    phone: '(555) 234-5678',
    email: 'sarah.wilson@email.com',
    addressStreet: '456 Oak Ave',
    addressCity: 'Los Angeles',
    addressState: 'CA',
    addressZip: '90210'
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: new Date('1978-11-08'),
    gender: 'MALE',
    phone: '(555) 345-6789',
    email: 'michael.johnson@email.com',
    addressStreet: '789 Pine Rd',
    addressCity: 'Chicago',
    addressState: 'IL',
    addressZip: '60601'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: new Date('1992-05-14'),
    gender: 'FEMALE',
    phone: '(555) 456-7890',
    email: 'emily.davis@email.com',
    addressStreet: '321 Elm St',
    addressCity: 'Houston',
    addressState: 'TX',
    addressZip: '77001'
  },
  {
    firstName: 'Robert',
    lastName: 'Brown',
    dateOfBirth: new Date('1965-09-30'),
    gender: 'MALE',
    phone: '(555) 567-8901',
    email: 'robert.brown@email.com',
    addressStreet: '654 Maple Dr',
    addressCity: 'Phoenix',
    addressState: 'AZ',
    addressZip: '85001'
  }
]

export const seedProviders = [
  {
    id: 'prov_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'Internal Medicine',
    email: 'dr.johnson@clinic.com',
    phone: '(555) 111-2222'
  },
  {
    id: 'prov_2',
    firstName: 'Michael',
    lastName: 'Brown',
    specialty: 'Cardiology',
    email: 'dr.brown@clinic.com',
    phone: '(555) 222-3333'
  },
  {
    id: 'prov_3',
    firstName: 'Lisa',
    lastName: 'Anderson',
    specialty: 'Pediatrics',
    email: 'dr.anderson@clinic.com',
    phone: '(555) 333-4444'
  }
]

export const seedAppointmentTypes = [
  'Routine Checkup',
  'Follow-up',
  'Consultation',
  'Lab Review',
  'Physical Exam',
  'Vaccination',
  'Urgent Care',
  'Specialist Referral'
]

export const seedAllergies = [
  { allergen: 'Penicillin', severity: 'SEVERE' as const, reaction: 'Anaphylaxis' },
  { allergen: 'Peanuts', severity: 'MODERATE' as const, reaction: 'Hives and swelling' },
  { allergen: 'Shellfish', severity: 'MILD' as const, reaction: 'Digestive upset' },
  { allergen: 'Latex', severity: 'MODERATE' as const, reaction: 'Skin irritation' },
  { allergen: 'Dust mites', severity: 'MILD' as const, reaction: 'Respiratory symptoms' }
]

export const seedMedications = [
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Johnson' },
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Brown' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', prescribedBy: 'Dr. Johnson' },
  { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', prescribedBy: 'Dr. Anderson' },
  { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', prescribedBy: 'Dr. Brown' }
]

export const generateSeedVitals = (patientId: string) => ({
  patientId,
  bloodPressureSystolic: Math.floor(Math.random() * 40) + 110,
  bloodPressureDiastolic: Math.floor(Math.random() * 30) + 70,
  heartRate: Math.floor(Math.random() * 40) + 60,
  temperature: Math.round((Math.random() * 2 + 97.5) * 10) / 10,
  weight: Math.floor(Math.random() * 100) + 120,
  height: Math.floor(Math.random() * 12) + 60,
  respiratoryRate: Math.floor(Math.random() * 8) + 12,
  oxygenSaturation: Math.floor(Math.random() * 5) + 95
})

export const seedClinicalNotes = [
  {
    noteType: 'PROGRESS' as const,
    content: 'Patient reports feeling well. Blood pressure controlled on current medication. Continue current treatment plan.'
  },
  {
    noteType: 'ASSESSMENT' as const,
    content: 'Hypertension well controlled. Patient compliant with medications. No adverse effects reported.'
  },
  {
    noteType: 'PLAN' as const,
    content: 'Continue Lisinopril 10mg daily. Follow up in 3 months. Patient to monitor BP at home.'
  },
  {
    noteType: 'SOAP' as const,
    content: 'S: Patient reports no chest pain or shortness of breath. O: BP 128/82, HR 72. A: HTN controlled. P: Continue current meds.'
  }
]