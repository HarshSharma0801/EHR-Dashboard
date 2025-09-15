import axios, { AxiosInstance } from "axios";

interface ModMedCredentials {
  baseUrl: string;
  firmPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

class ModMedAPI {
  private client: AxiosInstance;
  private credentials: ModMedCredentials;
  private accessToken: string | null = null;

  constructor(credentials: ModMedCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: `${credentials.baseUrl}/firm/${credentials.firmPrefix}/ema/fhir/v2`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
        "x-api-key": credentials.apiKey,
        "cache-control": "no-cache",
      },
    });

    this.client.interceptors.request.use(async (config) => {
      await this.ensureAuthenticated();
      if (this.accessToken) {
        config.headers["Authorization"] = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.accessToken = null;
          await this.ensureAuthenticated();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async ensureAuthenticated() {
    if (this.accessToken) return;

    const authEndpoint = `${this.credentials.baseUrl}/firm/${this.credentials.firmPrefix}/ema/ws/oauth2/grant`;

    const response = await axios.post(
      authEndpoint,
      new URLSearchParams({
        grant_type: "password",
        username: this.credentials.username,
        password: this.credentials.password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": this.credentials.apiKey,
          "cache-control": "no-cache",
        },
        timeout: 15000,
      }
    );

    // Check if response is HTML (authentication failed)
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      throw new Error(
        "Authentication failed - firm access denied or invalid credentials"
      );
    }

    if (!response.data.access_token) {
      throw new Error("No access token received from authentication");
    }

    this.accessToken = response.data.access_token;
  }

  // Patient Management
  async searchPatients(params: any = {}) {
    const searchParams =
      Object.keys(params).length > 0 ? params : { _count: "10" };
    const response = await this.client.get("/Patient", {
      params: searchParams,
    });

    // Check if response is HTML (indicates authentication/access issue)
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      throw new Error(
        "API returned HTML - authentication or firm access issue"
      );
    }

    return { success: true, data: response.data };
  }

  async getPatient(patientId: string) {
    const response = await this.client.get(`/Patient/${patientId}`);
    return { success: true, data: response.data };
  }

  // Appointment Management
  async searchAppointments(params: any = {}) {
    const searchParams =
      Object.keys(params).length > 0 ? params : { _count: "10" };
    const response = await this.client.get("/Appointment", {
      params: searchParams,
    });

    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      throw new Error(
        "API returned HTML - authentication or firm access issue"
      );
    }

    return { success: true, data: response.data };
  }

  async getAppointment(appointmentId: string) {
    const response = await this.client.get(`/Appointment/${appointmentId}`);
    return { success: true, data: response.data };
  }

  // Practitioner Management
  async searchPractitioners(params: any = {}) {
    const searchParams =
      Object.keys(params).length > 0 ? params : { _count: "10" };
    const response = await this.client.get("/Practitioner", {
      params: searchParams,
    });

    // Check if response is HTML (indicates authentication/access issue)
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      throw new Error(
        "API returned HTML - authentication or firm access issue"
      );
    }

    return { success: true, data: response.data };
  }

  async getPractitioner(practitionerId: string) {
    const response = await this.client.get(`/Practitioner/${practitionerId}`);
    return { success: true, data: response.data };
  }

  // Organization Management
  async searchOrganizations(params: any = {}) {
    const searchParams =
      Object.keys(params).length > 0 ? params : { type: "pay", _count: "10" };
    const response = await this.client.get("/Organization", {
      params: searchParams,
    });

    // Check if response is HTML (indicates authentication/access issue)
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      throw new Error(
        "API returned HTML - authentication or firm access issue"
      );
    }

    return { success: true, data: response.data };
  }

  async getOrganization(organizationId: string) {
    const response = await this.client.get(`/Organization/${organizationId}`);
    return { success: true, data: response.data };
  }

  // Test API connection
  async testConnection() {
    const response = await this.client.get("/Patient", {
      params: { _count: "1" },
    });

    // Check if response is HTML (indicates authentication/access issue)
    if (
      typeof response.data === "string" &&
      response.data.includes("<!DOCTYPE html")
    ) {
      return {
        success: false,
        message:
          "Authentication failed - firm access denied or invalid credentials",
        error: "The API returned an HTML login page instead of JSON data",
      };
    }

    return {
      success: true,
      data: response.data,
      message: `ModMed FHIR connection successful - Found ${
        response.data?.total || 0
      } patients`,
    };
  }
}

export default ModMedAPI;
