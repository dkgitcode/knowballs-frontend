"use client"
import { useRef, useEffect, useState } from "react"
import LoginContent from "@/components/login-content"

// CLIENT COMPONENT FOR LOGIN PAGE 🔐
export default function LoginPage() {
  const [error, setError] = useState<string | undefined>(undefined)
  const resetFunctionRef = useRef<(() => void) | null>(null)
  
  // CHECK URL PARAMETERS FOR ERROR MESSAGE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    if (errorParam) {
      setError(errorParam)
    }
  }, [])

  return (
    <LoginContent 
      error={error}
      onResetRef={resetFunctionRef}
    />
  )
} 