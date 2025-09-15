'use client'

import { useState, useEffect } from 'react'
import { Activity, Heart, Thermometer, Weight, Ruler, Plus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ClinicalPage() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [vitals, setVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    respiratoryRate: '',
    oxygenSaturation: ''
  })


  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients', { params: { limit: 20 } })
      if (response.data.success) {
        setPatients(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }))
  }

  const saveVitals = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }

    try {
      const response = await api.post('/api/vitals', {
        patientId: selectedPatient,
        ...vitals
      })

      if (response.data.success) {
        toast.success('Vital signs saved successfully')
        setVitals({
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          heartRate: '',
          temperature: '',
          weight: '',
          height: '',
          respiratoryRate: '',
          oxygenSaturation: ''
        })
        fetchRecentVitals()
      } else {
        toast.error('Failed to save vital signs')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error saving vital signs')
    }
  }



  const [recentVitals, setRecentVitals] = useState<any[]>([])

  useEffect(() => {
    fetchRecentVitals()
  }, [])

  const fetchRecentVitals = async () => {
    try {
      const response = await api.get('/api/vitals', { params: { limit: 5 } })
      if (response.data.success) {
        setRecentVitals(response.data.data)
      }
    } catch (error) {
      setRecentVitals([])
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Clinical Operations</h1>
              <p className="text-gray-600 mt-2">Record vital signs and clinical notes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vital Signs Entry */}
              <Card title="Record Vital Signs" subtitle="Enter patient vital signs">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a patient...</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Systolic BP"
                      placeholder="120"
                      value={vitals.bloodPressureSystolic}
                      onChange={(e) => handleVitalChange('bloodPressureSystolic', e.target.value)}
                    />
                    <Input
                      label="Diastolic BP"
                      placeholder="80"
                      value={vitals.bloodPressureDiastolic}
                      onChange={(e) => handleVitalChange('bloodPressureDiastolic', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Heart Rate (bpm)"
                      placeholder="72"
                      value={vitals.heartRate}
                      onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                    />
                    <Input
                      label="Temperature (°F)"
                      placeholder="98.6"
                      value={vitals.temperature}
                      onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Weight (lbs)"
                      placeholder="150"
                      value={vitals.weight}
                      onChange={(e) => handleVitalChange('weight', e.target.value)}
                    />
                    <Input
                      label="Height (in)"
                      placeholder="68"
                      value={vitals.height}
                      onChange={(e) => handleVitalChange('height', e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={saveVitals} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Save Vital Signs
                  </Button>
                </div>
              </Card>

              {/* Recent Vitals */}
              <Card title="Recent Vital Signs" subtitle="Latest recorded vitals">
                <div className="space-y-4">
                  {recentVitals.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent vital signs recorded</p>
                  ) : (
                    recentVitals.map((vital) => (
                      <div key={vital.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {vital.patient?.firstName} {vital.patient?.lastName}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(vital.recordedDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                            <div className="flex items-center">
                              <Activity className="w-4 h-4 text-red-500 mr-2" />
                              <span>BP: {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</span>
                            </div>
                          )}
                          {vital.heartRate && (
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 text-pink-500 mr-2" />
                              <span>HR: {vital.heartRate} bpm</span>
                            </div>
                          )}
                          {vital.temperature && (
                            <div className="flex items-center">
                              <Thermometer className="w-4 h-4 text-orange-500 mr-2" />
                              <span>Temp: {vital.temperature}°F</span>
                            </div>
                          )}
                          {vital.weight && (
                            <div className="flex items-center">
                              <Weight className="w-4 h-4 text-blue-500 mr-2" />
                              <span>Weight: {vital.weight} lbs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Clinical Notes */}
            <Card title="Clinical Notes" subtitle="Add clinical documentation" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Patient"
                    placeholder="Search and select patient..."
                  />
                  <select className="input-field">
                    <option value="">Select Note Type</option>
                    <option value="progress">Progress Note</option>
                    <option value="assessment">Assessment</option>
                    <option value="plan">Treatment Plan</option>
                    <option value="soap">SOAP Note</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinical Notes
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter clinical notes and observations..."
                  />
                </div>
                
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Clinical Note
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}