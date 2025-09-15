'use client'

import { useState } from 'react'
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Button from './ui/Button'
import Card from './ui/Card'
import NetworkStatus from './NetworkStatus'
import toast from 'react-hot-toast'

export default function ExternalAPITester() {
  const [athenaStatus, setAthenaStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [modmedStatus, setModmedStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [athenaData, setAthenaData] = useState<any>(null)
  const [modmedData, setModmedData] = useState<any>(null)

  const testAthenaAPI = async () => {
    setAthenaStatus('testing')
    try {
      const response = await fetch('/api/external/athena?action=test')
      const result = await response.json()
      
      if (result.success) {
        setAthenaStatus('success')
        setAthenaData(result)
        toast.success('Athena API connection successful!')
      } else {
        setAthenaStatus('error')
        setAthenaData(result)
        toast.error(`Athena API failed: ${result.error}`)
      }
    } catch (error) {
      setAthenaStatus('error')
      setAthenaData({ error: 'Connection failed' })
      toast.error('Athena API connection failed')
    }
  }

  const testModMedAPI = async () => {
    setModmedStatus('testing')
    try {
      const response = await fetch('/api/external/modmed?action=test')
      const result = await response.json()
      
      if (result.success) {
        setModmedStatus('success')
        setModmedData(result)
        toast.success('ModMed API connection successful!')
      } else {
        setModmedStatus('error')
        setModmedData(result)
        toast.error(`ModMed API failed: ${result.error}`)
      }
    } catch (error) {
      setModmedStatus('error')
      setModmedData({ error: 'Connection failed' })
      toast.error('ModMed API connection failed')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <TestTube className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'testing':
        return 'Testing...'
      case 'success':
        return 'Connected'
      case 'error':
        return 'Failed'
      default:
        return 'Not tested'
    }
  }

  return (
    <Card title="External API Testing" subtitle="Test connections to Athena and ModMed APIs">
      <div className="space-y-6">
        {/* Network Status */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Network Status:</span>
          <NetworkStatus />
        </div>
        {/* Athena API */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Athena Health API</h4>
              <p className="text-sm text-gray-500">OAuth2 authentication with client credentials</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(athenaStatus)}
              <span className="text-sm font-medium">{getStatusText(athenaStatus)}</span>
            </div>
          </div>
          
          <Button
            onClick={testAthenaAPI}
            loading={athenaStatus === 'testing'}
            disabled={athenaStatus === 'testing'}
            size="sm"
          >
            Test Athena Connection
          </Button>

          {athenaData && (
            <div className="mt-4 space-y-2">
              {athenaData.data?.mode === 'mock' && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ Running in mock mode - External API unavailable
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(athenaData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ModMed API */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">ModMed API</h4>
              <p className="text-sm text-gray-500">FHIR-based API with API key authentication</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(modmedStatus)}
              <span className="text-sm font-medium">{getStatusText(modmedStatus)}</span>
            </div>
          </div>
          
          <Button
            onClick={testModMedAPI}
            loading={modmedStatus === 'testing'}
            disabled={modmedStatus === 'testing'}
            size="sm"
          >
            Test ModMed Connection
          </Button>

          {modmedData && (
            <div className="mt-4 space-y-2">
              {modmedData.data?.mode === 'mock' && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  ⚠️ Running in mock mode - External API unavailable
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(modmedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* API Status Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Integration Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-blue-800 mb-1">Athena Health</h5>
              <ul className="text-blue-700 space-y-1">
                <li>• OAuth2 Authentication</li>
                <li>• Patient Search & Import</li>
                <li>• Provider Directory</li>
                <li>• Appointment Sync</li>
                <li>• Mock Fallback Available</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-1">ModMed FHIR</h5>
              <ul className="text-blue-700 space-y-1">
                <li>• FHIR R4 Compliant</li>
                <li>• Patient Resources</li>
                <li>• Practitioner Resources</li>
                <li>• Observation Data</li>
                <li>• Mock Fallback Available</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
            💡 <strong>Note:</strong> If external APIs are unavailable due to network/VPN issues, the system automatically uses realistic mock data for testing.
          </div>
        </div>
      </div>
    </Card>
  )
}