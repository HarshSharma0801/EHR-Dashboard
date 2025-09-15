# ModMed FHIR Integration Guide

## Overview

This guide covers the comprehensive ModMed FHIR API integration implemented in the EHR Dashboard. The system provides advanced search capabilities for all FHIR resource types with dynamic, configuration-driven forms and effective data display.

## Key Features

### ✅ No Hardcoding

- All configuration is centralized in `app/lib/modmed-config.ts`
- Dynamic form generation based on FHIR specifications
- Environment-based configuration management

### ✅ Complete FHIR Resource Support

- **Patient Search**: Family name, given name, active status, birthdate, gender, email, phone, postal code, identifiers, last updated
- **Appointment Search**: Patient ID, practitioner ID, status, date, location, appointment type, supporting info, last updated
- **Practitioner Search**: Family name, given name, active status, email, phone, NPI number, provider type
- **Organization Search**: Type (Payers/Referring Institutions), name, active status, payer ID, last updated

### ✅ Advanced UI Components

- Dynamic search forms with validation
- Comprehensive result displays with expandable details
- Real-time connection status monitoring
- Responsive design with effective data presentation

## Architecture

### Configuration System (`app/lib/modmed-config.ts`)

The configuration system eliminates all hardcoding by centralizing:

```typescript
interface ModMedConfig {
  baseUrl: string; // API base URL
  firmPrefix: string; // Firm URL prefix
  apiKey: string; // API key
  username: string; // Authentication username
  password: string; // Authentication password
  endpoints: {
    auth: string; // OAuth endpoint path
    fhir: string; // FHIR API endpoint path
  };
  searchParameters: {
    // Search parameters for each resource
    Patient: SearchParameterConfig[];
    Appointment: SearchParameterConfig[];
    Practitioner: SearchParameterConfig[];
    Organization: SearchParameterConfig[];
  };
  resourceTypes: ResourceTypeConfig[]; // Resource metadata
}
```

### API Layer (`app/lib/modmed-api.ts`)

Enhanced ModMed API client with:

- Configuration-based endpoint construction
- Advanced search methods for all resource types
- Automatic authentication handling
- Error handling and retry logic

### Search Forms (`app/components/DynamicModMedSearchForm.tsx`)

Dynamic form generation with:

- Configuration-driven field rendering
- Built-in validation based on FHIR specs
- Advanced/basic field separation
- Real-time error feedback

### Result Displays (`app/components/ModMedResultDisplays.tsx`)

Comprehensive data presentation with:

- Expandable detail views
- Resource-specific formatting
- Action buttons for edit/view operations
- Copy-to-clipboard functionality

## Usage Guide

### 1. Environment Configuration

Set up your ModMed credentials in environment variables:

```bash
MODMED_BASE_URL=https://stage.ema-api.com/ema-dev
MODMED_FIRM_PREFIX=your-firm-prefix
MODMED_API_KEY=your-api-key
MODMED_USERNAME=your-username
MODMED_PASSWORD=your-password
```

### 2. Patient Search Examples

#### Basic Patient Search

```typescript
// Search by last name
{
  family: "Smith";
}

// Search by first name portion
{
  given: "John";
}

// Search by active status
{
  active: "true";
}
```

#### Advanced Patient Search

```typescript
// Complex search with multiple parameters
{
  family: "Smith",
  given: "John",
  active: "true",
  birthdate: "1990-01-01",
  gender: "male",
  email: "john.smith@email.com",
  "address-postalcode": "12345"
}
```

#### Identifier-Based Search

```typescript
// Medical Record Number
{
  identifier: "http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-MR|MM0000000178";
}

// PMS ID
{
  identifier: "PMS|10049100000047";
}

// SSN
{
  identifier: "http://hl7.org/fhir/sid/us-ssn|123456789";
}
```

### 3. Appointment Search Examples

#### Basic Appointment Search

```typescript
// Search by patient ID
{
  patient: "5812";
}

// Search by status
{
  status: "booked";
}

// Search by date
{
  date: "2024-01-15";
}
```

#### Advanced Appointment Search

```typescript
// Complex appointment search
{
  patient: "5812",
  practitioner: "6115",
  status: "booked",
  date: "ge2024-01-01",  // Greater than or equal to
  location: "24",
  "appointment-type": "11"
}
```

### 4. Practitioner Search Examples

#### Basic Practitioner Search

```typescript
// Search by last name
{
  family: "Doe";
}

// Search by active status
{
  active: "true";
}
```

#### Advanced Practitioner Search

```typescript
// NPI-based search
{ identifier: "2079584746" }

// Referring provider search
{ type: "ref" }

// Combined search
{
  family: "Doe",
  given: "Jane",
  active: "true",
  email: "jane.doe@example.com"
}
```

### 5. Organization Search Examples

#### Payer Search

```typescript
// Search for payers
{ type: "pay" }

// Search specific payer
{
  type: "pay",
  name: "Medicare of Florida",
  identifier: "payerId|09102"
}
```

#### Referring Institution Search

```typescript
// Search for referring institutions
{ type: "prov" }

// Active institutions only
{
  type: "prov",
  active: "true"
}
```

## API Response Format

All search responses follow FHIR Bundle format:

```json
{
  "success": true,
  "data": {
    "resourceType": "Bundle",
    "total": 1,
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "9576653",
          "identifier": [
            {
              "system": "http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-MR",
              "value": "MM0000000003"
            }
          ],
          "active": true,
          "name": [
            {
              "family": "Test",
              "given": ["Child"]
            }
          ],
          "telecom": [
            {
              "system": "email",
              "value": "test.child@gmail.com"
            }
          ],
          "gender": "male",
          "birthDate": "2013-09-13",
          "address": [
            {
              "line": ["1 Main Street"],
              "city": "Allentown",
              "state": "PA",
              "postalCode": "18104"
            }
          ]
        }
      }
    ]
  }
}
```

## Error Handling

The system includes comprehensive error handling:

### Validation Errors

- Real-time field validation
- FHIR-compliant parameter checking
- User-friendly error messages

### API Errors

- Automatic retry for authentication failures
- Graceful fallback to mock data
- Detailed error logging

### Network Errors

- Connection status monitoring
- Timeout handling
- Offline mode support

## Performance Features

### Caching

- Intelligent API response caching
- Cache invalidation based on search parameters
- Configurable cache duration

### Optimization

- Lazy loading of result details
- Pagination support for large result sets
- Debounced search input

## Customization

### Adding New Search Parameters

1. Update `modmed-config.ts`:

```typescript
Patient: [
  // ... existing parameters
  {
    name: "new-parameter",
    type: "string",
    label: "New Parameter",
    description: "Description of the new parameter",
    placeholder: "Enter value...",
  },
];
```

2. The dynamic form will automatically include the new parameter.

### Modifying Resource Types

Update the `resourceTypes` array in configuration:

```typescript
{
  name: 'NewResource',
  endpoint: '/NewResource',
  displayName: 'New Resources',
  description: 'Description of new resource',
  icon: 'Icon',
  searchable: true,
  creatable: true,
  updatable: true,
  deletable: false
}
```

## Testing

### Connection Testing

Use the "Test Connection" button to verify API connectivity.

### Search Testing

1. Select resource type
2. Fill in search parameters
3. Click search button
4. Verify results display correctly

### Error Testing

- Test with invalid parameters
- Test with empty required fields
- Test with network disconnected

## Troubleshooting

### Common Issues

1. **Authentication Failures**

   - Verify environment variables
   - Check API key validity
   - Ensure firm prefix is correct

2. **Search Returns No Results**

   - Check parameter values
   - Verify FHIR parameter syntax
   - Test with simpler search criteria

3. **Display Issues**
   - Check browser console for errors
   - Verify response data structure
   - Test with different screen sizes

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed API requests and responses in the browser console.

## Security Considerations

- API credentials are stored as environment variables
- No sensitive data is hardcoded in the application
- All API calls use HTTPS
- Authentication tokens are automatically managed

## Future Enhancements

Planned improvements include:

- Bulk operations support
- Advanced filtering options
- Export functionality
- Real-time data updates
- Enhanced accessibility features

## Support

For technical support or feature requests, please refer to the development team or create an issue in the project repository.
