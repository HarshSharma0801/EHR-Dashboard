'use client'

import { useState, useEffect } from 'react'
import { DollarSign, FileText, Calendar, User, CreditCard, Download } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../lib/api'

interface BillingRecord {
  id: string
  patientId: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  type: string
  duration: number
  providerName: string
  status: string
  amount: number
  billingStatus: string
}

export default function BillingPage() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    fetchBillingData()
  }, [selectedStatus])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedStatus !== 'all') params.status = selectedStatus
      
      const response = await api.get('/api/billing', { params })
      
      if (response.data.success) {
        setBillingRecords(response.data.data)
      }
    } catch (error) {
      setBillingRecords([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalAmount = billingRecords.reduce((sum, record) => sum + record.amount, 0)
  const paidAmount = billingRecords
    .filter(record => record.billingStatus.toLowerCase() === 'paid')
    .reduce((sum, record) => sum + record.amount, 0)
  const pendingAmount = totalAmount - paidAmount

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing & Insurance</h1>
                <p className="text-gray-600 mt-2">Manage billing records and insurance claims</p>
              </div>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(paidAmount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{formatCurrency(pendingAmount)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                  <div className="flex space-x-2">
                    {['all', 'pending', 'paid', 'overdue'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {billingRecords.length} records
                </div>
              </div>
            </Card>

            <Card>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : billingRecords.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No billing records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Service</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Provider</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <User className="w-8 h-8 text-gray-400 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">{record.patientName}</div>
                                <div className="text-sm text-gray-500">ID: {record.patientId.slice(-8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-gray-900">{formatDate(record.appointmentDate)}</div>
                                <div className="text-sm text-gray-500">{record.appointmentTime}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{record.type}</div>
                              <div className="text-sm text-gray-500">{record.duration} minutes</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900">{record.providerName}</td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-900">{formatCurrency(record.amount)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.billingStatus)}`}>
                              {record.billingStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                Edit
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
    </div>
  )
}