'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        // Test basic internet connectivity
        const response = await fetch('https://httpbin.org/get', { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        })
        
        if (response.ok) {
          setIsOnline(true)
          setApiStatus('online')
        } else {
          setIsOnline(false)
          setApiStatus('offline')
        }
      } catch (error) {
        setIsOnline(false)
        setApiStatus('offline')
      }
    }

    checkConnectivity()
    const interval = setInterval(checkConnectivity, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (apiStatus === 'checking') {
    return (
      <div className="flex items-center text-yellow-600 text-sm">
        <AlertCircle className="w-4 h-4 mr-1" />
        Checking connectivity...
      </div>
    )
  }

  return (
    <div className={`flex items-center text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 mr-1" />
          Online - External APIs available
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 mr-1" />
          Offline - Using mock data
        </>
      )}
    </div>
  )
}