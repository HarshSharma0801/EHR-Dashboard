'use client'

import { useState } from 'react'
import { Save, X } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'

interface FHIRFormProps {
  resourceType: 'Patient' | 'Appointment' | 'Organization'
  onSubmit: (data: any, operation: 'CREATE' | 'UPDATE') => void
  onCancel: () => void
  initialData?: any
}

type FormData = {
  resourceType: string
  [key: string]: any
}

export default function ModMedFHIRForm({ resourceType, onSubmit, onCancel, initialData }: FHIRFormProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    if (resourceType === 'Patient') {
      return {
        resourceType: 'Patient',
        name: [{ given: [''], family: '' }],
        gender: 'unknown',
        birthDate: '',
        telecom: [
          { system: 'phone', value: '' },
          { system: 'email', value: '' }
        ]
      }
    } else if (resourceType === 'Appointment') {
      return {
        resourceType: 'Appointment',
        status: 'booked',
        start: '',
        end: '',
        participant: [{ actor: { display: '' } }],
        serviceType: [{ text: '' }]
      }
    } else {
      return {
        resourceType: 'Organization',
        name: '',
        type: [{ text: 'Healthcare Provider' }],
        telecom: [{ system: 'phone', value: '' }]
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, initialData ? 'UPDATE' : 'CREATE')
  }

  const updateField = (path: string, value: any) => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (key.includes('[') && key.includes(']')) {
          const [arrayKey, indexStr] = key.split('[')
          const index = parseInt(indexStr.replace(']', ''))
          current = current[arrayKey][index]
        } else {
          current = current[key]
        }
      }
      
      const lastKey = keys[keys.length - 1]
      if (lastKey.includes('[') && lastKey.includes(']')) {
        const [arrayKey, indexStr] = lastKey.split('[')
        const index = parseInt(indexStr.replace(']', ''))
        current[arrayKey][index] = value
      } else {
        current[lastKey] = value
      }
      
      return newData
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Update' : 'Create'} {resourceType}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {resourceType === 'Patient' && (
            <>
              <Input
                label="First Name"
                value={formData.name?.[0]?.given?.[0] || ''}
                onChange={(e) => updateField('name[0].given[0]', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.name?.[0]?.family || ''}
                onChange={(e) => updateField('name[0].family', e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender || 'unknown'}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <Input
                label="Birth Date"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => updateField('birthDate', e.target.value)}
              />
              <Input
                label="Phone"
                value={formData.telecom?.[0]?.value || ''}
                onChange={(e) => updateField('telecom[0].value', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={formData.telecom?.[1]?.value || ''}
                onChange={(e) => updateField('telecom[1].value', e.target.value)}
              />
            </>
          )}

          {resourceType === 'Appointment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'booked'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="booked">Booked</option>
                  <option value="pending">Pending</option>
                  <option value="arrived">Arrived</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={formData.start || ''}
                onChange={(e) => updateField('start', e.target.value)}
                required
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={formData.end || ''}
                onChange={(e) => updateField('end', e.target.value)}
              />
              <Input
                label="Patient Name"
                value={formData.participant?.[0]?.actor?.display || ''}
                onChange={(e) => updateField('participant[0].actor.display', e.target.value)}
                required
              />
              <Input
                label="Service Type"
                value={formData.serviceType?.[0]?.text || ''}
                onChange={(e) => updateField('serviceType[0].text', e.target.value)}
                placeholder="e.g., Consultation, Follow-up"
              />
            </>
          )}

          {resourceType === 'Organization' && (
            <>
              <Input
                label="Organization Name"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
              <Input
                label="Type"
                value={formData.type?.[0]?.text || ''}
                onChange={(e) => updateField('type[0].text', e.target.value)}
                placeholder="e.g., Hospital, Clinic, Insurance"
              />
              <Input
                label="Phone"
                value={formData.telecom?.[0]?.value || ''}
                onChange={(e) => updateField('telecom[0].value', e.target.value)}
              />
            </>
          )}

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}