"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const CREDENTIALS = {
  username: "Hauster1",
  password: "Hauster.ventas",
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = localStorage.getItem("hauster_auth")
    setIsAuthenticated(authStatus === "true")
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      localStorage.setItem("hauster_auth", "true")
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("hauster_auth")
    setIsAuthenticated(false)
    router.push("/login")
  }

  return { isAuthenticated, isLoading, login, logout }
}
