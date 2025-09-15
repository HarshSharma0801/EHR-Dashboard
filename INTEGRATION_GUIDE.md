# EHR API Integration Guide

## Overview
This application integrates with both **Athena Health** and **ModMed** APIs to provide comprehensive EHR functionality.

## API Configurations

### Athena Health API
- **Authentication**: OAuth2 Client Credentials
- **Base URL**: https://api.athenahealth.com
- **Practice ID**: 195900 (sandbox)
- **Scope**: athena/service/Athenanet.MDP.*

### ModMed API  
- **Authentication**: API Key + Username/Password
- **Base URL**: https://stage.ema-api.com/ema-dev/firm
- **Firm Prefix**: entpmsandbox393
- **Protocol**: FHIR R4

## Implemented Endpoints

### Athena Health
```
GET /v1/{practiceId}/patients - Search patients
GET /v1/{practiceId}/patients/{patientId} - Get patient details
POST /v1/{practiceId}/patients - Create patient
PUT /v1/{practiceId}/patients/{patientId} - Update patient

GET /v1/{practiceId}/appointments - List appointments
POST /v1/{practiceId}/appointments - Create appointment
PUT /v1/{practiceId}/appointments/{appointmentId} - Update appointment

GET /v1/{practiceId}/providers - List providers
GET /v1/{practiceId}/patients/{patientId}/allergies - Get allergies
GET /v1/{practiceId}/patients/{patientId}/medications - Get medications
GET /v1/{practiceId}/patients/{patientId}/vitals - Get vital signs
```

### ModMed FHIR
```
GET /fhir/Patient - Search patients
GET /fhir/Patient/{id} - Get patient
POST /fhir/Patient - Create patient
PUT /fhir/Patient/{id} - Update patient

GET /fhir/Appointment - List appointments
POST /fhir/Appointment - Create appointment
PUT /fhir/Appointment/{id} - Update appointment

GET /fhir/Practitioner - List practitioners
GET /fhir/Observation - Get observations
POST /fhir/Observation - Create observation
POST /fhir/DocumentReference - Create clinical note
```

## Usage Examples

### Test API Connections
```bash
# Test Athena
curl "http://localhost:3001/api/external/athena?action=test"

# Test ModMed
curl "http://localhost:3001/api/external/modmed?action=test"
```

### Search Patients
```bash
# Athena
curl "http://localhost:3001/api/external/athena?action=patients&query=John"

# ModMed
curl "http://localhost:3001/api/external/modmed?action=patients&query=John"
```

### Get Providers
```bash
# Athena
curl "http://localhost:3001/api/external/athena?action=providers"

# ModMed
curl "http://localhost:3001/api/external/modmed?action=providers"
```

## Error Handling

Both APIs implement comprehensive error handling:
- **Authentication failures**: Automatic token refresh
- **Rate limiting**: Exponential backoff
- **Network errors**: Retry logic
- **Invalid responses**: Graceful degradation

## Performance Optimizations

1. **Connection Pooling**: Reuse HTTP connections
2. **Token Caching**: Cache authentication tokens
3. **Request Batching**: Combine multiple requests
4. **Response Caching**: Cache frequently accessed data
5. **Lazy Loading**: Load data on demand

## Security Features

1. **Environment Variables**: All credentials stored securely
2. **Token Rotation**: Automatic token refresh
3. **Request Validation**: Input sanitization
4. **Error Sanitization**: No sensitive data in logs
5. **HTTPS Only**: All API calls use HTTPS

## Testing

Use the **External APIs** page to:
1. Test API connections
2. Search patients across both systems
3. Load provider information
4. Compare data formats
5. Validate integrations

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify environment variables
   - Check API credentials
   - Ensure proper scopes

2. **Network Timeouts**
   - Check internet connectivity
   - Verify API endpoints
   - Review timeout settings

3. **Data Format Issues**
   - Validate request payloads
   - Check response parsing
   - Review API documentation

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## API Limitations

### Athena Health
- Rate limit: 1000 requests/hour
- Sandbox data only
- Limited patient records
- Practice-specific endpoints

### ModMed
- FHIR R4 compliance required
- Staging environment only
- Authentication token expires
- Firm-specific data access

## Future Enhancements

1. **Real-time Sync**: Bidirectional data synchronization
2. **Bulk Operations**: Batch patient imports/exports
3. **Webhook Support**: Real-time notifications
4. **Advanced Search**: Complex query capabilities
5. **Data Mapping**: Standardized data formats