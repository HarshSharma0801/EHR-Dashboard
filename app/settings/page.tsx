'use client'

import { useState, useEffect } from 'react'
import { Save, Database, Server, Settings as SettingsIcon, TestTube } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import TestConnectionModal from '../components/TestConnectionModal'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTestModal, setShowTestModal] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings')
      if (response.data.success) {
        setSettings(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    try {
      const response = await api.post('/api/seed')
      
      if (response.data.success) {
        toast.success(`Database seeded successfully! Created ${response.data.stats.patients} patients, ${response.data.stats.appointments} appointments`)
      } else {
        toast.error('Failed to seed database')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to seed database')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage system configuration and database</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card title="Database Management" subtitle="Manage your database and seed sample data">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Sample Data</h4>
                          <p className="text-sm text-blue-700">Populate your database with sample patients, appointments, and clinical data</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setShowTestModal(true)}>
                            <TestTube className="w-4 h-4 mr-2" />
                            Test Connection
                          </Button>
                          <Button onClick={seedDatabase}>
                            <Database className="w-4 h-4 mr-2" />
                            Seed Database
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Clinic Information" subtitle="Basic clinic configuration">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Clinic Name"
                        value={settings?.clinic?.name || ''}
                        disabled
                      />
                      <Input
                        label="Phone Number"
                        value={settings?.clinic?.phone || ''}
                        disabled
                      />
                    </div>
                    <Input
                      label="Address"
                      value={settings?.clinic?.address || ''}
                      disabled
                    />
                    <Input
                      label="Email"
                      value={settings?.clinic?.email || ''}
                      disabled
                    />
                  </div>
                </Card>

                <Card title="System Configuration" subtitle="Application settings and preferences">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings?.features?.externalIntegration || false}
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">External API Integration</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings?.features?.notifications || false}
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings?.features?.autoBackup || false}
                            disabled
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Automatic Backup</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="API Endpoints" subtitle="Available internal API endpoints">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Patient Management
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• GET /api/patients - List patients</li>
                        <li>• GET /api/patients/[id] - Get patient</li>
                        <li>• POST /api/patients - Create patient</li>
                        <li>• PUT /api/patients/[id] - Update patient</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Appointments
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• GET /api/appointments - List appointments</li>
                        <li>• POST /api/appointments - Create appointment</li>
                        <li>• PUT /api/appointments/[id] - Update</li>
                        <li>• DELETE /api/appointments/[id] - Delete</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Clinical Data
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• GET /api/vitals - Get vital signs</li>
                        <li>• POST /api/vitals - Record vitals</li>
                        <li>• GET /api/clinical - Clinical notes</li>
                        <li>• POST /api/clinical - Add notes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Billing & Reports
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• GET /api/billing - Billing records</li>
                        <li>• GET /api/settings - System settings</li>
                        <li>• POST /api/seed - Seed database</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <TestConnectionModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />
    </div>
  )
}