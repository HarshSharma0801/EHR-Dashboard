'use client'

import { useState } from 'react'
import { Database, Play, CheckCircle, AlertCircle } from 'lucide-react'
import Button from './ui/Button'
import Card from './ui/Card'
import toast from 'react-hot-toast'

export default function DatabaseSetup() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const seedDatabase = async () => {
    setIsSeeding(true)
    setSeedStatus('idle')
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSeedStatus('success')
        toast.success(`Database seeded successfully! Created ${result.stats.patients} patients with sample data.`)
      } else {
        setSeedStatus('error')
        toast.error(result.error || 'Failed to seed database')
      }
    } catch (error) {
      setSeedStatus('error')
      toast.error('Failed to seed database')
      console.error('Seeding error:', error)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Card title="Database Setup" subtitle="Initialize your database with sample EHR data">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Sample Data Includes:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>5 sample patients with complete demographics</li>
            <li>Multiple appointments per patient</li>
            <li>Allergies and medications</li>
            <li>Vital signs history</li>
            <li>Clinical notes and documentation</li>
          </ul>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={seedDatabase}
            loading={isSeeding}
            disabled={isSeeding}
          >
            <Database className="w-4 h-4 mr-2" />
            {isSeeding ? 'Seeding Database...' : 'Seed Database'}
          </Button>

          {seedStatus === 'success' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Database seeded successfully
            </div>
          )}
          
          {seedStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              Seeding failed
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <strong>Note:</strong> This will clear existing data and create fresh sample data for testing.
        </div>
      </div>
    </Card>
  )
}