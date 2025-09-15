'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader, Database, Server } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import api from '../lib/api'

interface TestConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TestResult {
  name: string
  status: 'success' | 'error' | 'loading'
  message: string
  responseTime?: number
}

export default function TestConnectionModal({ isOpen, onClose }: TestConnectionModalProps) {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const runTests = async () => {
    setTesting(true)
    setResults([])

    const tests = [
      { name: 'Database Health', endpoint: '/api/health' },
      { name: 'Patients API', endpoint: '/api/patients?limit=1' },
      { name: 'Appointments API', endpoint: '/api/appointments?limit=1' },
      { name: 'Clinical API', endpoint: '/api/clinical?limit=1' },
      { name: 'Vitals API', endpoint: '/api/vitals?limit=1' }
    ]

    for (const test of tests) {
      setResults(prev => [...prev, { name: test.name, status: 'loading', message: 'Testing...' }])
      
      const startTime = Date.now()
      try {
        const response = await api.get(test.endpoint)
        const responseTime = Date.now() - startTime

        setResults(prev => prev.map(result => 
          result.name === test.name 
            ? {
                name: test.name,
                status: response.data.success ? 'success' : 'error',
                message: response.data.success 
                  ? `✓ Connected successfully (${responseTime}ms)` 
                  : response.data.error || 'Connection failed',
                responseTime
              }
            : result
        ))
      } catch (error: any) {
        const responseTime = Date.now() - startTime
        setResults(prev => prev.map(result => 
          result.name === test.name 
            ? {
                name: test.name,
                status: 'error',
                message: `✗ ${error.response?.data?.error || error.message || 'Connection failed'} (${responseTime}ms)`,
                responseTime
              }
            : result
        ))
      }
    }

    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'loading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Database className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test API Connections" size="lg">
      <div className="space-y-4">
        <p className="text-gray-600">
          Test all API endpoints to verify system connectivity and performance.
        </p>

        <div className="flex justify-between items-center">
          <Button onClick={runTests} disabled={testing}>
            <Server className="w-4 h-4 mr-2" />
            {testing ? 'Testing...' : 'Run Tests'}
          </Button>
          
          {results.length > 0 && (
            <div className="text-sm text-gray-500">
              {results.filter(r => r.status === 'success').length} / {results.length} passed
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className={`text-sm ${
                      result.status === 'success' ? 'text-green-600' : 
                      result.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {result.message}
                    </div>
                  </div>
                </div>
                
                {result.responseTime && (
                  <div className="text-xs text-gray-500">
                    {result.responseTime}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}