import { logout, isAuthInProgress, AUTH_COMPLETED_EVENT } from '@/hooks/auth-handler'
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface TokenResponse {
  access_token: string
  refresh_token: string
}

let authEventsInitialized = false
const pendingRequests: (() => void)[] = []

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname.includes('${moduleName}.regal-soft.in')

    if (!isProduction) {
      const devEndpoint = localStorage.getItem('dev-endpoint')
      if (devEndpoint) {
        return devEndpoint.endsWith('/') ? devEndpoint : `${devEndpoint}/`
      }
    }
  }

  return `${import.meta.env.VITE_PUBLIC_API_URL}/`
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

const getAccessToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('accessToken')
  return token
}

const getRefreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('refreshToken')
  return token
}

const saveTokens = async (access_token: string, refresh_token: string): Promise<void> => {
  localStorage.setItem('accessToken', access_token)
  localStorage.setItem('refreshToken', refresh_token)
}

const hasTokenInUrl = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.has('tkn')
}

const processPendingRequests = () => {
  while (pendingRequests.length > 0) {
    const request = pendingRequests.shift()
    if (request) request()
  }
}

if (!authEventsInitialized) {
  window.addEventListener(AUTH_COMPLETED_EVENT, processPendingRequests)
  authEventsInitialized = true
}

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.url?.includes('auth/')) {
      return config
    }

    if (isAuthInProgress && hasTokenInUrl()) {
      return new Promise(resolve => {
        pendingRequests.push(() => resolve(config))
      })
    }

    const token = await getAccessToken()
    if (!token) {
      const refresh_token = await getRefreshToken()
      if (refresh_token) {
        try {
          const response = await axios.post<TokenResponse>(
            `${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`,
            { refresh_token }
          )
          const { access_token } = response.data
          await saveTokens(access_token, refresh_token)
          config.headers.Authorization = `Bearer ${access_token}`
        } catch (err) {
          if (!hasTokenInUrl()) {
            logout()
          }
          return Promise.reject(err)
        }
      } else {
        if (!hasTokenInUrl() && !isAuthInProgress) {
          logout()
          return Promise.reject(new Error('No refresh token available'))
        }
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refresh_token = await getRefreshToken()
        if (!refresh_token) {
          if (!hasTokenInUrl() && !isAuthInProgress) {
            logout()
          }
          return Promise.reject(error)
        }

        const response = await axios.post<TokenResponse>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`,
          { refresh_token }
        )
        const { access_token } = response.data
        await saveTokens(access_token, refresh_token)

        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return apiClient(originalRequest)
      } catch (err) {
        if (!hasTokenInUrl() && !isAuthInProgress) {
          logout()
        }
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
