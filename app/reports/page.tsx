'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, Activity, Download, Filter } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface ReportData {
  totalPatients: number
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  averageVisitDuration: number
  patientsByGender: { male: number; female: number; other: number }
  appointmentsByType: { [key: string]: number }
  monthlyStats: { month: string; appointments: number; revenue: number }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      const [patientsRes, appointmentsRes, vitalsRes] = await Promise.all([
        fetch('/api/patients?limit=1000'),
        fetch('/api/appointments?limit=1000'),
        fetch('/api/vitals?limit=100')
      ])

      const [patientsData, appointmentsData, vitalsData] = await Promise.all([
        patientsRes.json(),
        appointmentsRes.json(),
        vitalsRes.json()
      ])

      if (patientsData.success && appointmentsData.success) {
        const patients = patientsData.data || []
        const appointments = appointmentsData.data || []
        
        const completedAppointments = appointments.filter((apt: any) => apt.status === 'COMPLETED').length
        const cancelledAppointments = appointments.filter((apt: any) => apt.status === 'CANCELLED').length
        
        const patientsByGender = patients.reduce((acc: any, patient: any) => {
          const gender = patient.gender.toLowerCase()
          acc[gender] = (acc[gender] || 0) + 1
          return acc
        }, { male: 0, female: 0, other: 0 })

        const appointmentsByType = appointments.reduce((acc: any, apt: any) => {
          acc[apt.type] = (acc[apt.type] || 0) + 1
          return acc
        }, {})

        const totalRevenue = appointments.length * 150
        const averageVisitDuration = appointments.reduce((sum: number, apt: any) => sum + (apt.duration || 30), 0) / appointments.length || 0

        const monthlyStats = generateMonthlyStats(appointments)

        setReportData({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          completedAppointments,
          cancelledAppointments,
          totalRevenue,
          averageVisitDuration,
          patientsByGender,
          appointmentsByType,
          monthlyStats
        })
      }
    } catch (error) {
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyStats = (appointments: any[]) => {
    const monthlyData: { [key: string]: { appointments: number; revenue: number } } = {}
    
    appointments.forEach(apt => {
      const date = new Date(apt.appointmentDate)
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { appointments: 0, revenue: 0 }
      }
      
      monthlyData[monthKey].appointments += 1
      monthlyData[monthKey].revenue += 150
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </main>
        </div>
      </div>
    )
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
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-2">Comprehensive insights into your practice</p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Patients</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.totalPatients}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-50">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.totalAppointments}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.totalRevenue)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-50">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Visit Duration</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(reportData.averageVisitDuration)}m</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card title="Appointment Status" subtitle="Breakdown of appointment statuses">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Completed</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(reportData.completedAppointments / reportData.totalAppointments) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{reportData.completedAppointments}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Cancelled</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(reportData.cancelledAppointments / reportData.totalAppointments) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{reportData.cancelledAppointments}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Patient Demographics" subtitle="Patient distribution by gender">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Male</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(reportData.patientsByGender.male / reportData.totalPatients) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{reportData.patientsByGender.male}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Female</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-pink-600 h-2 rounded-full" 
                              style={{ width: `${(reportData.patientsByGender.female / reportData.totalPatients) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{reportData.patientsByGender.female}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Appointment Types" subtitle="Most common appointment types">
                    <div className="space-y-3">
                      {Object.entries(reportData.appointmentsByType)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{type}</span>
                            <span className="text-sm font-semibold">{count as number}</span>
                          </div>
                        ))}
                    </div>
                  </Card>

                  <Card title="Monthly Trends" subtitle="Appointments and revenue over time">
                    <div className="space-y-3">
                      {reportData.monthlyStats.map((stat) => (
                        <div key={stat.month} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">{stat.month}</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{stat.appointments} appointments</div>
                            <div className="text-xs text-gray-500">{formatCurrency(stat.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}