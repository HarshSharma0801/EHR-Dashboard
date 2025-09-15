'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Users,
  Calendar,
  ExternalLink,
  Building,
  Database,
  Activity,
  User,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ModMedFHIRForm from '../components/ModMedFHIRForm'
import DynamicModMedSearchForm from '../components/DynamicModMedSearchForm'
import {
  PatientResultDisplay,
  AppointmentResultDisplay,
  PractitionerResultDisplay,
  OrganizationResultDisplay,
} from '../components/ModMedResultDisplays'
import toast from 'react-hot-toast'

export default function ExternalPage() {
  const [activeAPI, setActiveAPI] = useState<'athena' | 'modmed'>('modmed')
  const [activeResourceType, setActiveResourceType] = useState<
    'Patient' | 'Appointment' | 'Practitioner' | 'Organization'
  >('Patient')
  const [searchQuery, setSearchQuery] = useState('')
  const [patientSearchParams, setPatientSearchParams] = useState({
    given: '',
    family: '',
  })
  const [appointmentSearchParams, setAppointmentSearchParams] = useState({
    departmentid: '',
    startdate: '',
    enddate: '',
  })
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'connected' | 'error'
  >('idle')
  const [showForm, setShowForm] = useState<{
    type: 'Patient' | 'Appointment' | 'Organization'
    data?: any
  } | null>(null)

  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      const response = await fetch(`/api/external/${activeAPI}?action=test`)
      const result = await response.json()

      if (result.success) {
        setConnectionStatus('connected')
        toast.success('Connection successful!')
      } else {
        setConnectionStatus('error')
        toast.error('Connection failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Connection failed')
    }
  }

  const searchPatients = async (searchParams: any) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        action: 'search-patients',
        ...searchParams,
      })

      const response = await fetch(`/api/external/modmed?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setPatients(result.data?.entry || [])
        toast.success(`Found ${result.data?.entry?.length || 0} patients`)
      } else {
        toast.error(result.error || 'Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const searchAppointments = async (searchParams: any) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        action: 'search-appointments',
        ...searchParams,
      })

      const response = await fetch(`/api/external/modmed?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setAppointments(result.data?.entry || [])
        toast.success(`Found ${result.data?.entry?.length || 0} appointments`)
      } else {
        toast.error(result.error || 'Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const searchPractitioners = async (searchParams: any) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        action: 'search-practitioners',
        ...searchParams,
      })

      const response = await fetch(`/api/external/modmed?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setPractitioners(result.data?.entry || [])
        toast.success(`Found ${result.data?.entry?.length || 0} practitioners`)
      } else {
        toast.error(result.error || 'Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const searchOrganizations = async (searchParams: any) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        action: 'search-organizations',
        ...searchParams,
      })

      const response = await fetch(`/api/external/modmed?${queryParams}`)
      const result = await response.json()

      if (result.success) {
        setOrganizations(result.data?.entry || [])
        toast.success(`Found ${result.data?.entry?.length || 0} organizations`)
      } else {
        toast.error(result.error || 'Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

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
        if (result.type === "fhir" && result.data?.entry) {
          setPatients(result.data.entry);
          toast.success(`Found ${result.data.entry.length} patients (FHIR)`);
        } else if (Array.isArray(result.data)) {
          setPatients(
            result.data.map((patient: any) => ({ resource: patient }))
          );
          toast.success(`Found ${result.data.length} patients (v1 API)`);
        } else {
          setPatients([]);
          toast.error("No patients found");
        }
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
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
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const loadAthenaAppointmentStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/external/athena?action=appointment-confirmation-status&limit=10`
      );
      const result = await response.json();

      if (result.success) {
        const statusData = result.data?.status || [];
        setAppointments(
          statusData.map((status: any) => ({
            resource: { ...status, type: "status" },
          }))
        );
        toast.success(`Loaded ${statusData.length} appointment statuses`);
      } else {
        toast.error(result.error || "Load failed");
      }
    } catch (error) {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  const loadAthenaAppointmentsWithStatus = async () => {
    setLoading(true);
    try {
      const [appointmentsRes, statusRes] = await Promise.all([
        fetch(`/api/external/athena?action=appointments&limit=20`),
        fetch(
          `/api/external/athena?action=appointment-confirmation-status&limit=20`
        ),
      ]);

      const appointmentsResult = await appointmentsRes.json();
      const statusResult = await statusRes.json();

      const combinedData = [];

      if (appointmentsResult.success && appointmentsResult.data) {
        const appointmentData = Array.isArray(appointmentsResult.data)
          ? appointmentsResult.data
          : [];
        combinedData.push(
          ...appointmentData.map((apt: any) => ({
            resource: { ...apt, type: "appointment" },
          }))
        );
      }

      if (statusResult.success && statusResult.data?.status) {
        combinedData.push(
          ...statusResult.data.status.map((status: any) => ({
            resource: { ...status, type: "status" },
          }))
        );
      }

      setAppointments(combinedData);
      toast.success(`Loaded ${combinedData.length} appointment items`);
    } catch (error) {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  // Clear results when switching APIs or resource types
  useEffect(() => {
    setPatients([])
    setAppointments([])
    setPractitioners([])
    setOrganizations([])
  }, [activeAPI, activeResourceType])

  const performFHIROperation = async (
    resource: string,
    operation: string,
    id?: string,
    data?: any
  ) => {
    setLoading(true)
    try {
      let url = `/api/external/modmed?action=${resource.toLowerCase()}`
      let method = 'GET'

      if (operation === 'CREATE') {
        method = 'POST'
      } else if (operation === 'UPDATE' && id) {
        method = 'PUT'
        url += `&id=${id}`
      } else if (operation === 'read' && id) {
        url += `&id=${id}`
      } else if (operation === 'search' && searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      const options: any = { method }
      if (data) {
        options.headers = { 'Content-Type': 'application/json' }
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)
      const result = await response.json()

      if (result.success) {
        const entries = result.data?.entry || []

        switch (resource) {
          case 'Patient':
            setPatients(entries)
            break
          case 'Appointment':
            setAppointments(entries)
            break
          case 'Practitioner':
            setPractitioners(entries)
            break
          case 'Organization':
            setOrganizations(entries)
            break
        }

        toast.success(`${operation} ${resource} successful`)
      } else {
        toast.error(result.error || `${operation} ${resource} failed`)
      }
    } catch (error) {
      toast.error(`${operation} ${resource} failed`)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (
    data: any,
    operation: 'CREATE' | 'UPDATE'
  ) => {
    if (!showForm) return

    await performFHIROperation(
      showForm.type,
      operation,
      showForm.data?.resource?.id,
      data
    )
    setShowForm(null)
  }

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

            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Select API:
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant={activeAPI === 'athena' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setActiveAPI('athena')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Athena Health
                    </Button>
                    <Button
                      variant={activeAPI === 'modmed' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setActiveAPI('modmed')}
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
                        connectionStatus === 'connected'
                          ? 'bg-green-500'
                          : connectionStatus === 'error'
                          ? 'bg-red-500'
                          : connectionStatus === 'testing'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {connectionStatus === 'connected'
                        ? 'Connected'
                        : connectionStatus === 'error'
                        ? 'Error'
                        : connectionStatus === 'testing'
                        ? 'Testing...'
                        : 'Not Connected'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testConnection}
                    loading={connectionStatus === 'testing'}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </Card>

            {activeAPI === 'athena' ? (
              <>
                <Card className="mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Search Resource:
                    </span>
                    <div className="flex space-x-2">
                      {['Patient', 'Appointment'].map((type) => (
                        <Button
                          key={type}
                          variant={
                            activeResourceType === type ? 'primary' : 'outline'
                          }
                          size="sm"
                          onClick={() => setActiveResourceType(type as any)}
                        >
                          {type === 'Patient' && (
                            <User className="w-4 h-4 mr-2" />
                          )}
                          {type === 'Appointment' && (
                            <Calendar className="w-4 h-4 mr-2" />
                          )}
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {activeResourceType === 'Patient' && (
                      <Card
                        title="Patient Search"
                        subtitle="Search patients using FHIR R4 or v1 API"
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="First name (given)"
                              value={patientSearchParams.given}
                              onChange={(e) =>
                                setPatientSearchParams((prev) => ({
                                  ...prev,
                                  given: e.target.value,
                                }))
                              }
                            />
                            <Input
                              placeholder="Last name (family)"
                              value={patientSearchParams.family}
                              onChange={(e) =>
                                setPatientSearchParams((prev) => ({
                                  ...prev,
                                  family: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() =>
                                searchAthenaPatients({
                                  ...patientSearchParams,
                                  _count: '10',
                                })
                              }
                              loading={loading}
                              disabled={
                                !patientSearchParams.given &&
                                !patientSearchParams.family
                              }
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Search Patients
                            </Button>
                            <Button
                              onClick={() => {
                                setPatientSearchParams({
                                  given: 'Jo',
                                  family: 'Smith',
                                })
                                searchAthenaPatients({
                                  given: 'Jo',
                                  family: 'Smith',
                                  _count: '10',
                                })
                              }}
                              loading={loading}
                              size="sm"
                              variant="outline"
                            >
                              Try Jo Smith
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {activeResourceType === "Appointment" && (
                      <Card
                        title="Appointment Search"
                        subtitle="Search appointments and statuses"
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <Input
                              placeholder="Department ID (optional)"
                              value={appointmentSearchParams.departmentid}
                              onChange={(e) =>
                                setAppointmentSearchParams((prev) => ({
                                  ...prev,
                                  departmentid: e.target.value,
                                }))
                              }
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                type="date"
                                placeholder="Start Date"
                                value={appointmentSearchParams.startdate}
                                onChange={(e) =>
                                  setAppointmentSearchParams((prev) => ({
                                    ...prev,
                                    startdate: e.target.value,
                                  }))
                                }
                              />
                              <Input
                                type="date"
                                placeholder="End Date"
                                value={appointmentSearchParams.enddate}
                                onChange={(e) =>
                                  setAppointmentSearchParams((prev) => ({
                                    ...prev,
                                    enddate: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() =>
                                searchAthenaAppointments({
                                  ...appointmentSearchParams,
                                  limit: "10",
                                })
                              }
                              loading={loading}
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Search Appointments
                            </Button>
                            <Button
                              onClick={loadAthenaAppointmentsWithStatus}
                              loading={loading}
                              variant="outline"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Load All Data
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    {activeResourceType === 'Patient' && (
                      <Card
                        title="Patient Results"
                        subtitle={`Found ${patients.length} patients`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Searching...
                            </span>
                          </div>
                        ) : patients.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {patients.map((entry: any, index) => {
                              const patient = entry.resource;
                              const name = patient.name?.[0] || {};
                              const given =
                                name.given?.[0] || patient.firstname || 'N/A'
                              const family =
                                name.family || patient.lastname || 'N/A'
                              const id =
                                patient.id || patient.patientid || 'N/A'
                              const birthDate =
                                patient.birthDate || patient.dob || 'N/A'
                              const gender =
                                patient.gender || patient.sex || 'N/A'

                              return (
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 rounded-lg border"
                                >
                                  <div className="font-semibold text-gray-900">
                                    {given} {family}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <div>ID: {id}</div>
                                    <div>DOB: {birthDate}</div>
                                    <div>Gender: {gender}</div>
                                    {patient.telecom && (
                                      <div>
                                        Contact: {patient.telecom[0]?.value}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No patients found. Try searching for "Jo Smith" or
                            "John Doe"
                          </p>
                        )}
                      </Card>
                    )}

                    {activeResourceType === "Appointment" && (
                      <Card
                        title="Appointment Results"
                        subtitle={`Found ${appointments.length} items`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">
                              Loading...
                            </span>
                          </div>
                        ) : appointments.length > 0 ? (
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {appointments.map((entry: any, index) => {
                              const item = entry.resource;
                              const isStatus = item.type === "status";
                              const isAppointment = item.type === "appointment";

                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg border ${
                                    isStatus
                                      ? "bg-blue-50 border-blue-200"
                                      : isAppointment
                                      ? "bg-green-50 border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="font-semibold text-gray-900">
                                      {isStatus && `Status: ${item.name}`}
                                      {isAppointment &&
                                        `Appointment ID: ${
                                          item.appointmentid || "N/A"
                                        }`}
                                      {!isStatus &&
                                        !isAppointment &&
                                        (item.name ||
                                          `ID: ${
                                            item.statusid || item.appointmentid
                                          }`)}
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs rounded ${
                                        isStatus
                                          ? "bg-blue-100 text-blue-800"
                                          : isAppointment
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {isStatus
                                        ? "Status"
                                        : isAppointment
                                        ? "Appointment"
                                        : "Data"}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-2">
                                    {item.statusid && (
                                      <div>Status ID: {item.statusid}</div>
                                    )}
                                    {item.appointmentid && (
                                      <div>
                                        Appointment ID: {item.appointmentid}
                                      </div>
                                    )}
                                    {item.date && <div>Date: {item.date}</div>}
                                    {item.starttime && (
                                      <div>Start Time: {item.starttime}</div>
                                    )}
                                    {item.duration && (
                                      <div>Duration: {item.duration} min</div>
                                    )}
                                    {item.appointmenttype && (
                                      <div>Type: {item.appointmenttype}</div>
                                    )}
                                    {item.patientid && (
                                      <div>Patient ID: {item.patientid}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No appointments found. Try searching with date range
                            or load all data.
                          </p>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Card className="mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Search Resource:
                    </span>
                    <div className="flex space-x-2">
                      {[
                        'Patient',
                        'Appointment',
                        'Practitioner',
                        'Organization',
                      ].map((type) => (
                        <Button
                          key={type}
                          variant={
                            activeResourceType === type ? 'primary' : 'outline'
                          }
                          size="sm"
                          onClick={() => setActiveResourceType(type as any)}
                        >
                          {type === 'Patient' && (
                            <User className="w-4 h-4 mr-2" />
                          )}
                          {type === 'Appointment' && (
                            <Calendar className="w-4 h-4 mr-2" />
                          )}
                          {type === 'Practitioner' && (
                            <Users className="w-4 h-4 mr-2" />
                          )}
                          {type === 'Organization' && (
                            <Building className="w-4 h-4 mr-2" />
                          )}
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <DynamicModMedSearchForm
                      resourceType={activeResourceType}
                      onSearch={(params) => {
                        switch (activeResourceType) {
                          case 'Patient':
                            searchPatients(params)
                            break
                          case 'Appointment':
                            searchAppointments(params)
                            break
                          case 'Practitioner':
                            searchPractitioners(params)
                            break
                          case 'Organization':
                            searchOrganizations(params)
                            break
                        }
                      }}
                      loading={loading}
                    />
                  </div>

                  <div className="space-y-6">
                    {activeResourceType === 'Patient' && (
                      <PatientResultDisplay data={patients} loading={loading} />
                    )}
                    {activeResourceType === 'Appointment' && (
                      <AppointmentResultDisplay
                        data={appointments}
                        loading={loading}
                      />
                    )}
                    {activeResourceType === 'Practitioner' && (
                      <PractitionerResultDisplay
                        data={practitioners}
                        loading={loading}
                      />
                    )}
                    {activeResourceType === 'Organization' && (
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

      {showForm && (
        <ModMedFHIRForm
          resourceType={showForm.type}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(null)}
          initialData={showForm.data}
        />
      )}
    </div>
  )
}
