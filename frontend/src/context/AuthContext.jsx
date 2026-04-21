import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored)
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser)
        } else {
          localStorage.removeItem('user')
        }
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { accessToken, refreshToken, user: userInfo } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const { accessToken, refreshToken, user: userInfo } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
