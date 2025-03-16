"use client"
import { useRef, useEffect, useState } from "react"
import SignupContent from "@/components/signup-content"

// CLIENT COMPONENT FOR SIGNUP PAGE 📝
export default function SignupPage() {
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
    <SignupContent 
      error={error}
      onResetRef={resetFunctionRef}
    />
  )
} 