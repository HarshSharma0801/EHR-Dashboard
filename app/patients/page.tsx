'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Eye, Phone, Mail, Download, ExternalLink } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import PatientForm from '../components/forms/PatientForm'
import { Patient } from '../types'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [searchTerm])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      
      const response = await api.get('/api/patients', { params })
      
      if (response.data.success) {
        setPatients(response.data.data)
      }
    } catch (error) {
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'Male'
      case 'FEMALE': return 'Female'
      case 'OTHER': return 'Other'
      default: return gender
    }
  }



  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-600 mt-2">Manage patient records and information</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <Card className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patients by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Patient
                  </Button>
                </div>

              </div>
            </Card>

            <Card>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No patients found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Age</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Gender</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                DOB: {formatDate(patient.dateOfBirth)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            {calculateAge(patient.dateOfBirth)}
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            {getGenderDisplay(patient.gender)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              {patient.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {patient.phone}
                                </div>
                              )}
                              {patient.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {patient.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
      
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Patient"
        size="lg"
      >
        <PatientForm
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPatients}
        />
      </Modal>
    </div>
  )
}