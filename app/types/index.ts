export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
  email?: string
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  allergies?: Allergy[]
  medications?: Medication[]
  vitalSigns?: VitalSign[]
  appointments?: Appointment[]
  clinicalNotes?: ClinicalNote[]
  createdAt: string
  updatedAt: string
}

export interface Allergy {
  id: string
  patientId: string
  allergen: string
  severity: 'MILD' | 'MODERATE' | 'SEVERE'
  reaction?: string
  dateRecorded: string
  createdAt: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribedDate: string
  prescribedBy: string
  active: boolean
}

export interface MedicalCondition {
  id: string
  condition: string
  diagnosedDate: string
  status: 'active' | 'resolved' | 'chronic'
  notes?: string
}

export interface Appointment {
  id: string
  patientId: string
  patient?: {
    id: string
    firstName: string
    lastName: string
    phone?: string
    email?: string
  }
  providerId: string
  providerName: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  type: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Provider {
  id: string
  firstName: string
  lastName: string
  specialty: string
  email: string
  phone: string
  schedule: ProviderSchedule[]
}

export interface ProviderSchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
  available: boolean
}

export interface VitalSign {
  id: string
  patientId: string
  recordedDate: string
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  patient?: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface ClinicalNote {
  id: string
  patientId: string
  providerId: string
  providerName: string
  appointmentId?: string
  noteType: 'PROGRESS' | 'ASSESSMENT' | 'PLAN' | 'SOAP'
  content: string
  createdAt: string
  updatedAt: string
  patient?: {
    id: string
    firstName: string
    lastName: string
  }
}

export interface LabResult {
  id: string
  patientId: string
  testName: string
  result: string
  referenceRange: string
  status: 'normal' | 'abnormal' | 'critical'
  orderedDate: string
  resultDate: string
  orderedBy: string
}

export interface Insurance {
  id: string
  patientId: string
  insuranceCompany: string
  policyNumber: string
  groupNumber: string
  subscriberId: string
  effectiveDate: string
  expirationDate?: string
  copay?: number
  deductible?: number
}

export interface ApiCredentials {
  clientId?: string
  clientSecret?: string
  apiKey?: string
  baseUrl: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}