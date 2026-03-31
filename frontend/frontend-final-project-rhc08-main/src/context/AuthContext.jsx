import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token'))

  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('user_id')
    const name = localStorage.getItem('user_name')
    const role = localStorage.getItem('user_role')

    if (id && name) {
      return {
        user_id: Number(id),
        user_name: name,
        role: role || "USER"
      }
    }
    return null
  })

  const login = (jwt, userId, userName, role) => {
    localStorage.setItem('jwt_token', jwt)
    localStorage.setItem('user_id', userId)
    localStorage.setItem('user_name', userName)
    localStorage.setItem('user_role', role)

    setToken(jwt)

    setUser({
      user_id: Number(userId),
      user_name: userName,
      role: role
    })
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token
  const isAdmin = user?.role === "ADMIN"

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}