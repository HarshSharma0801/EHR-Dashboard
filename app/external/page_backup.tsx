"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Calendar,
  ExternalLink,
  Building,
  Database,
  Activity,
  User,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ModMedFHIRForm from "../components/ModMedFHIRForm";
import DynamicModMedSearchForm from "../components/DynamicModMedSearchForm";
import {
  PatientResultDisplay,
  AppointmentResultDisplay,
  PractitionerResultDisplay,
  OrganizationResultDisplay,
} from "../components/ModMedResultDisplays";
import toast from "react-hot-toast";

export default function ExternalPage() {
  const [activeAPI, setActiveAPI] = useState<"athena" | "modmed">("modmed");
  const [activeResourceType, setActiveResourceType] = useState<
    "Patient" | "Appointment" | "Practitioner" | "Organization"
  >("Patient");
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "connected" | "error"
  >("idle");
  const [showForm, setShowForm] = useState<{
    type: "Patient" | "Appointment" | "Organization";
    data?: any;
  } | null>(null);


  // Test API Connection
  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const response = await fetch(`/api/external/${activeAPI}?action=test`);
      const result = await response.json();

      if (result.success) {
        setConnectionStatus("connected");
        toast.success("Connection successful!");
      } else {
        setConnectionStatus("error");
        toast.error("Connection failed");
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error("Connection failed");
    }
  };

  // ModMed FHIR Search Functions
  const searchPatients = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-patients",
        ...searchParams,
      });

      const response = await fetch(`/api/external/modmed?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setPatients(result.data?.entry || []);
        toast.success(`Found ${result.data?.entry?.length || 0} patients`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const searchAppointments = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-appointments",
        ...searchParams,
      });

      const response = await fetch(`/api/external/modmed?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setAppointments(result.data?.entry || []);
        toast.success(`Found ${result.data?.entry?.length || 0} appointments`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching appointments:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const searchPractitioners = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-practitioners",
        ...searchParams,
      });

      const response = await fetch(`/api/external/modmed?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setPractitioners(result.data?.entry || []);
        toast.success(`Found ${result.data?.entry?.length || 0} practitioners`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching practitioners:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const searchOrganizations = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-organizations",
        ...searchParams,
      });

      const response = await fetch(`/api/external/modmed?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setOrganizations(result.data?.entry || []);
        toast.success(`Found ${result.data?.entry?.length || 0} organizations`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching organizations:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Athena Health FHIR functions
  const searchAthenaPatients = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-patients",
        ...searchParams,
      });

      const response = await fetch(`/api/external/athena?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Handle both FHIR and v1 API responses
        if (result.type === 'fhir' && result.data?.entry) {
          setPatients(result.data.entry);
          toast.success(`Found ${result.data.entry.length} patients (FHIR)`);
        } else if (Array.isArray(result.data)) {
          setPatients(result.data.map((patient: any) => ({ resource: patient })));
          toast.success(`Found ${result.data.length} patients (v1 API)`);
        } else {
          setPatients([]);
          toast.error("No patients found");
        }
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const searchAthenaAppointments = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "appointments",
        ...searchParams,
      });

      const response = await fetch(`/api/external/athena?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        const appointmentData = Array.isArray(result.data) ? result.data : [];
        setAppointments(appointmentData.map((apt: any) => ({ resource: apt })));
        toast.success(`Found ${appointmentData.length} appointments`);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching appointments:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const loadAthenaAppointmentStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/external/athena?action=appointment-confirmation-status&limit=10`);
      const result = await response.json();

      if (result.success) {
        const statusData = result.data?.status || [];
        setAppointments(statusData.map((status: any) => ({ resource: status })));
        toast.success(`Loaded ${statusData.length} appointment statuses`);
      } else {
        toast.error(result.error || "Load failed");
      }
    } catch (error) {
      console.error("Error loading appointment status:", error);
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  const searchAthenaPractitioners = async (searchParams: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        action: "search-practitioners",
        ...searchParams,
      });

      const response = await fetch(`/api/external/athena?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        if (result.type === 'fhir' && result.data?.entry) {
          setPractitioners(result.data.entry);
          toast.success(`Found ${result.data.entry.length} practitioners`);
        } else {
          toast.error("Practitioner search not available with current permissions");
        }
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching practitioners:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear results when switching APIs or resource types
  useEffect(() => {
    setPatients([]);
    setAppointments([]);
    setPractitioners([]);
    setOrganizations([]);
  }, [activeAPI, activeResourceType]);

  // ModMed FHIR Operations
  const performFHIROperation = async (
    resource: string,
    operation: string,
    id?: string,
    data?: any
  ) => {
    setLoading(true);
    try {
      let url = `/api/external/modmed?action=${resource.toLowerCase()}`;
      let method = "GET";

      if (operation === "CREATE") {
        method = "POST";
      } else if (operation === "UPDATE" && id) {
        method = "PUT";
        url += `&id=${id}`;
      } else if (operation === "READ" && id) {
        url += `&id=${id}`;
      } else if (operation === "search" && searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const options: any = { method };
      if (data) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (result.success) {
        const entries = result.data?.entry || [];

        switch (resource) {
          case "Patient":
            setPatients(entries);
            break;
          case "Appointment":
            setAppointments(entries);
            break;
          case "Practitioner":
            setPractitioners(entries);
            break;
          case "Organization":
            setOrganizations(entries);
            break;
        }

        toast.success(`${operation} ${resource} successful`);
      } else {
        toast.error(result.error || `${operation} ${resource} failed`);
      }
    } catch (error) {
      toast.error(`${operation} ${resource} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (
    data: any,
    operation: "CREATE" | "UPDATE"
  ) => {
    if (!showForm) return;

    await performFHIROperation(
      showForm.type,
      operation,
      showForm.data?.resource?.id,
      data
    );
    setShowForm(null);
  };



  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                External API Integration
              </h1>
              <p className="text-gray-600 mt-2">
                Advanced FHIR-compliant search and data management
              </p>
            </div>

            {/* API Selection and Connection Status */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Select API:
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant={activeAPI === "athena" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setActiveAPI("athena")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Athena Health
                    </Button>
                    <Button
                      variant={activeAPI === "modmed" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setActiveAPI("modmed")}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      ModMed FHIR
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        connectionStatus === "connected"
                          ? "bg-green-500"
                          : connectionStatus === "error"
                          ? "bg-red-500"
                          : connectionStatus === "testing"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {connectionStatus === "connected"
                        ? "Connected"
                        : connectionStatus === "error"
                        ? "Error"
                        : connectionStatus === "testing"
                        ? "Testing..."
                        : "Not Connected"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    loading={connectionStatus === "testing"}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </Card>

            {activeAPI === "athena" ? (
              // Athena Health FHIR Interface
              <>
                {/* Resource Type Selector */}
                <Card className="mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Search Resource:
                    </span>
                    <div className="flex space-x-2">
                      {[
                        "Patient",
                        "Appointment",
                        "Practitioner",
                      ].map((type) => (
                        <Button
                          key={type}
                          variant={
                            activeResourceType === type ? "primary" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveResourceType(type as any)}
                        >
                          {type === "Patient" && (
                            <User className="w-4 h-4 mr-2" />
                          )}
                          {type === "Appointment" && (
                            <Calendar className="w-4 h-4 mr-2" />
                          )}
                          {type === "Practitioner" && (
                            <Users className="w-4 h-4 mr-2" />
                          )}
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Search Forms and Results */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Athena Search Forms */}
                    {activeResourceType === "Patient" && (
                      <Card title="Patient Search" subtitle="Search patients using FHIR R4 or v1 API">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="First name (given)"
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Input
                              placeholder="Last name (family)"
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => searchAthenaPatients({ given: 'Jo', family: 'Smith', _count: '10' })}
                              loading={loading}
                              size="sm"
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Search Jo Smith
                            </Button>
                            <Button
                              onClick={() => searchAthenaPatients({ given: 'John', family: 'Doe', _count: '5' })}
                              loading={loading}
                              size="sm"
                              variant="outline"
                            >
                              Search John Doe
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {activeResourceType === "Appointment" && (
                      <Card title="Appointment Search" subtitle="Search appointments and statuses">
                        <div className="space-y-4">
                          <Button
                            onClick={loadAthenaAppointmentStatus}
                            loading={loading}
                            className="w-full"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Load Appointment Confirmation Status
                          </Button>
                          <Button
                            onClick={() => searchAthenaAppointments({ limit: '10' })}
                            loading={loading}
                            variant="outline"
                            className="w-full"
                          >
                            Search Recent Appointments
                          </Button>
                        </div>
                      </Card>
                    )}

                    {activeResourceType === "Practitioner" && (
                      <Card title="Practitioner Search" subtitle="Search healthcare providers">
                        <div className="space-y-4">
                          <Button
                            onClick={() => searchAthenaPractitioners({ _count: '5' })}
                            loading={loading}
                            className="w-full"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Search Practitioners
                          </Button>
                          <p className="text-sm text-gray-500">
                            Note: Practitioner search requires additional permissions
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Athena Result Displays */}
                    {activeResourceType === "Patient" && (
                      <Card title="Patient Results" subtitle={`Found ${patients.length} patients`}>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Searching...</span>
                          </div>
                        ) : patients.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {patients.map((entry: any, index) => {
                              const patient = entry.resource;
                              const name = patient.name?.[0] || {};
                              const given = name.given?.[0] || patient.firstname || 'N/A';
                              const family = name.family || patient.lastname || 'N/A';
                              const id = patient.id || patient.patientid || 'N/A';
                              const birthDate = patient.birthDate || patient.dob || 'N/A';
                              const gender = patient.gender || patient.sex || 'N/A';
                              
                              return (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                  <div className="font-semibold text-gray-900">
                                    {given} {family}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <div>ID: {id}</div>
                                    <div>DOB: {birthDate}</div>
                                    <div>Gender: {gender}</div>
                                    {patient.telecom && (
                                      <div>Contact: {patient.telecom[0]?.value}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No patients found. Try searching for "Jo Smith" or "John Doe"
                          </p>
                        )}
                      </Card>
                    )}

                    {activeResourceType === "Appointment" && (
                      <Card title="Appointment Results" subtitle={`Found ${appointments.length} items`}>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                          </div>
                        ) : appointments.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {appointments.map((entry: any, index) => {
                              const item = entry.resource;
                              
                              return (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                  <div className="font-semibold text-gray-900">
                                    {item.name || `Status ID: ${item.statusid}`}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {item.statusid && <div>Status ID: {item.statusid}</div>}
                                    {item.appointmentid && <div>Appointment ID: {item.appointmentid}</div>}
                                    {item.date && <div>Date: {item.date}</div>}
                                    {item.time && <div>Time: {item.time}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No appointments found. Try loading appointment confirmation status.
                          </p>
                        )}
                      </Card>
                    )}

                    {activeResourceType === "Practitioner" && (
                      <Card title="Practitioner Results" subtitle={`Found ${practitioners.length} practitioners`}>
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                          </div>
                        ) : practitioners.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {practitioners.map((entry: any, index) => {
                              const practitioner = entry.resource;
                              const name = practitioner.name?.[0] || {};
                              const given = name.given?.[0] || 'N/A';
                              const family = name.family || 'N/A';
                              
                              return (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                  <div className="font-semibold text-gray-900">
                                    {given} {family}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <div>ID: {practitioner.id}</div>
                                    {practitioner.qualification && (
                                      <div>Qualification: {practitioner.qualification[0]?.code?.text}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No practitioners found. This feature requires additional API permissions.
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // ModMed FHIR Interface with Advanced Search
              <>
                {/* Resource Type Selector */}
                <Card className="mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Search Resource:
                    </span>
                    <div className="flex space-x-2">
                      {[
                        "Patient",
                        "Appointment",
                        "Practitioner",
                        "Organization",
                      ].map((type) => (
                        <Button
                          key={type}
                          variant={
                            activeResourceType === type ? "primary" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveResourceType(type as any)}
                        >
                          {type === "Patient" && (
                            <User className="w-4 h-4 mr-2" />
                          )}
                          {type === "Appointment" && (
                            <Calendar className="w-4 h-4 mr-2" />
                          )}
                          {type === "Practitioner" && (
                            <Users className="w-4 h-4 mr-2" />
                          )}
                          {type === "Organization" && (
                            <Building className="w-4 h-4 mr-2" />
                          )}
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Search Forms and Results */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Dynamic Search Form */}
                    <DynamicModMedSearchForm
                      resourceType={activeResourceType}
                      onSearch={(params) => {
                        switch (activeResourceType) {
                          case "Patient":
                            searchPatients(params);
                            break;
                          case "Appointment":
                            searchAppointments(params);
                            break;
                          case "Practitioner":
                            searchPractitioners(params);
                            break;
                          case "Organization":
                            searchOrganizations(params);
                            break;
                        }
                      }}
                      loading={loading}
                    />
                  </div>

                  <div className="space-y-6">
                    {/* Result Displays */}
                    {activeResourceType === "Patient" && (
                      <PatientResultDisplay
                        data={patients}
                        loading={loading}
                      />
                    )}
                    {activeResourceType === "Appointment" && (
                      <AppointmentResultDisplay
                        data={appointments}
                        loading={loading}
                      />
                    )}
                    {activeResourceType === "Practitioner" && (
                      <PractitionerResultDisplay
                        data={practitioners}
                        loading={loading}
                      />
                    )}
                    {activeResourceType === "Organization" && (
                      <OrganizationResultDisplay
                        data={organizations}
                        loading={loading}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* FHIR Form Modal */}
      {showForm && (
        <ModMedFHIRForm
          resourceType={showForm.type}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(null)}
          initialData={showForm.data}
        />
      )}
    </div>
  );
}
