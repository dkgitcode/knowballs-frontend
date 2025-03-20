"use client"
import MainContent from "@/components/main-content"
import { useRef } from "react"

export default function Home() {
  // CREATE A REF TO HOLD THE RESET FUNCTION FROM MAIN CONTENT 🔄
  const resetFunctionRef = useRef<(() => void) | null>(null);

  return (
    <MainContent 
      title="Ask me anything..."
      apiBaseUrl="http://localhost:8000"
      initialMode="film"
      onResetRef={resetFunctionRef}
    />
  )
}