# EHR Dashboard Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file with your PostgreSQL database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ehr_dashboard"
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Seed Sample Data**
   - Open http://localhost:3001
   - Go to Settings page
   - Click "Seed Database" to create sample patients and data

## Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Patients**: Demographics, contact info, medical history
- **Appointments**: Scheduling with providers and patients
- **Allergies**: Patient allergy records with severity levels
- **Medications**: Current and historical medications
- **Vital Signs**: Blood pressure, heart rate, temperature, etc.
- **Clinical Notes**: Progress notes, assessments, treatment plans

## API Endpoints

### Patients
- `GET /api/patients` - List patients with search
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details with relations
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Appointments
- `GET /api/appointments` - List appointments with filters
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### Vital Signs
- `GET /api/vitals` - List vital signs
- `POST /api/vitals` - Record new vitals

### Database Management
- `POST /api/seed` - Seed database with sample data

## Features

✅ **Patient Management**
- Search and filter patients
- Complete patient profiles
- Demographics and contact info
- Medical history tracking

✅ **Appointment Scheduling**
- Date-based appointment views
- Provider and patient scheduling
- Status tracking (scheduled, confirmed, completed)
- Appointment types and notes

✅ **Clinical Operations**
- Vital signs recording
- Clinical notes documentation
- Patient history tracking
- Medical data management

✅ **Modern UI/UX**
- Responsive Tailwind CSS design
- Clean, professional interface
- Mobile-friendly navigation
- Loading states and error handling

✅ **Database Integration**
- Prisma ORM with PostgreSQL
- Type-safe database operations
- Automatic migrations
- Sample data seeding

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form with Zod validation

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma db push          # Push schema to database
npx prisma generate         # Generate Prisma client
npx prisma studio          # Open database browser
npx prisma db seed         # Seed database (if configured)

# Reset database (careful!)
npx prisma db push --force-reset
```

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://username:password@host:port/database"

# Optional - ModMed API Integration
MODMED_API_BASE_URL="https://portal.api.modmed.com"
MODMED_CLIENT_ID="your_client_id"
MODMED_CLIENT_SECRET="your_client_secret"
```

## Deployment

1. **Database Setup**
   - Create PostgreSQL database
   - Set DATABASE_URL environment variable
   - Run `npx prisma db push`

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## Sample Data

The application includes comprehensive sample data:
- 5 patients with complete demographics
- Multiple appointments per patient
- Allergies and medications
- Vital signs history
- Clinical notes and documentation

Use the "Seed Database" button in Settings to populate your database with this sample data for testing.

## API Integration

The application is designed to integrate with ModMed API endpoints:
- Patient search and management
- Appointment scheduling
- Clinical data operations
- Provider management

Configure API credentials in the Settings page to enable external API integration.

## Security Features

- Environment-based configuration
- Secure database connections
- Input validation and sanitization
- Error handling and logging
- HIPAA-compliant data handling practices

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database connection
3. Ensure all environment variables are set
4. Review the API documentation
5. Check Prisma schema matches database