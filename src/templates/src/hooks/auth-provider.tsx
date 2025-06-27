import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AUTH_COMPLETED_EVENT, AUTH_READY_EVENT } from './auth-handler'

type AuthReadyContextType = {
  isAuthReady: boolean
}

const AuthReadyContext = createContext<AuthReadyContextType>({
  isAuthReady: false,
})

export const useAuthReady = () => useContext(AuthReadyContext)

interface AuthReadyProviderProps {
  children: ReactNode
}

export const AuthReadyProvider = ({ children }: AuthReadyProviderProps) => {
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hasToken = urlParams.has('tkn')

    if (hasToken) {
      const handleAuthCompleted = () => {
        setIsAuthReady(true)
      }

      window.addEventListener(AUTH_COMPLETED_EVENT, handleAuthCompleted)

      const timeout = setTimeout(() => {
        setIsAuthReady(true)
      }, 3000)

      return () => {
        window.removeEventListener(AUTH_COMPLETED_EVENT, handleAuthCompleted)
        clearTimeout(timeout)
      }
    } else {
      setIsAuthReady(true)

      const handleAuthReady = () => {
        setIsAuthReady(true)
      }

      window.addEventListener(AUTH_READY_EVENT, handleAuthReady)

      return () => {
        window.removeEventListener(AUTH_READY_EVENT, handleAuthReady)
      }
    }
  }, [])

  return <AuthReadyContext.Provider value={{ isAuthReady }}>{children}</AuthReadyContext.Provider>
}
