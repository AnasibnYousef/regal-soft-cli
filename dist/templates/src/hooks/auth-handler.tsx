import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

export const AUTH_READY_EVENT = 'authReady'
export const AUTH_COMPLETED_EVENT = 'authCompleted'

export let isAuthInProgress = false

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = `${
    import.meta.env.VITE_PUBLIC_ACCOUNTS_DOMAIN
  }/logout?redirect_url=${encodeURIComponent(window.location.href)}`
}

const exchangeToken = async (refreshToken: string) => {
  const response = await axios.post(`${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`, {
    refresh_token: refreshToken,
  })

  return {
    access_token: response.data.access_token,
    refresh_token: refreshToken,
  }
}

const AuthHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const refreshToken = searchParams.get('tkn')

  useEffect(() => {
    if (refreshToken) {
      isAuthInProgress = true
      window.dispatchEvent(new Event(AUTH_READY_EVENT))
    } else {
      window.dispatchEvent(new Event(AUTH_READY_EVENT))
    }
  }, [])

  const { mutateAsync: exchangeTokenMutate } = useMutation({
    mutationFn: exchangeToken,
    onSuccess: data => {
      localStorage.setItem('accessToken', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)

      isAuthInProgress = false
      window.dispatchEvent(new Event(AUTH_COMPLETED_EVENT))

      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('tkn')
      setSearchParams(newSearchParams, { replace: true })
    },
    onError: () => {
      isAuthInProgress = false
      console.error('Authentication failed')
      logout()
    },
  })

  useEffect(() => {
    if (!refreshToken) return

    exchangeTokenMutate(refreshToken).catch(() => {
      isAuthInProgress = false
      logout()
    })
  }, [refreshToken, exchangeTokenMutate, setSearchParams])

  return null
}

export default AuthHandler
