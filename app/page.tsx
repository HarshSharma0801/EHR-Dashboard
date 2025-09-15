'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, FileText, Activity, TrendingUp, Clock } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import Link from 'next/link'

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  totalAppointments: number
  totalVitals: number
}

interface RecentAppointment {
  id: string
  patient: {
    firstName: string
    lastName: string
  }
  appointmentTime: string
  providerName: string
  type: string
  status: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    totalVitals: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const today = new Date().toISOString().split('T')[0]
      
      const [patientsResponse, appointmentsResponse, allAppointmentsResponse, vitalsResponse] = await Promise.all([
        fetch('/api/patients?limit=1'),
        fetch(`/api/appointments?date=${today}`),
        fetch('/api/appointments?limit=1'),
        fetch('/api/vitals?limit=1')
      ])
      
      const [patientsData, appointmentsData, allAppointmentsData, vitalsData] = await Promise.all([
        patientsResponse.json(),
        appointmentsResponse.json(),
        allAppointmentsResponse.json(),
        vitalsResponse.json()
      ])
      
      setStats({
        totalPatients: patientsData.total || 0,
        todayAppointments: appointmentsData.total || 0,
        totalAppointments: allAppointmentsData.total || 0,
        totalVitals: vitalsData.data?.length || 0
      })
      
      setRecentAppointments(appointmentsData.data?.slice(0, 4) || [])
    } catch (error) {
      setStats({ totalPatients: 0, todayAppointments: 0, totalAppointments: 0, totalVitals: 0 })
      setRecentAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/patients'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/appointments'
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments.toString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/appointments'
    },
    {
      title: 'Vital Records',
      value: stats.totalVitals.toString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/clinical'
    }
  ]

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </Card>
                ))
              ) : (
                statCards.map((stat, index) => (
                  <Link key={index} href={stat.href}>
                    <Card className="p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                          <p className="text-sm text-gray-500 mt-2">Click to view details</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <Card 
                title="Today's Appointments" 
                subtitle="Upcoming appointments for today"
                action={
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                }
              >
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled for today</p>
                    <Link href="/settings">
                      <Button className="mt-4" size="sm">
                        Seed Sample Data
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.providerName} • {appointment.type}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <Card title="Quick Actions" subtitle="Common tasks and shortcuts">
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/patients">
                    <Button className="h-20 flex-col space-y-2 w-full">
                      <Users className="w-6 h-6" />
                      <span>Patients</span>
                    </Button>
                  </Link>
                  <Link href="/external">
                    <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                      <Calendar className="w-6 h-6" />
                      <span>External APIs</span>
                    </Button>
                  </Link>
                  <Link href="/clinical">
                    <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                      <FileText className="w-6 h-6" />
                      <span>Clinical</span>
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button variant="outline" className="h-20 flex-col space-y-2 w-full">
                      <Activity className="w-6 h-6" />
                      <span>Appointments</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}