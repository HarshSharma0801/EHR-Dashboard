import postgres from 'postgres'

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof postgres> | undefined
}

export const db = globalForDb.db ?? postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false
})

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

// Initialize tables
export const initTables = async () => {
  await db`
    CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "firstName" VARCHAR(255) NOT NULL,
      "lastName" VARCHAR(255) NOT NULL,
      "dateOfBirth" DATE NOT NULL,
      gender VARCHAR(10) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(255),
      "addressStreet" TEXT,
      "addressCity" VARCHAR(100),
      "addressState" VARCHAR(50),
      "addressZip" VARCHAR(20),
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `
  
  await db`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "patientId" VARCHAR(255) REFERENCES patients(id) ON DELETE CASCADE,
      "providerId" VARCHAR(255) NOT NULL,
      "providerName" VARCHAR(255) NOT NULL,
      "appointmentDate" DATE NOT NULL,
      "appointmentTime" VARCHAR(10) NOT NULL,
      duration INTEGER DEFAULT 30,
      type VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'SCHEDULED',
      notes TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `
  
  await db`
    CREATE TABLE IF NOT EXISTS "vitalSigns" (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "patientId" VARCHAR(255) REFERENCES patients(id) ON DELETE CASCADE,
      "recordedDate" TIMESTAMP DEFAULT NOW(),
      "bloodPressureSystolic" INTEGER,
      "bloodPressureDiastolic" INTEGER,
      "heartRate" INTEGER,
      temperature DECIMAL(4,1),
      weight DECIMAL(5,1),
      height DECIMAL(5,1),
      "respiratoryRate" INTEGER,
      "oxygenSaturation" INTEGER,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `
  
  await db`
    CREATE TABLE IF NOT EXISTS "clinicalNotes" (
      id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "patientId" VARCHAR(255) REFERENCES patients(id) ON DELETE CASCADE,
      "providerId" VARCHAR(255) NOT NULL,
      "providerName" VARCHAR(255) NOT NULL,
      "appointmentId" VARCHAR(255),
      "noteType" VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `
}