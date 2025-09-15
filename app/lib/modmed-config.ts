// ModMed FHIR API Configuration
// This file centralizes all ModMed API configuration to eliminate hardcoding

export interface ModMedConfig {
  baseUrl: string;
  firmPrefix: string;
  apiKey: string;
  username: string;
  password: string;
  endpoints: {
    auth: string;
    fhir: string;
  };
  searchParameters: {
    Patient: SearchParameterConfig[];
    Appointment: SearchParameterConfig[];
    Practitioner: SearchParameterConfig[];
    Organization: SearchParameterConfig[];
  };
  resourceTypes: ResourceTypeConfig[];
}

export interface SearchParameterConfig {
  name: string;
  type: "string" | "date" | "boolean" | "select" | "identifier";
  label: string;
  description: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ResourceTypeConfig {
  name: string;
  endpoint: string;
  displayName: string;
  description: string;
  icon: string;
  searchable: boolean;
  creatable: boolean;
  updatable: boolean;
  deletable: boolean;
}

// Default configuration - can be overridden by environment variables
export const defaultModMedConfig: ModMedConfig = {
  baseUrl: process.env.MODMED_BASE_URL || "https://stage.ema-api.com/ema-training",
  firmPrefix: process.env.MODMED_FIRM_PREFIX || "",
  apiKey: process.env.MODMED_API_KEY || "",
  username: process.env.MODMED_USERNAME || "",
  password: process.env.MODMED_PASSWORD || "",

  endpoints: {
    auth: "/ema/ws/oauth2/grant",
    fhir: "/ema/fhir/v2",
  },

  resourceTypes: [
    {
      name: "Patient",
      endpoint: "/Patient",
      displayName: "Patients",
      description: "Individual receiving healthcare services",
      icon: "User",
      searchable: true,
      creatable: true,
      updatable: true,
      deletable: false,
    },
    {
      name: "Appointment",
      endpoint: "/Appointment",
      displayName: "Appointments",
      description: "Healthcare appointments and scheduling",
      icon: "Calendar",
      searchable: true,
      creatable: true,
      updatable: true,
      deletable: true,
    },
    {
      name: "Practitioner",
      endpoint: "/Practitioner",
      displayName: "Practitioners",
      description: "Healthcare providers and practitioners",
      icon: "Users",
      searchable: true,
      creatable: false,
      updatable: false,
      deletable: false,
    },
    {
      name: "Organization",
      endpoint: "/Organization",
      displayName: "Organizations",
      description: "Healthcare organizations, payers, and institutions",
      icon: "Building",
      searchable: true,
      creatable: true,
      updatable: true,
      deletable: false,
    },
  ],

  searchParameters: {
    Patient: [
      {
        name: "family",
        type: "string",
        label: "Last Name (Family)",
        description: "Exact match for patient's last name",
        placeholder: "Enter last name...",
        validation: { minLength: 1, maxLength: 50 },
      },
      {
        name: "given",
        type: "string",
        label: "First Name (Given)",
        description: "Portion of patient's first name",
        placeholder: "Enter first name...",
        validation: { minLength: 1, maxLength: 50 },
      },
      {
        name: "active",
        type: "select",
        label: "Active Status",
        description: "Patient's active status",
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
      {
        name: "birthdate",
        type: "date",
        label: "Birth Date",
        description: "Patient's date of birth (YYYY-MM-DD)",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "gender",
        type: "select",
        label: "Gender",
        description: "Patient's gender",
        options: [
          { value: "", label: "Any" },
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "unknown", label: "Unknown" },
        ],
      },
      {
        name: "email",
        type: "string",
        label: "Email",
        description: "Email address in contact field",
        placeholder: "Enter email address...",
        validation: { pattern: "^[^@]+@[^@]+\\.[^@]+$" },
      },
      {
        name: "phone",
        type: "string",
        label: "Phone",
        description: "Phone number in contact field",
        placeholder: "Enter phone number...",
      },
      {
        name: "address-postalcode",
        type: "string",
        label: "Postal Code",
        description: "Postal code in patient's address",
        placeholder: "Enter ZIP/postal code...",
        validation: { minLength: 3, maxLength: 10 },
      },
      {
        name: "identifier",
        type: "identifier",
        label: "Identifier",
        description: "Patient identifier (MRN, PMS ID, SSN)",
        placeholder:
          "Examples: MR|MM0000000178, PMS|10049100000047, SSN|123456789",
      },
      {
        name: "_lastUpdated",
        type: "date",
        label: "Last Updated (After)",
        description: "Find patients updated after this date/time",
        placeholder: "YYYY-MM-DDTHH:MM:SS",
      },
    ],

    Appointment: [
      {
        name: "patient",
        type: "string",
        label: "Patient ID",
        description: "Specific patient identifier",
        placeholder: "Enter patient ID...",
      },
      {
        name: "practitioner",
        type: "string",
        label: "Practitioner ID",
        description: "Specific practitioner identifier",
        placeholder: "Enter practitioner ID...",
      },
      {
        name: "status",
        type: "select",
        label: "Status",
        description: "Appointment status",
        options: [
          { value: "", label: "Any Status" },
          { value: "booked", label: "Booked" },
          { value: "arrived", label: "Arrived" },
          { value: "cancelled", label: "Cancelled" },
          { value: "noshow", label: "No Show" },
          { value: "pending", label: "Pending" },
          { value: "checked-in", label: "Checked In" },
          { value: "fulfilled", label: "Fulfilled" },
        ],
      },
      {
        name: "date",
        type: "date",
        label: "Appointment Date",
        description: "Specific date or date range (use ge/le operators)",
        placeholder: "YYYY-MM-DD",
      },
      {
        name: "location",
        type: "string",
        label: "Location ID",
        description: "Specific location identifier",
        placeholder: "Enter location ID...",
      },
      {
        name: "appointment-type",
        type: "string",
        label: "Appointment Type ID",
        description: "Specific appointment type (comma-separated for multiple)",
        placeholder: "Enter appointment type ID...",
      },
      {
        name: "supporting-info",
        type: "string",
        label: "Supporting Information",
        description: "Referring Provider or Referral Source",
        placeholder: "Enter referring provider or referral source...",
      },
      {
        name: "_lastUpdated",
        type: "date",
        label: "Last Updated (After)",
        description: "Find appointments updated after this date/time",
        placeholder: "YYYY-MM-DDTHH:MM:SS",
      },
    ],

    Practitioner: [
      {
        name: "family",
        type: "string",
        label: "Last Name (Family)",
        description: "Exact match for practitioner's last name",
        placeholder: "Enter last name...",
        validation: { minLength: 1, maxLength: 50 },
      },
      {
        name: "given",
        type: "string",
        label: "First Name (Given)",
        description: "Portion of practitioner's first name",
        placeholder: "Enter first name...",
        validation: { minLength: 1, maxLength: 50 },
      },
      {
        name: "active",
        type: "select",
        label: "Active Status",
        description: "Practitioner's active status",
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
      {
        name: "email",
        type: "string",
        label: "Email",
        description: "Email address in contact field",
        placeholder: "Enter email address...",
        validation: { pattern: "^[^@]+@[^@]+\\.[^@]+$" },
      },
      {
        name: "phone",
        type: "string",
        label: "Phone",
        description: "Phone number in contact field",
        placeholder: "Enter phone number...",
      },
      {
        name: "identifier",
        type: "string",
        label: "NPI Number",
        description: "National Provider Identifier",
        placeholder: "Enter NPI number...",
        validation: { pattern: "^\\d{10}$", minLength: 10, maxLength: 10 },
      },
      {
        name: "type",
        type: "select",
        label: "Provider Type",
        description: "Type of provider",
        options: [
          { value: "", label: "Any Type" },
          { value: "ref", label: "Referring Provider" },
        ],
      },
    ],

    Organization: [
      {
        name: "type",
        type: "select",
        label: "Organization Type",
        description: "Type of organization (required for search)",
        required: true,
        options: [
          { value: "", label: "Select Type" },
          { value: "pay", label: "Payers" },
          { value: "prov", label: "Referring Institutions" },
        ],
      },
      {
        name: "name",
        type: "string",
        label: "Organization Name",
        description: "Exact match for organization name",
        placeholder: "Enter organization name...",
        validation: { minLength: 1, maxLength: 100 },
      },
      {
        name: "active",
        type: "select",
        label: "Active Status",
        description: "Organization's active status",
        options: [
          { value: "", label: "Any" },
          { value: "true", label: "Active" },
          { value: "false", label: "Inactive" },
        ],
      },
      {
        name: "identifier",
        type: "identifier",
        label: "Payer ID (for Payers)",
        description: "Payer organization identifier",
        placeholder: "Example: payerId|09102",
      },
      {
        name: "_lastUpdated",
        type: "date",
        label: "Last Updated (After)",
        description: "Find organizations updated after this date/time",
        placeholder: "YYYY-MM-DDTHH:MM:SS",
      },
    ],
  },
};

// Utility functions for configuration
export const getResourceConfig = (
  resourceType: string
): ResourceTypeConfig | undefined => {
  return defaultModMedConfig.resourceTypes.find((r) => r.name === resourceType);
};

export const getSearchParameters = (
  resourceType: string
): SearchParameterConfig[] => {
  return (
    defaultModMedConfig.searchParameters[
      resourceType as keyof typeof defaultModMedConfig.searchParameters
    ] || []
  );
};

export const buildFHIREndpoint = (resourceType: string): string => {
  const config = getResourceConfig(resourceType);
  if (!config) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }

  return `${defaultModMedConfig.baseUrl}/firm/${defaultModMedConfig.firmPrefix}${defaultModMedConfig.endpoints.fhir}${config.endpoint}`;
};

export const buildAuthEndpoint = (): string => {
  return `${defaultModMedConfig.baseUrl}/firm/${defaultModMedConfig.firmPrefix}${defaultModMedConfig.endpoints.auth}`;
};

// Validation helpers
export const validateSearchParameter = (
  param: SearchParameterConfig,
  value: string
): string | null => {
  if (param.required && !value.trim()) {
    return `${param.label} is required`;
  }

  if (!value.trim()) {
    return null; // Optional parameter, no validation needed
  }

  const validation = param.validation;
  if (!validation) {
    return null;
  }

  if (validation.minLength && value.length < validation.minLength) {
    return `${param.label} must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return `${param.label} must be no more than ${validation.maxLength} characters`;
  }

  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    return `${param.label} format is invalid`;
  }

  return null;
};

export const validateAllSearchParameters = (
  resourceType: string,
  searchParams: Record<string, string>
): Record<string, string> => {
  const parameters = getSearchParameters(resourceType);
  const errors: Record<string, string> = {};

  parameters.forEach((param) => {
    const value = searchParams[param.name] || "";
    const error = validateSearchParameter(param, value);
    if (error) {
      errors[param.name] = error;
    }
  });

  return errors;
};
