// Simple in-memory cache for API responses
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 1000

  set(key: string, data: any, ttlMinutes: number = 5) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string) {
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    })
  }
}

export const apiCache = new APICache()

export const getCacheKey = (endpoint: string, params?: Record<string, any>) => {
  const paramString = params ? JSON.stringify(params, Object.keys(params).sort()) : ''
  return `${endpoint}:${paramString}`
}

export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes: number = 5
): Promise<T> => {
  const cached = apiCache.get(key)
  if (cached) return cached
  
  const result = await fetcher()
  apiCache.set(key, result, ttlMinutes)
  return result
}