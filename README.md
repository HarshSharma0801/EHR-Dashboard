# EHR Integration Dashboard

A modern Next.js application for Electronic Health Records (EHR) integration with ModMed and Athena Health APIs, featuring a clean and intuitive dashboard for healthcare management.

## 🚀 Features

### Core Healthcare Workflows
- **Patient Management**: Search, view, create, and update patient records with modal forms
- **Appointment Scheduling**: Manage appointments with date-based views and patient search
- **Clinical Operations**: Record vital signs, clinical notes, and medical data
- **Billing & Administrative**: Handle insurance and billing information
- **Provider Management**: Manage healthcare providers and schedules
- **API Testing**: Built-in connection testing with real-time results

### Technical Features
- **Modern UI**: Clean, responsive design with Tailwind CSS and modal system
- **TypeScript**: Full type safety throughout the application
- **Database**: PostgreSQL/SQLite with optimized queries and batch operations
- **API Integration**: ModMed and Athena Health API clients with comprehensive error handling
- **Real-time Updates**: Live data synchronization with fast response times
- **Mobile Responsive**: Works seamlessly on all devices
- **Performance Optimized**: Parallel processing and connection pooling

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components and modal system
- **Database**: PostgreSQL/SQLite with Prisma ORM and connection pooling
- **API Integration**: Native fetch with error handling and parallel processing
- **Icons**: Lucide React
- **Forms**: Custom form components with validation
- **Notifications**: React Hot Toast
- **Testing**: Postman collections for all APIs

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or SQLite for local development)
- ModMed API credentials (optional for testing)
- Athena Health API credentials (optional for testing)
- Postman (for API testing)

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd EHR-Dashboard
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ehr_dashboard"
   
   # Athena Health API (Sandbox)
   ATHENA_CLIENT_ID=your_client_id
   ATHENA_CLIENT_SECRET=your_client_secret
   ATHENA_BASE_URL=https://api.preview.platform.athenahealth.com
   
   # ModMed API
   MODMED_BASE_URL=https://stage.ema-api.com/ema-dev
   MODMED_FIRM_PREFIX=your_firm_prefix
   MODMED_API_KEY=your_api_key
   MODMED_USERNAME=your_username
   MODMED_PASSWORD=your_password
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed Database (Optional)**
   ```bash
   # Or use the UI: Settings > Seed Database
   curl -X POST http://localhost:3000/api/seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
EHR-Dashboard/
├── app/
│   ├── api/                 # API routes
│   │   ├── patients/        # Patient CRUD operations
│   │   ├── appointments/    # Appointment management
│   │   ├── clinical/        # Clinical data operations
│   │   ├── vitals/          # Vital signs management
│   │   ├── billing/         # Billing operations
│   │   ├── health/          # Health check endpoint
│   │   ├── seed/            # Database seeding
│   │   └── settings/        # System settings
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Modal, Button, Input)
│   │   ├── forms/          # Form components (Patient, Appointment)
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Page header
│   │   └── TestConnectionModal.tsx # API testing modal
│   ├── lib/                # Utilities and configurations
│   │   ├── database.ts     # Database connection with Prisma
│   │   └── mock-data.ts    # Sample data for seeding
│   ├── types/              # TypeScript type definitions
│   ├── patients/           # Patient management pages
│   ├── appointments/       # Appointment pages
│   ├── clinical/           # Clinical workflow pages
│   ├── billing/            # Billing and insurance
│   ├── reports/            # Analytics and reports
│   └── settings/           # Configuration pages
├── prisma/                 # Database schema and migrations
├── postman/                # API testing collections
│   ├── EHR-Dashboard-APIs.postman_collection.json
│   ├── Athena-Health-API.postman_collection.json
│   └── ModMed-API.postman_collection.json
├── public/                 # Static assets and favicon
└── README.md               # This file
```

## 🔧 Configuration

### API Credentials Setup

1. Navigate to **Settings** page in the application
2. Use the **Test Connection** button to verify all API endpoints
3. Configure external API credentials in `.env` file:
   - **Athena Health**: Client ID, Client Secret, Base URL
   - **ModMed**: API Key, Username, Password, Firm Prefix

### API Testing

- **Built-in Testing**: Use Settings > Test Connection for real-time API testing
- **Postman Collections**: Import collections from `/postman/` directory
- **Health Check**: Visit `/api/health` for system status

### Database Configuration

The application uses Prisma ORM with automatic table creation:
- `patients` - Patient demographic information
- `appointments` - Appointment scheduling data  
- `allergies` - Patient allergy records
- `medications` - Patient medication lists
- `vital_signs` - Clinical vital signs data
- `clinical_notes` - Clinical documentation

**Performance Features:**
- Connection pooling for optimal performance
- Batch operations for data seeding
- Parallel query execution
- Optimized database indexes

## 🔌 API Integration

### Internal API Endpoints

#### System
- `GET /api/health` - System health check and database connectivity
- `POST /api/seed` - Populate database with sample data
- `GET /api/settings` - Get system configuration

#### Patient Management
- `GET /api/patients` - List patients with search and pagination
- `POST /api/patients` - Create new patient records
- `GET /api/patients/{id}` - Get specific patient details

#### Appointment Management
- `GET /api/appointments` - List appointments with filtering
- `POST /api/appointments` - Schedule new appointments
- `GET /api/appointments?date=YYYY-MM-DD` - Get appointments by date

#### Clinical Data
- `GET /api/clinical` - Get clinical notes
- `POST /api/clinical` - Create clinical notes
- `GET /api/vitals` - Get vital signs
- `POST /api/vitals` - Record vital signs

#### Billing
- `GET /api/billing` - Get billing information

### External API Integration

#### ModMed FHIR API
- Patient search and management
- Appointment scheduling
- Clinical data retrieval
- Medication and allergy management

#### Athena Health API
- Patient demographics
- Appointment booking
- Clinical chart access
- Provider management

## 🧪 Testing

### API Testing with Postman

Three comprehensive Postman collections are included:

1. **EHR Dashboard APIs** (`/postman/EHR-Dashboard-APIs.postman_collection.json`)
   - All internal API endpoints
   - Health checks and system operations
   - Patient, appointment, and clinical data management

2. **Athena Health API** (`/postman/Athena-Health-API.postman_collection.json`)
   - OAuth2 authentication
   - Patient search and management
   - Appointment booking
   - Clinical data access

3. **ModMed API** (`/postman/ModMed-API.postman_collection.json`)
   - FHIR-compliant endpoints
   - Patient and appointment management
   - Clinical observations and medications

### Built-in API Testing

- **Settings Page**: Use "Test Connection" button for real-time API testing
- **Health Endpoint**: `GET /api/health` for system status
- **Response Times**: All tests show performance metrics

### Import Instructions

1. Open Postman
2. Click "Import" > "Upload Files"
3. Select collection files from `/postman/` directory
4. Update environment variables with your credentials

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://username:password@host:5432/database"

# Athena Health API (Production)
ATHENA_CLIENT_ID=your_production_client_id
ATHENA_CLIENT_SECRET=your_production_client_secret
ATHENA_BASE_URL=https://api.platform.athenahealth.com

# ModMed API (Production)
MODMED_BASE_URL=https://api.modmed.com
MODMED_FIRM_PREFIX=your_firm_prefix
MODMED_API_KEY=your_production_api_key
MODMED_USERNAME=your_production_username
MODMED_PASSWORD=your_production_password
```

## 🔒 Security & Compliance

- **HIPAA Compliance**: Secure data handling and encryption
- **Access Control**: Role-based permissions and authentication
- **Data Protection**: Encrypted sensitive information storage
- **Audit Logging**: Comprehensive activity tracking
- **Environment Security**: Secure credential management
- **API Security**: OAuth2 and API key authentication
- **Database Security**: Connection pooling and prepared statements

## 📊 Performance Optimizations

- **Database**: Connection pooling, batch operations, parallel queries
- **API Performance**: Optimized response times (< 1 second)
- **Batch Processing**: Efficient data seeding and updates
- **Lazy Loading**: Optimized component loading
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Optimization**: Tree shaking and code splitting
- **Modal System**: Efficient form rendering and state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **API Testing**: Use built-in Test Connection feature in Settings
- **Postman Collections**: Import from `/postman/` directory
- **Health Check**: Visit `/api/health` for system status
- **Database Issues**: Check Prisma schema and connection
- **Performance**: All APIs optimized for < 1 second response times

## 📚 Quick Start Guide

1. **Setup**: `npm install` → Configure `.env` → `npx prisma db push`
2. **Seed Data**: Use Settings > Seed Database or `POST /api/seed`
3. **Test APIs**: Settings > Test Connection for real-time testing
4. **Add Data**: Use + buttons in Patients/Appointments for modal forms
5. **External APIs**: Import Postman collections for Athena/ModMed testing

## 🔄 Changelog

### Version 2.0.0 (Latest)
- **Performance**: Optimized APIs with < 1 second response times
- **UI/UX**: Added modal system for forms and dialogs
- **Forms**: Working Add Patient and Schedule Appointment forms
- **Testing**: Built-in API testing with real-time results
- **APIs**: Fixed enum validation and error handling
- **Database**: Batch operations and parallel processing
- **Collections**: Complete Postman collections for all APIs
- **Documentation**: Comprehensive README with setup instructions

### Version 1.0.0
- Initial release with core EHR functionality
- ModMed and Athena Health API integration
- Patient and appointment management
- Clinical workflow implementation
- Responsive dashboard design