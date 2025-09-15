'use client'

import { useState, useEffect } from 'react'
import { Save, X, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'

interface AppointmentFormProps {
  onClose: () => void
  onSuccess: () => void
  selectedDate?: string
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  phone?: string
}

export default function AppointmentForm({ onClose, onSuccess, selectedDate }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    appointmentDate: selectedDate || new Date().toISOString().split('T')[0],
    appointmentTime: '09:00',
    duration: 30,
    type: 'Consultation',
    providerName: 'Dr. Smith',
    notes: ''
  })

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchPatients()
    } else {
      setPatients([])
    }
  }, [searchTerm])

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients', {
        params: { search: searchTerm, limit: 10 }
      })
      if (response.data.success) {
        setPatients(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch patients')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/appointments', {
        patientId: selectedPatient.id,
        ...formData
      })
      
      if (response.data.success) {
        toast.success('Appointment scheduled successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(response.data.error || 'Failed to schedule appointment')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule appointment')
    } finally {
      setLoading(false)
    }
  }

  const appointmentTypes = [
    'Consultation',
    'Follow-up',
    'Check-up',
    'Procedure',
    'Emergency',
    'Vaccination'
  ]

  const timeSlots = []
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : searchTerm}
              onChange={(e) => {
                if (!selectedPatient) {
                  setSearchTerm(e.target.value)
                }
              }}
              onFocus={() => {
                if (selectedPatient) {
                  setSelectedPatient(null)
                  setSearchTerm('')
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          {patients.length > 0 && !selectedPatient && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patient)
                    setPatients([])
                    setSearchTerm('')
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                  {patient.phone && (
                    <div className="text-sm text-gray-500">{patient.phone}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date *"
          type="date"
          value={formData.appointmentDate}
          onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
          <select
            value={formData.appointmentTime}
            onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {appointmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Provider"
        value={formData.providerName}
        onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Additional notes or instructions..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Scheduling...' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  )
}