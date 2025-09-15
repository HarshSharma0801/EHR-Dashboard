import axios, { AxiosInstance } from 'axios'

interface AthenaCredentials {
  clientId: string
  clientSecret: string
  baseUrl: string
}

interface AthenaTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

class AthenaAPI {
  private client: AxiosInstance
  private credentials: AthenaCredentials
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(credentials: AthenaCredentials) {
    this.credentials = credentials
    this.client = axios.create({
      baseURL: credentials.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.client.interceptors.request.use(async (config) => {
      await this.ensureValidToken()
      if (this.accessToken) {
        config.headers['Authorization'] = `Bearer ${this.accessToken}`
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null
          this.tokenExpiry = 0
          await this.ensureValidToken()
          return this.client.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  private async ensureValidToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      console.log('Using existing Athena token')
      return
    }

    console.log('Getting new Athena token...')
    console.log('Auth URL:', `${this.credentials.baseUrl}/oauth2/v1/token`)
    console.log('Client ID:', this.credentials.clientId)
    
    const response = await axios.post(
      `${this.credentials.baseUrl}/oauth2/v1/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'athena/service/Athenanet.MDP.* system/Patient.read system/Patient.rs system/Patient.s'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64')}`
        }
      }
    )

    console.log('Token response status:', response.status)
    console.log('Token response data:', response.data)
    
    const tokenData: AthenaTokenResponse = response.data
    this.accessToken = tokenData.access_token
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000
    
    console.log('Athena token obtained successfully')
  }

  // Patient Management - FHIR R4 and v1 API
  async searchPatients(params: any = {}, contextId: string = '195900') {
    const { given, family, name, birthdate, gender, identifier, _count, ...otherParams } = params
    
    // Use FHIR R4 if we have proper FHIR search parameters
    if (given || family || name || birthdate || gender || identifier) {
      const fhirParams: any = {
        'ah-practice': `Organization/a-1.Practice-${contextId}`,
        '_count': _count || '10'
      }
      
      if (given) fhirParams.given = given
      if (family) fhirParams.family = family
      if (name) fhirParams.name = name
      if (birthdate) fhirParams.birthdate = birthdate
      if (gender) fhirParams.gender = gender
      if (identifier) fhirParams.identifier = identifier
      
      const response = await this.client.get('/fhir/r4/Patient', {
        params: fhirParams,
        headers: {
          'Accept': 'application/fhir+json'
        }
      })
      return { success: true, data: response.data, type: 'fhir' }
    }
    
    // Fallback to v1 API for other searches
    const { firstname, lastname, dob } = otherParams
    if (firstname && lastname && dob) {
      const searchParams = { firstname, lastname, dob }
      const response = await this.client.get(`/v1/${contextId}/patients/enhancedbestmatch`, {
        params: searchParams
      })
      return { success: true, data: response.data, type: 'v1' }
    } else {
      const response = await this.client.get(`/v1/${contextId}/patients`, {
        params: otherParams
      })
      return { success: true, data: response.data, type: 'v1' }
    }
  }

  async getPatient(patientId: string, contextId: string = '195900') {
    const response = await this.client.get(`/v1/${contextId}/patients/${patientId}`)
    return { success: true, data: response.data }
  }

  async createPatient(patientData: any, contextId: string = '195900') {
    try {
      const response = await this.client.post(`/v1/${contextId}/patients`, patientData)
      return { success: true, data: response.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async updatePatient(patientId: string, updates: any, contextId: string = '195900') {
    try {
      const response = await this.client.put(`/v1/${contextId}/patients/${patientId}`, updates)
      return { success: true, data: response.data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Appointment Management - v1 API
  async getAppointments(contextId: string = '195900', params: any = {}) {
    const response = await this.client.get(`/v1/${contextId}/appointments`, { params })
    return { success: true, data: response.data }
  }

  // Appointment Confirmation Status
  async getAppointmentConfirmationStatus(contextId: string = '195900', params: any = {}) {
    const response = await this.client.get(`/v1/${contextId}/reference/appointmentconfirmationstatus`, { params })
    return { success: true, data: response.data }
  }



  // Hospital Beds
  async getBeds(contextId: string = '195900', params: any = {}) {
    const response = await this.client.get(`/v1/${contextId}/beds`, { params })
    return { success: true, data: response.data }
  }



  // Test connection
  async testConnection() {
    console.log('Starting Athena connection test...')
    
    await this.ensureValidToken()
    console.log('Token obtained, testing v1 API endpoint first...')
    
    try {
      // Test v1 API first
      const v1Response = await this.client.get('/v1/195900/patients/60178')
      console.log('v1 API response status:', v1Response.status)
      
      // Now try FHIR R4
      console.log('Testing FHIR R4 patient search...')
      const fhirResponse = await this.client.get('/fhir/r4/Patient', {
        params: {
          'ah-practice': 'Organization/a-1.Practice-195900',
          'given': 'Jo',
          'family': 'Smith',
          '_count': '1'
        },
        headers: {
          'Accept': 'application/fhir+json'
        }
      })
      
      console.log('FHIR response status:', fhirResponse.status)
      
      return {
        success: true,
        data: {
          v1: v1Response.data,
          fhir: fhirResponse.data
        },
        message: `Athena Health API connection successful - Both v1 and FHIR working`
      }
    } catch (error: any) {
      console.log('FHIR failed, using v1 only:', error.message)
      
      // Fallback to v1 only
      const v1Response = await this.client.get('/v1/195900/patients/60178')
      
      return {
        success: true,
        data: v1Response.data,
        message: `Athena Health v1 API connection successful (FHIR not available: ${error.message})`
      }
    }
  }

  // Get multiple patients by ID range
  async getPatientRange(startId: number = 60117, endId: number = 60190, contextId: string = '195900') {
    const patients = []
    const errors = []
    
    for (let id = startId; id <= endId; id++) {
      try {
        const response = await this.client.get(`/v1/${contextId}/patients/${id}`)
        if (response.data && response.data.length > 0) {
          patients.push({ id, data: response.data[0] })
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          errors.push({ id, error: error.message })
        }
      }
    }
    
    return {
      success: true,
      patients,
      errors,
      total: patients.length
    }
  }
}

export default AthenaAPI